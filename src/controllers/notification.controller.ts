import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { registerPushToken } from "../services/notification.service.js";
import { DevicePlatform } from "../../generated/prisma/enums.js";


// Register Token
export const registerToken = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { token, platform } = req.body;

        const farmer = await prisma.farmer.findUnique({
            where: {
                userId,
            },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });
        }

        const pushToken = await registerPushToken({
            farmerId: farmer.id,
            token,
            platform: platform as DevicePlatform,
        });

        return res.status(200).json({
            success: true,
            message: "Push notification token registered",
            data: pushToken,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to register push token",
        });
    }
};

// Get Notifications
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 20, 50);

        const farmer = await prisma.farmer.findUnique({
            where: {
                userId,
            },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });
        }

        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where: {
                    farmerId: farmer.id,
                },

                orderBy: {
                    createdAt: "desc",
                },

                skip,
                take: limit,
            }),

            prisma.notification.count({
                where: {
                    farmerId: farmer.id,
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get notifications",
        });
    }
};

// Read Notificatons
export const markAsRead = async (req: Request, res: Response) => {
    try {

        const userId = req.user?.id;
        const { notificationId } = req.params;

        const farmer = await prisma.farmer.findUnique({
            where: {
                userId,
            },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });
        }

        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId as string,
                farmerId: farmer.id,
            },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        const updated = await prisma.notification.update({
            where: {
                id: notification.id,
            },

            data: {
                isRead: true
            },
        });

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: updated,
        });

    } catch (error) {
        console.log("Error: ", error)
        return res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};


// Delete a single notification
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;

        const farmer = await prisma.farmer.findUnique({
            where: {
                userId,
            },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });
        }

        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId as string,
                farmerId: farmer.id,
            },
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        await prisma.notification.delete({
            where: {
                id: notification.id,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
};


// Delete All Notifications
export const deleteAllNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const farmer = await prisma.farmer.findUnique({
            where: {
                userId,
            },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });
        }

        const result = await prisma.notification.deleteMany({
            where: {
                farmerId: farmer.id,
            },
        });

        return res.status(200).json({
            success: true,
            message: "All notifications deleted successfully",
            deletedCount: result.count,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete notifications",
        });
    }
};

