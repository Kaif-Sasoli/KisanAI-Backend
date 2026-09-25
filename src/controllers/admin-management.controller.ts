import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";


// Get All Farmers
export const getAllFarmers = async (req: Request, res: Response) => {
    try {

        const farmers = await prisma.farmer.findMany({
            orderBy: {
                createdAt: "desc",
            },

            select: {
                id: true,
                province: true,
                city: true,
                district: true,
                village: true,
                preferredLanguage: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true,
                        isEmailVerified: true,
                        providerType: true,
                    },
                },

                _count: {
                    select: {
                        fields: true,
                        diseasePredictions: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            count: farmers.length,
            data: farmers,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get farmers",
        });
    }
};


// Get Farmer Details
export const getFarmerDetails = async (req: Request, res: Response) => {
    try {
        const { farmerId } = req.params;

        const farmer = await prisma.farmer.findUnique({
            where: {
                id: farmerId as string,
            },
            select: {
                id: true,
                preferredLanguage: true,
                province: true,
                city: true,
                district: true,
                village: true,
                createdAt: true,

                user: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        email: true,
                        phoneNumber: true,
                        profileImageUrl: true,
                        isEmailVerified: true,
                        providerType: true,
                        createdAt: true,
                    },
                },

                fields: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    include: {
                        crops: true,
                    },
                },

                _count: {
                    select: {
                        diseasePredictions: true,
                        yieldPredictions: true,
                    },
                },
            },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });
        }

        const { diseasePredictions, yieldPredictions, } = farmer._count;

        return res.status(200).json({
            success: true,
            data: {
                ...farmer,
                predictionCounts: {
                    diseasePredictions,
                    yieldPredictions,
                },
            },
        });

    } catch (error: any) {
        console.error("Get farmer details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get farmer details",
        });
    }
};


// Delete a Famrmer
export const deleteFarmer = async (req: Request, res: Response) => {
    try {

        const { farmerId } = req.params;

        const farmer = await prisma.farmer.findUnique({
            where: {
                id: farmerId as string,
            },

            select: {
                id: true,
                userId: true,
            },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer not found",
            });
        }

        await prisma.user.delete({
            where: { id: farmer.userId },
        });

        return res.status(200).json({
            success: true,
            message: "Farmer deleted successfully",
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete farmer",
        });
    }
};

// Settings

// Get System Settings
export const getSystemSettings = async (req: Request, res: Response) => {

    const settings = await prisma.systemSetting.findMany({
        orderBy: {
            key: "asc",
        },
    });

    res.json({
        success: true,
        settings,
    });
};


// Update Settings
// export const updateSystemSettings = async (req: Request, res: Response) => {

//     const settings = req.body;

//     if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid settings payload",
//         });
//     }

//     await prisma.$transaction(
//         Object.entries(settings).map(([key, value]) => {
//             const jsonValue = value as Prisma.InputJsonValue;

//             return prisma.systemSetting.upsert({
//                 where: { key },
//                 update: {
//                     value: jsonValue,
//                 },
//                 create: {
//                     key,
//                     value: jsonValue,
//                 },
//             });
//         })
//     );

//     return res.json({
//         success: true,
//         message: "Settings updated successfully",
//     });
// };

// Used to Update and Add Single Setting
// export const upsertSystemSetting = async (req: Request, res: Response) => {
//     try {

//         const { key, value, description, category, } = req.body;

//         if (!key || value === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Key and value are required",
//             });
//         }

//         const setting = await prisma.systemSetting.upsert({
//             where: {
//                 key,
//             },

//             update: {
//                 value,
//                 description,
//                 category,
//             },

//             create: {
//                 key,
//                 value,
//                 description,
//                 category,
//             },
//         });

//         return res.status(200).json({
//             success: true,
//             message: "System setting saved successfully",
//             setting,
//         });

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Failed to save system setting",
//         });
//     }
// };


// Add or Update ONE Setting
export const upsertSystemSetting = async (req: Request, res: Response) => {
    try {
        const { key, value, description, category, } = req.body;

        if (!key || value === undefined) {
            return res.status(400).json({
                success: false,
                message: "Key and value are required",
            });
        }

        const setting = await prisma.systemSetting.upsert({
            where: {
                key,
            },

            update: {
                value: value as Prisma.InputJsonValue,
                description,
                category,
            },

            create: {
                key,
                value: value as Prisma.InputJsonValue,
                description,
                category,
            },
        });

        return res.status(200).json({
            success: true,
            message: "System setting saved successfully",
            setting,
        });

    } catch (error) {
        console.error("Upsert system setting error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save system setting",
        });
    }
};

// Add or Update MULTIPLE Settings
export const upsertSystemSettings = async (req: Request, res: Response) => {
    try {
        const { settings } = req.body;

        if (!Array.isArray(settings) || settings.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Settings must be a non-empty array",
            });
        }

        const results = await prisma.$transaction(
            settings.map((setting) => {

                const { key, value, description, category } = setting;

                if (!key || value === undefined) {
                    throw new Error(
                        "Each setting must contain key and value"
                    );
                }

                return prisma.systemSetting.upsert({
                    where: {
                        key,
                    },
                    update: {
                        value: value as Prisma.InputJsonValue,
                        description,
                        category,
                    },
                    create: {
                        key,
                        value: value as Prisma.InputJsonValue,
                        description,
                        category,
                    },
                });
            })
        );

        return res.status(200).json({
            success: true,
            message: "System settings saved successfully",
            settings: results,
        });

    } catch (error) {
        console.error("Upsert system settings error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to save system settings",
        });
    }
};



// Delete System Setting
export const deleteSystemSetting = async (req: Request, res: Response) => {
    try {
        const { key } = req.params;

        // Type guard or explicit cast
        const settingKey = key as string;

        if (!settingKey) {
            return res.status(400).json({
                success: false,
                message: "Setting key is required",
            });
        }

        // Check if setting exists first
        const existingSetting = await prisma.systemSetting.findUnique({
            where: { key: settingKey },
        });

        if (!existingSetting) {
            return res.status(404).json({
                success: false,
                message: `Setting with key '${settingKey}' not found`,
            });
        }

        await prisma.systemSetting.delete({
            where: { key: settingKey },
        });

        return res.status(200).json({
            success: true,
            message: `Setting '${settingKey}' deleted successfully`,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete system setting",
        });
    }
};