import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { uploadImage, deleteImage } from "../services/cloudinary.service.js";

// Get  Farmer Account
export const getAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                profileImageUrl: true,
                profileImagePublicId: true,
                providerType: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                farmer: {
                    select: {
                        id: true,
                        preferredLanguage: true,
                        province: true,
                        city: true,
                        district: true,
                        village: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            data: user,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// Update Farmer Account
export const updateAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const { fullName, username, phoneNumber, preferredLanguage,
            province, city, district, village, } = req.body;
        const profileImage = req.file;

        // Check User
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                profileImagePublicId: true,
            },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (username !== undefined && username !== existingUser.username) {
            const usernameExists = await prisma.user.findFirst({
                where: {
                    username,
                    NOT: { id: userId },
                },
            });

            if (usernameExists) {
                return res.status(409).json({
                    success: false,
                    message: "Username is already taken",
                });
            }
        }

        let newImageUrl: string | undefined;
        let newImagePublicId: string | undefined;

        if (profileImage) {
            const uploadedImage = await uploadImage(profileImage.buffer, `ProfileImages`);
            newImageUrl = uploadedImage.imageUrl;
            newImagePublicId = uploadedImage.publicId;
        }


        // Update User
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(fullName !== undefined && { fullName }),
                ...(username !== undefined && { username }),
                ...(phoneNumber !== undefined && { phoneNumber, }),
                ...(newImageUrl !== undefined && {
                    profileImageUrl: newImageUrl,
                    profileImagePublicId: newImagePublicId,
                }),
                farmer: {
                    upsert: {
                        create: {
                            preferredLanguage: preferredLanguage ?? "en",
                            province,
                            city,
                            district,
                            village,
                        },
                        update: {
                            ...(preferredLanguage !== undefined && { preferredLanguage, }),
                            ...(province !== undefined && { province, }),
                            ...(city !== undefined && { city, }),
                            ...(district !== undefined && { district, }),
                            ...(village !== undefined && { village, }),
                        },
                    },
                },
            },
            select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                profileImageUrl: true,
                profileImagePublicId: true,
                providerType: true,
                role: true,
                isEmailVerified: true,
                farmer: {
                    select: {
                        id: true,
                        preferredLanguage: true,
                        province: true,
                        city: true,
                        district: true,
                        village: true,
                    },
                },
            },
        });

        // 
        if (profileImage && existingUser.profileImagePublicId && newImagePublicId) {
            try {
                await deleteImage(existingUser.profileImagePublicId);
            } catch (error) {
                console.error("Failed to delete old profile image:", error);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Account updated successfully",
            data: user,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// Delete Profile Image
export const deleteProfileImage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        // Get current profile image
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                profileImageUrl: true,
                profileImagePublicId: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // No profile image
        if (!user.profileImagePublicId) {
            return res.status(404).json({
                success: false,
                message: "Profile image not found",
            });
        }

        // Delete image
        await deleteImage(user.profileImagePublicId);

        // Remove from database
        await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                profileImageUrl: null,
                profileImagePublicId: null,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Profile image deleted successfully",
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete profile image",
        });
    }
};


// Delete Account
export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                profileImagePublicId: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete Cloudinary profile image 
        if (user.profileImagePublicId) {
            await deleteImage(user.profileImagePublicId);
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


