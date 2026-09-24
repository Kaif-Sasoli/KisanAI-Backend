import { prisma } from "../lib/prisma.js";
import { DevicePlatform } from "../../generated/prisma/enums.js";
import { sendPushNotification } from "./firebase.service.js";
import type {
    RegisterPushToken,
    SendNotificationToFarmer,
    ShouldSendWeatherNotificationOptions
} from "../types/notification.types.js";


/**
 * Registers or updates a farmer's push notification device token.
 */
export const registerPushToken = async ({
    farmerId,
    token,
    platform,
}: RegisterPushToken) => {

    return prisma.pushToken.upsert({
        where: {
            token,
        },

        update: {
            farmerId,
            platform,
            isActive: true,
            updatedAt: new Date(),
        },

        create: {
            farmerId,
            token,
            platform,
        },
    });
};


/**
 * Creates a notification for a farmer and sends it
 * to all of the farmer's active devices.
 */
export const sendNotificationToFarmer = async ({
    farmerId,
    type,
    priority,
    title,
    message,
    city,
    dedupeKey,
    data = {},
}: SendNotificationToFarmer) => {

    // Generate a unique key
    const notificationDedupeKey =
        dedupeKey ?? `${type}_${Date.now()}_${crypto.randomUUID()}`;


    // Save notification in database
    const notification = await prisma.notification.create({
        data: {
            farmerId,
            type,
            priority,
            title,
            message,
            city,
            dedupeKey: notificationDedupeKey,
            data,
        },
    });

    // Get all active devices of farmer
    const tokens = await prisma.pushToken.findMany({
        where: {
            farmerId,
            isActive: true,
        },
        select: {
            token: true,
        },
    });

    // Send notification 
    await Promise.all(tokens.map(async ({ token }) => {
        const result = await sendPushNotification({
            token,
            title,
            body: message,
            data: {
                notificationId: notification.id,
                type,
                ...data,
            },
        });

        if (!result.success) {
            console.log(`Failed to send notification to token ${token}`);
        }
    })
    );

    return notification;
};


export const shouldSendWeatherNotification = async ({
    farmerId,
    type,
    city,
    alertKey,
    cooldown = 12,
    cooldownUnit = "hours",
}: ShouldSendWeatherNotificationOptions) => {

    const cooldownMs = cooldownUnit === "hours"
        ? cooldown * 60 * 60 * 1000
        : cooldown * 60 * 1000;

    const since = new Date(Date.now() - cooldownMs);

    // Find Notification
    const existing = await prisma.notification.findFirst({
        where: {
            farmerId,
            type: type as any,
            city,
            createdAt: {
                gte: since,
            },
            data: {
                path: ["alertKey"],
                equals: alertKey,
            },
        },
    });

    return !existing;
};


// Check whether weather API can be called for a location
export const shouldCheckLocationWeather = async ({
    locationKey,
    city,
    cooldown,
    cooldownUnit,
}: {
    locationKey: string;
    city?: string;
    cooldown: number;
    cooldownUnit: "minutes" | "hours";
}) => {

    const locationCheck = await prisma.weatherLocationCheck.findUnique({
        where: {
            locationKey,
        },
    });

    // No record means this location has never been checked
    if (!locationCheck) {
        await prisma.weatherLocationCheck.create({
            data: {
                locationKey,
                city,
                lastCheckedAt: new Date(),
            },
        });

        return true;
    }

    const cooldownMs = cooldownUnit === "hours"
        ? cooldown * 60 * 60 * 1000
        : cooldown * 60 * 1000;

    const nextAllowedTime = locationCheck.lastCheckedAt!.getTime() + cooldownMs;
    const now = Date.now();

    return now >= nextAllowedTime;
};


// Update the last weather API check time
export const updateWeatherLocationCheck = async ({
    locationKey,
    city,
}: {
    locationKey: string;
    city?: string;
}) => {

    return prisma.weatherLocationCheck.upsert({
        where: {
            locationKey,
        },

        update: {
            city,
            lastCheckedAt: new Date(),
        },

        create: {
            locationKey,
            city,
            lastCheckedAt: new Date(),
        },
    });
};

// Test Notification
export const processTestNotifications = async () => {
    console.log("Starting test notification job...");

    try {
        const farmers = await prisma.farmer.findMany({
            where: {
                pushTokens: {
                    some: {
                        isActive: true,
                    },
                },
            },
            select: {
                id: true,
            },
        });

        console.log(`Found ${farmers.length} farmer(s) with active devices.`);

        for (const farmer of farmers) {
            await sendNotificationToFarmer({
                farmerId: farmer.id,

                type: "SYSTEM",

                priority: "NORMAL",

                title: "KisanApp Test Notification",

                message:
                    "This is a test push notification from KisanApp.",

                data: {
                    test: "true",
                    source: "local-backend",
                },
            });
        }

        console.log("Test notification job completed.");

    } catch (error) {
        console.error(
            "Test notification job failed:",
            error
        );
    }
};