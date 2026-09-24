import { DevicePlatform } from "../../generated/prisma/enums.js";



// ------------  Notification Types -------------

export interface PushNotification {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}


export interface SendNotificationToFarmer {
    farmerId: string;
    type:
    | "WEATHER"
    | "RAIN"
    | "TEMPERATURE"
    | "WIND"
    | "HUMIDITY"
    | "CROP"
    | "SOIL_MOISTURE"
    | "SYSTEM";
    priority: "LOW" | "NORMAL" | "HIGH";
    title: string;
    message: string;
    city?: string;
    fieldId?: string;
    dedupeKey?: string;
    data?: Record<string, string>;
}

export interface RegisterPushToken {
    farmerId: string;
    token: string;
    platform: DevicePlatform;
}


export interface WeatherCondition {
    temperature?: number;
    humidity?: number;
    rainfall?: number;
    rainProbability?: number;
    windSpeed?: number;
    weather?: string;
}

export interface WeatherAlert {
    type:
    | "RAIN"
    | "TEMPERATURE"
    | "WIND"
    | "HUMIDITY"
    | "WEATHER";

    priority:
    | "LOW"
    | "NORMAL"
    | "HIGH";

    title: string;
    message: string;
}

// Weather Aleat Thresholds used in Utils 
export interface WeatherAlertThresholds {
    rainHighThreshold: number;
    rainNormalThreshold: number;

    extremeTemperatureThreshold: number;
    highTemperatureThreshold: number;

    windThreshold: number;
}

export type CooldownUnit = "minutes" | "hours" | string;

export interface ShouldSendWeatherNotificationOptions {
    farmerId: string;
    type: string;
    city?: string;
    alertKey: string;
    cooldown?: number;
    cooldownUnit?: CooldownUnit;
}