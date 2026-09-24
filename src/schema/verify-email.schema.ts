import { email, z } from "zod";

export const sendVerificationOtpSchema = z.object({
    email: z
        .email("Invalid email address")
});


export const verifyEmailOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z
        .number()
        .int()
        .min(100000, "OTP must be 6 digits")
        .max(999999, "OTP must be 6 digits"),
});