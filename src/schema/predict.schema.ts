import { z } from "zod";

export const diseasePredictionSchema = z.object({
    cropId: z
        .uuid("Invalid crop ID"),

    model: z
        .enum(["mobilenet", "efficientnet"])
        .optional()
        .default("efficientnet"),
});