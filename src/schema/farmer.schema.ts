import { z } from "zod";

export const updateAccountSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must not exceed 100 characters")
        .optional(),

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must not exceed 30 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        )
        .optional(),

    phoneNumber: z
        .string()
        .trim()
        .min(7, "Invalid phone number")
        .max(20, "Invalid phone number")
        .optional(),

    preferredLanguage: z
        .string()
        .trim()
        .min(2)
        .max(10)
        .optional(),

    province: z
        .string()
        .trim()
        .max(100)
        .optional(),

    city: z
        .string()
        .trim()
        .max(100)
        .optional(),

    district: z
        .string()
        .trim()
        .max(100)
        .optional(),

    village: z
        .string()
        .trim()
        .max(100)
        .optional(),
});