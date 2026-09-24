import { email, z } from "zod";

export const usernameSchema = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
    );

// Register
export const registerSchema = z.object({
    email: z
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
    fullName: z
        .string()
        .min(3, "Full name is required"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
});


// SignIn
export const signinSchema = z.object({
    email: z
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
    password: z
        .string()
        .min(1, "Password is required")
});




// Change Password
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, "Current password is required"),

    newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters"),

    // confirmPassword: z
    //     .string()
    //     .min(1, "Confirm password is required"),
})
// .refine(
//     (data) => data.newPassword === data.confirmPassword,
//     {
//         message: "New password and confirm password do not match",
//         path: ["confirmPassword"],
//     }
// );

// Forgot Passward
export const forgotPassword = z.object({
    email: z
        .email("Please provide a valid email address")
        .toLowerCase()
        .trim(),
});

// Reset Password
export const resetPassword = z.object({
    token: z
        .string(),
    password: z
        .string()
        .min(8, "New password must be at least 8 characters"),
})