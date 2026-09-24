import { WeatherAlert, WeatherCondition } from "../types/notification.types";
import { getSetting } from "../services/system-setting.service";
import { WeatherAlertThresholds } from "../types/notification.types";

export const generateWeatherAlerts = async (
    weather: WeatherCondition
): Promise<WeatherAlert[]> => {

    // Fetch Trashholds
    const thresholds = await getSetting<WeatherAlertThresholds>(
        "weather_alert_thresholds",
        {
            rainHighThreshold: 80,
            rainNormalThreshold: 20,
            extremeTemperatureThreshold: 38,
            highTemperatureThreshold: 30,
            windThreshold: 35,
        }
    );

    const alerts: WeatherAlert[] = [];

    // Rain
    if (
        weather.rainProbability !== undefined &&
        weather.rainProbability >= thresholds.rainHighThreshold
    ) {

        alerts.push({
            type: "RAIN",
            priority: "HIGH",
            title: "🌧️ High Chance of Rain",
            message:
                `There is an ${weather.rainProbability}% chance of rain. ` +
                `Consider postponing irrigation and protecting harvested crops.`,
        });

    } else if (
        weather.rainProbability !== undefined &&
        weather.rainProbability >= thresholds.rainNormalThreshold
    ) {

        alerts.push({
            type: "RAIN",
            priority: "NORMAL",
            title: "🌦️ Rain Expected",
            message: `There is an ${weather.rainProbability}% chance of rain today.`,
        });
    }


    // Temperature
    if (
        weather.temperature !== undefined &&
        weather.temperature >= thresholds.extremeTemperatureThreshold
    ) {

        alerts.push({
            type: "TEMPERATURE",
            priority: "HIGH",
            title: "🔥 Extreme Temperature",
            message:
                `Temperature may reach ${weather.temperature}°C. ` +
                `Consider increasing crop monitoring and irrigation.`,
        });

    } else if (
        weather.temperature !== undefined &&
        weather.temperature >= thresholds.highTemperatureThreshold
    ) {

        alerts.push({
            type: "TEMPERATURE",
            priority: "NORMAL",
            title: "🌡️ High Temperature",
            message:
                `Temperature is expected to reach ${weather.temperature}°C.`,
        });
    }

    // Wind
    if (
        weather.windSpeed !== undefined &&
        weather.windSpeed >= thresholds.windThreshold
    ) {

        alerts.push({
            type: "WIND",
            priority: "HIGH",
            title: "💨 Strong Wind Expected",
            message:
                `Wind speed may reach ${weather.windSpeed} km/h. ` +
                `Check vulnerable crops and structures.`,
        });
    }


    return alerts;
};