import { z } from "zod";

export const predictDiseaseSchema = z.object({
    cropId: z.string().uuid("Invalid crop ID"),
    model: z
        .enum(["mobilenet", "efficientnet"])
        .default("efficientnet"),
});

export const updateDiseasePredictionSchema = z.object({
    diseaseName: z
        .string()
        .trim()
        .min(2)
        .max(150)
        .optional(),

    treatment: z
        .string()
        .trim()
        .min(2)
        .max(1000)
        .optional(),

    confidence: z
        .number()
        .min(0)
        .max(1)
        .optional(),

    predictionDate: z
        .coerce
        .date()
        .optional(),
});