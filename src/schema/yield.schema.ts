import { z } from "zod";
import {
    Season,
    SoilType,
    IrrigationType,
} from "../../generated/prisma/enums.js";

export const yieldSchema = z.object({
    cropId: z.string().uuid(),

    N: z.number(),
    P: z.number(),
    K: z.number(),

    Soil_pH: z.number(),
    Soil_Moisture: z.number(),
    Organic_Carbon: z.number(),

    Temperature: z.number(),
    Humidity: z.number(),
    Rainfall: z.number(),
    Sunlight_Hours: z.number(),
    Wind_Speed: z.number(),
    Altitude: z.number(),

    Fertilizer_Used: z.number(),
    Pesticide_Used: z.number(),

    Season: z.enum(Season),
    Soil_Type: z.enum(SoilType),
    Region: z.string().min(1),
    Crop_Type: z.string().min(1),
    Irrigation_Type: z.enum(IrrigationType),
});



export const predictYieldSchema = z.object({
    N: z.number(),
    P: z.number(),
    K: z.number(),

    Soil_pH: z.number(),
    Soil_Moisture: z.number(),
    Organic_Carbon: z.number(),

    Temperature: z.number(),
    Humidity: z.number(),
    Rainfall: z.number(),
    Sunlight_Hours: z.number(),
    Wind_Speed: z.number(),
    Altitude: z.number(),

    Fertilizer_Used: z.number(),
    Pesticide_Used: z.number(),

    Season: z.enum(Season),
    Soil_Type: z.enum(SoilType),
    Region: z.string().min(1),
    Crop_Type: z.string().min(1),
    Irrigation_Type: z.enum(IrrigationType),
});


export const predictYieldSchema_ = z.object({
    cropId: z.string().uuid(),

    Fertilizer_Used: z
        .number()
        .nonnegative(),

    Pesticide_Used: z
        .number()
        .nonnegative(),

    Sunlight_Hours: z
        .number()
        .nonnegative(),
});