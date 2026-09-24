import { prisma } from "../lib/prisma.js";
import { getWeatherData } from "./weather.service.js";
import { generateWeatherAlerts, } from "../utils/generate-weather-alert.utils.js";
import {
    sendNotificationToFarmer,
    shouldSendWeatherNotification,
    shouldCheckLocationWeather,
    updateWeatherLocationCheck
} from "./notification.service.js";
import { getSetting } from "./system-setting.service.js";


// Get Location
const getLocationKey = (latitude: number, longitude: number) => {
    return `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
};


// Process Notificaiton
export const processWeatherNotifications = async () => {

    console.log("Starting weather notification process...");

    const settings = await getSetting("weather_notification_settings",
        {
            cooldown: 12,
            cooldownUnit: "hours",
        });

    const fields = await prisma.field.findMany({
        where: {
            latitude: {
                not: null,
            },

            longitude: {
                not: null,
            },
        },

        select: {
            id: true,
            city: true,
            latitude: true,
            longitude: true,
            farmer: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (fields.length === 0) {
        console.log("No fields with location found.");
        return;
    }

    // Group fields by geographical location
    const locationGroups = new Map<string, typeof fields>();

    for (const field of fields) {

        if (field.latitude === null || field.longitude === null) {
            continue;
        }

        const locationKey = getLocationKey(field.latitude, field.longitude);

        if (!locationGroups.has(locationKey)) {
            locationGroups.set(locationKey, []);
        }
        locationGroups.get(locationKey)!.push(field);
    }

    console.log(`Weather locations: ${locationGroups.size}`);

    // Process each geographical location
    for (const [locationKey, locationFields] of locationGroups) {
        try {
            // const shouldCheckWeather = await shouldCheckLocationWeather({
            //     locationKey,
            //     cooldown: settings.cooldown,
            //     cooldownUnit: settings.cooldownUnit as "minutes" | "hours",
            // });

            // if (!shouldCheckWeather) {
            //     console.log(`Skipping weather fetch for ${locationKey}. Notification cooldown is still active.`);
            //     continue;
            // }


            const firstField = locationFields[0];
            const weather = await getWeatherData({
                latitude: firstField.latitude!,
                longitude: firstField.longitude!
            });

            // Update last successful weather check
            // await updateWeatherLocationCheck({
            //     locationKey,
            //     city: weather.city,
            // });

            console.log(`Weather fetched: ${weather.city} (${locationKey})`);

            const alerts = await generateWeatherAlerts(weather);

            if (alerts.length === 0) {
                continue;
            }

            // Get unique farmers
            const farmerIds = new Set(locationFields.map(field => field.farmer.id));

            for (const farmerId of farmerIds) {

                for (const alert of alerts) {

                    const alertKey = `${alert.type}_${locationKey}_${alert.priority}`;

                    const shouldSend = await shouldSendWeatherNotification({
                        farmerId,
                        type: alert.type,
                        city: weather.city,
                        alertKey,
                        cooldown: settings.cooldown,
                        cooldownUnit: settings.cooldownUnit as "minutes" | "hours",
                    });

                    if (!shouldSend) {
                        continue;
                    }

                    await sendNotificationToFarmer({
                        farmerId,
                        type: alert.type,
                        priority: alert.priority,
                        title: alert.title,
                        message: alert.message,
                        city: weather.city,
                        data: {
                            locationKey,
                            alertKey,
                            temperature: String(weather.temperature),
                            rainProbability: String(weather.rainProbability),
                            windSpeed: String(weather.windSpeed),
                        },
                    });
                }
            }

        } catch (error) {
            console.error(`Weather notification failed for ${locationKey}:`, error);
        }
    }
    console.log("Weather notification process completed.");
};