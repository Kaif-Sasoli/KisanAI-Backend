import { Request, Response } from "express"
import { hashPassword, comparePassword } from "../utils/password.js"
import { prisma } from "../lib/prisma.js";
import { AuthProvider, UserRole } from "../../generated/prisma/enums.js";
import { generateAccessToken, genearteRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { googleClient } from "../config/google.config.js";
import { generateResetToken } from "../utils/token.js";
import { sendMail } from "../services/sendmail.service.js"
import { forgotPasswordTemplate } from '../templates/forgotPasswordTemplate.js'
import crypto from 'crypto';
import bcrypt from "bcryptjs";
import { uploadImage } from "../services/cloudinary.service.js";
import {
    REFRESH_TOKEN, ACCESS_TOKEN, cookieOptions, FRONT_END_URL
} from "../config/env.config.js";



// Register User
export const register = async (req: Request, res: Response) => {
    try {
        const { email, fullName, password } = req.body;

        // check user
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) return res.status(409)
            .json({ success: false, message: "User already exist with this email." })

        // genearte hash
        const hash = await hashPassword(password);

        // create user
        const user = await prisma.user.create({
            data: {
                email,
                fullName,
                password: hash,
                role: UserRole.FARMER,
                farmer: {
                    create: {
                        preferredLanguage: "en"
                    }
                }
            },

        });

        const accessToken = generateAccessToken({ id: user.id });
        const refreshToken = genearteRefreshToken({ id: user.id })

        // create refreshToken
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 7))
            }
        });

        const { password: _, providerType: __, ...publicUser } = user

        return res.status(201)
            .cookie(ACCESS_TOKEN, accessToken, cookieOptions)
            .cookie(REFRESH_TOKEN, refreshToken, cookieOptions)
            .json({
                success: true,
                message: "User Created Successfully",
                user: publicUser,
                accessToken
            });

    } catch (error) {
        console.log("err", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Signin
export const signin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404)
                .json({ success: false, message: "Email or Password is invalid!" });
        }

        // Compare password
        const isValid = await comparePassword(password, user.password!);
        if (!isValid) {
            return res.status(404)
                .json({ success: false, message: "Email or Password is invalid!" });
        }

        const accessToken = generateAccessToken({ id: user.id });
        const refreshToken = genearteRefreshToken({ id: user.id })

        // create refreshToken
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 7))
            }
        });

        const { password: _, providerType: __, ...publicUser } = user
        return res.status(200)
            .cookie(ACCESS_TOKEN, accessToken, cookieOptions)
            .cookie(REFRESH_TOKEN, refreshToken, cookieOptions)
            .json({
                success: true,
                message: "User sign in Successfully",
                user: publicUser,
                accessToken,
            });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }

}


// Google Auth
export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "ID Token is required",
            });
        }

        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID!,
        });

        const payload = ticket.getPayload();

        if (!payload?.email || !payload.sub) {
            return res.status(400).json({
                success: false,
                message: "Invalid Google account information",
            });
        }

        const { email, name, picture, sub: providerId, } = payload;

        // Find existing user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { providerId },
                ],
            },
        });

        // Create new user
        if (!user) {
            let profileImageUrl: string | undefined;
            let profileImagePublicId: string | undefined;

            // Upload image to Cloudinary
            if (picture) {
                try {
                    const imageResponse = await fetch(picture);
                    if (imageResponse.ok) {
                        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
                        const uploadedImage = await uploadImage(imageBuffer, "ProfileImages");
                        profileImageUrl = uploadedImage.imageUrl;
                        profileImagePublicId = uploadedImage.publicId;
                    }
                } catch (uploadError) {
                    console.error("Google profile image upload failed:", uploadError);
                }
            }

            user = await prisma.user.create({
                data: {
                    fullName: name || "Google User",
                    providerId,
                    email,
                    providerType: AuthProvider.GOOGLE,
                    role: UserRole.FARMER,
                    profileImageUrl,
                    profileImagePublicId,
                    isEmailVerified: true,

                    farmer: {
                        create: {
                            preferredLanguage: "en",
                        },
                    },
                },
            });
        } else {
            // Update existing user
            user = await prisma.user.update({
                where: { id: user.id, },
                data: { providerId, },
            });
        }

        // Remove sensitive fields
        const { password: _password, providerType: _providerType, ...publicUser } = user;

        const accessToken = generateAccessToken({ id: user.id, });
        const refreshToken = genearteRefreshToken({ id: user.id, });

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return res
            .status(200)
            .cookie(ACCESS_TOKEN, accessToken, cookieOptions)
            .cookie(REFRESH_TOKEN, refreshToken, cookieOptions)
            .json({
                success: true,
                message: "Authentication successful",
                user: publicUser,
                accessToken,
            });

    } catch (error) {
        console.error("Google Authentication Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error during Google Authentication!",
        });
    }
};

// Change Password
export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const { currentPassword, newPassword, } = req.body;

        // Get user
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                password: true,
                providerType: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Google users don't have a password
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Password change is not available for Google accounts",
            });
        }

        // Check current password
        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            });
        }

        // Prevent using same password
        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password",
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
    try {

        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({
                success: true,
                message: "Email Not Found!"
            });
        }

        // Revoke previous reset tokens
        await prisma.passwordReset.updateMany({
            where: {
                userId: user.id,
                usedAt: null,
                revokedAt: null
            },
            data: {
                revokedAt: new Date()
            }
        });

        const { token, tokenHash } = generateResetToken();

        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 15 * 60 * 1000)
            }
        });

        const resetLink = `${FRONT_END_URL}/reset-password?token=${token}`;

        // Send email
        await sendMail({
            to: user.email,
            subject: "Reset your KisanAI password",
            html: forgotPasswordTemplate(
                user?.fullName || "there",
                resetLink
            )
        });

        return res.status(200).json({
            success: true,
            message: "If an account exists, a password reset email has been sent.",
            resetLink
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Reset Password
export const restPassword = async (req: Request, res: Response) => {
    try {

        const { token, password } = req.body;

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const passwordReset = await prisma.passwordReset.findUnique({
            where: { tokenHash }
        });

        if (!passwordReset) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link"
            });
        }

        if (passwordReset.revokedAt ||
            passwordReset.usedAt ||
            passwordReset.expiresAt <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset link"
            });
        }

        const passwordHash = await hashPassword(password);

        // Transaction
        await prisma.$transaction(async (tx) => {

            await tx.user.update({
                where: { id: passwordReset.userId },
                data: { password: passwordHash }
            });

            await tx.passwordReset.update({
                where: { id: passwordReset.id },
                data: { usedAt: new Date() }
            });

            // Logout existing sessions
            await tx.refreshToken.updateMany({
                where: { userId: passwordReset.userId },
                data: { isRevoked: true }
            });
        });

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Refresh Access Token
export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies[REFRESH_TOKEN];

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        let payload: { id: string };

        try {
            payload = verifyRefreshToken(refreshToken);
        } catch (error) {
            console.log("Error: ", error)
            return res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        // Find refresh token 
        const storedToken = await prisma.refreshToken.findUnique({
            where: {
                token: refreshToken
            }
        });

        if (!storedToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }

        //  Check if revoked
        if (storedToken.isRevoked) {
            return res.status(401).json({
                success: false,
                message: "Refresh token has been revoked"
            });
        }

        // Check database expiration
        if (storedToken.expiresAt && storedToken.expiresAt <= new Date()) {
            await prisma.refreshToken.update({
                where: {
                    id: storedToken.id
                },
                data: {
                    isRevoked: true
                }
            });

            return res.status(401).json({
                success: false,
                message: "Refresh token has expired"
            });
        }

        // Verify token
        if (storedToken.userId !== payload.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: {
                id: storedToken.userId
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken({ id: user.id });
        const newRefreshToken = genearteRefreshToken({ id: user.id });

        // Rotate refresh token
        await prisma.$transaction([
            prisma.refreshToken.update({
                where: {
                    id: storedToken.id
                },
                data: {
                    isRevoked: true
                }
            }),
            // Create new refresh token
            prisma.refreshToken.create({
                data: {
                    token: newRefreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);


        return res
            .status(200)
            .cookie(ACCESS_TOKEN, newAccessToken, cookieOptions)
            .cookie(REFRESH_TOKEN, newRefreshToken, cookieOptions)
            .json({
                success: true,
                message: "Token refreshed successfully",
                accessToken: newAccessToken
            });

    } catch (error) {
        console.error("Refresh token error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Logout
export const logout = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        // Get the refresh token of this device
        const refreshToken = req.cookies[REFRESH_TOKEN];

        if (refreshToken) {
            await prisma.refreshToken.updateMany({
                where: {
                    userId,
                    token: refreshToken,
                    isRevoked: false
                },
                data: {
                    isRevoked: true
                }
            });
        }

        // Clear current device cookies
        res.clearCookie(ACCESS_TOKEN, cookieOptions);
        res.clearCookie(REFRESH_TOKEN, cookieOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};