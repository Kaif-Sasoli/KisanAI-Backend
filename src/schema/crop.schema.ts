import { z } from "zod";
import {
    Season,
    AreaUnit,
    CropStatus,
    CropType
} from "../../generated/prisma/enums.js";

// Add Crop
export const addCropSchema = z
    .object({
        cropName: z
            .enum(CropType),
        season: z
            .enum(Season),

        plantingDate: z
            .coerce
            .date()
            .optional(),

        expectedHarvestDate: z
            .coerce
            .date()
            .optional(),

        actualHarvestDate: z
            .coerce
            .date()
            .optional(),

        area: z
            .number("Area must be a number")
            .positive("Crop area must be greater than 0")
            .optional(),

        areaUnit: z
            .enum(AreaUnit)
            .optional(),

        status: z
            .enum(CropStatus)
            .optional()
    })
    .superRefine((data, ctx) => {

        // Expected harvest cannot be before planting
        if (
            data.plantingDate &&
            data.expectedHarvestDate &&
            data.expectedHarvestDate < data.plantingDate
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["expectedHarvestDate"],
                message: "Expected harvest date cannot be before planting date"
            });
        }

        // Actual harvest cannot be before planting
        if (
            data.plantingDate &&
            data.actualHarvestDate &&
            data.actualHarvestDate < data.plantingDate
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["actualHarvestDate"],
                message: "Actual harvest date cannot be before planting date"
            });
        }

        // Area unit should be supplied if area is supplied
        if (data.area !== undefined && data.areaUnit === undefined) {
            ctx.addIssue({
                code: "custom",
                path: ["areaUnit"],
                message: "Area unit is required when crop area is provided"
            });
        }
    });


// Update Crop
export const updateCropSchema = z
    .object({
        cropName: z
            .enum(CropType)
            .optional(),
        season: z
            .enum(Season)
            .optional(),

        plantingDate: z
            .coerce
            .date()
            .optional()
            .nullable(),

        expectedHarvestDate: z
            .coerce
            .date()
            .optional()
            .nullable(),

        actualHarvestDate: z
            .coerce
            .date()
            .optional()
            .nullable(),

        area: z
            .number("Area must be a number")
            .positive("Crop area must be greater than 0")
            .optional()
            .nullable(),

        areaUnit: z
            .enum(AreaUnit)
            .optional()
            .nullable(),

        status: z
            .enum(CropStatus)
            .optional()
    })
    .superRefine((data, ctx) => {

        if (
            data.plantingDate &&
            data.expectedHarvestDate &&
            data.expectedHarvestDate < data.plantingDate
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["expectedHarvestDate"],
                message: "Expected harvest date cannot be before planting date"
            });
        }

        if (
            data.plantingDate &&
            data.actualHarvestDate &&
            data.actualHarvestDate < data.plantingDate
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["actualHarvestDate"],
                message: "Actual harvest date cannot be before planting date"
            });
        }

        if (
            data.area !== undefined &&
            data.area !== null &&
            (data.areaUnit === undefined || data.areaUnit === null)
        ) {
            ctx.addIssue({
                code: "custom",
                path: ["areaUnit"],
                message: "Area unit is required when crop area is provided"
            });
        }
    });