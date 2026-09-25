import { z } from "zod";
import { SoilType, IrrigationType, Region } from "../../generated/prisma/enums.js";


// Add Field Schema
export const addFieldSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Field name is required")
        .max(100, "Field name must be less than 100 characters")
        .optional(),

    area: z
        .number("Area must be a number")
        .positive("Area must be greater than 0"),

    areaUnit: z
        .enum(["ACRE", "HECTARE"])
        .default("ACRE"),

    latitude: z
        .number("Latitude must be a number")
        .min(-90, "Invalid latitude")
        .max(90, "Invalid latitude")
        .optional(),

    longitude: z
        .number("Longitude must be a number")
        .min(-180, "Invalid longitude")
        .max(180, "Invalid longitude")
        .optional(),
    altitude: z
        .number()
        .optional(),

    province: z
        .string()
        .trim()
        .optional(),

    region: z
        .enum(Region)
        .optional(),

    city: z
        .string()
        .trim()
        .optional(),

    tehsil: z
        .string()
        .trim()
        .optional(),

    village: z
        .string()
        .trim()
        .optional(),


    soilType: z
        .enum(SoilType)
        .optional(),
    irrigationType: z
        .enum(IrrigationType)
        .optional()
});

// Update Field Schema
export const updateFieldSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Field name is required")
        .max(100, "Field name must be less than 100 characters")
        .optional(),

    area: z
        .number("Area must be a number")
        .positive("Area must be greater than 0")
        .optional(),

    areaUnit: z
        .enum(["ACRE", "HECTARE"])
        .optional(),

    latitude: z
        .number("Latitude must be a number")
        .min(-90, "Invalid latitude")
        .max(90, "Invalid latitude")
        .optional(),

    longitude: z
        .number("Longitude must be a number")
        .min(-180, "Invalid longitude")
        .max(180, "Invalid longitude")
        .optional(),
    altitude: z
        .number()
        .optional(),

    province: z.string().trim().optional(),
    district: z.string().trim().optional(),
    tehsil: z.string().trim().optional(),
    village: z.string().trim().optional(),


    soilType: z
        .enum(SoilType)
        .optional(),

    irrigationType: z
        .enum(IrrigationType)
        .optional()
});