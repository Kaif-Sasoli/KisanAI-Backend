import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import { uploadImage, deleteImage } from "../services/cloudinary.service.js";


// Get Admin Account
export const getAdminAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const admin = await prisma.user.findUnique({
            where: {
                id: userId,
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
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: admin,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get admin account",
        });
    }
};


// Update Admin Account
export const updateAdminAccount = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fullName, username, phoneNumber } = req.body;
        const profileImage = req.file;

        // Check Admin/User
        const existingAdmin = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                username: true,
                role: true,
                profileImagePublicId: true,
            },
        });

        if (!existingAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        let newImageUrl: string | undefined;
        let newImagePublicId: string | undefined;

        // Upload new profile image
        if (profileImage) {
            const uploadedImage = await uploadImage(profileImage.buffer, "ProfileImages");
            newImageUrl = uploadedImage.imageUrl;
            newImagePublicId = uploadedImage.publicId;
        }

        // Update Admin/User
        const updatedAdmin = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                ...(fullName !== undefined && { fullName }),
                ...(username !== undefined && { username }),
                ...(phoneNumber !== undefined && { phoneNumber }),
                ...(newImageUrl !== undefined && {
                    profileImageUrl: newImageUrl,
                    profileImagePublicId: newImagePublicId,
                }),
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
            },
        });

        // Delete old profile image from Cloudinary
        if (profileImage && existingAdmin.profileImagePublicId && newImagePublicId) {
            try {
                await deleteImage(
                    existingAdmin.profileImagePublicId
                );
            } catch (error) {
                console.error("Failed to delete old profile image:", error);
            }
        }

        return res.status(200).json({
            success: true,
            message: "Admin account updated successfully",
            data: updatedAdmin,
        });

    } catch (error: any) {
        console.error("Error: ", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Update Admin Profile Image
export const updateAdminProfileImage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Profile image is required",
            });
        }

        const admin = await prisma.user.findUnique({
            where: { id: userId },
            select: { profileImagePublicId: true },
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        const uploaded = await uploadImage(file.buffer, `ProfileImages`);

        if (admin.profileImagePublicId) {
            await deleteImage(admin.profileImagePublicId);
        }

        const updatedAdmin = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                profileImageUrl: uploaded.imageUrl,
                profileImagePublicId: uploaded.publicId,
            },
            select: {
                id: true,
                profileImageUrl: true,
                profileImagePublicId: true,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Profile image updated successfully",
            data: updatedAdmin,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to update profile image",
        });
    }
};


// Delete Admin Profile Image
export const deleteAdminProfileImage = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const admin = await prisma.user.findUnique({
            where: { id: userId },
            select: { profileImagePublicId: true },
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            });
        }

        if (!admin.profileImagePublicId) {
            return res.status(404).json({
                success: false,
                message: "Profile image not found",
            });
        }

        await deleteImage(admin.profileImagePublicId);

        await prisma.user.update({
            where: { id: userId },
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