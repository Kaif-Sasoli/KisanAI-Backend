import { z } from "zod";

const optionalNonNegativeNumber = z
    .number("Value must be a number")
    .min(0, "Value cannot be negative")
    .optional()
    .nullable();


export const addSoilDataSchema = z.object({
    nitrogen: optionalNonNegativeNumber,
    phosphorus: optionalNonNegativeNumber,
    potassium: optionalNonNegativeNumber,
    soilPH: z
        .number("Soil pH must be a number")
        .min(0, "Soil pH cannot be negative")
        .max(14, "Soil pH cannot be greater than 14")
        .optional()
        .nullable(),
    soilMoisture: z
        .number("Soil moisture must be a number")
        .min(0, "Soil moisture cannot be negative")
        .max(100, "Soil moisture cannot exceed 100%")
        .optional()
        .nullable(),
    organicCarbon: optionalNonNegativeNumber,
    recordedAt: z
        .coerce
        .date()
        .optional()
});


export const updateSoilDataSchema = addSoilDataSchema.partial();