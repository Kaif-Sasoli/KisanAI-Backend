import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { findFarmerField } from "../utils/field.utils.js";
import { updateSoilMoistureFromIoT } from "../services/soil-data.service.js";

// Soil Data
export const addSoilData = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        const field = await findFarmerField(userId, fieldId as string);

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        const { nitrogen, phosphorus, potassium, soilPH, soilMoisture,
            organicCarbon, recordedAt } = req.body;

        // Make sure at least one measurement exists.
        const hasMeasurement = [nitrogen, phosphorus, potassium,
            soilPH, soilMoisture, organicCarbon].some(
                value =>
                    value !== undefined &&
                    value !== null
            );

        if (!hasMeasurement) {
            return res.status(400).json({
                success: false,
                message: "At least one soil measurement is required"
            });
        }

        const soilData =
            await prisma.soilData.create({
                data: {
                    fieldId: field.id,
                    nitrogen,
                    phosphorus,
                    potassium,
                    soilPH,
                    soilMoisture,
                    organicCarbon,
                    recordedAt: recordedAt ?? new Date()
                }
            });

        return res.status(201).json({
            success: true,
            message: "Soil data added successfully",
            soilData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update Soil Moisture from IOT
export const updateSoilMoistureFromIoTController = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        // Check field ownership
        const field = await findFarmerField(userId, fieldId as string);

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        // Get moisture from IoT and save it
        const soilData = await updateSoilMoistureFromIoT(field.id);

        return res.status(200).json({
            success: true,
            message: "Soil moisture updated successfully",
            soilMoisture: soilData.soilMoisture,
            recordedAt: soilData.recordedAt,
            soilData
        });

    } catch (error: any) {
        if (error.message === "No soil data found. Please add soil data manually first.") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Failed to update soil moisture from IoT"
        });
    }
};

// Get all Soil Data of Field
export const getSoilData = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        const field = await findFarmerField(userId, fieldId as string);

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const skip = (page - 1) * limit;

        const [soilData, totalRecords] = await Promise.all([
            prisma.soilData.findMany({
                where: { fieldId: field.id },
                orderBy: { recordedAt: "desc" },
                skip,
                take: limit
            }),

            prisma.soilData.count({
                where: { fieldId: field.id }
            })
        ]);

        const totalPages = Math.ceil(totalRecords / limit);

        return res.status(200).json({
            success: true,
            message: "Soil data retrieved successfully",
            soilData,
            pagination: {
                currentPage: page,
                limit,
                totalRecords,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Get Single Soil Data
export const getSingleSoilData = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { soilDataId } = req.params;

        const soilData = await prisma.soilData.findFirst({
            where: {
                id: soilDataId as string,
                field: {
                    farmer: { userId }
                }
            },
            include: { field: true }
        });

        if (!soilData) {
            return res.status(404).json({
                success: false,
                message: "Soil data not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Soil data retrieved successfully",
            soilData
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Update Soil Data
export const updateSoilData = async (req: Request, res: Response) => {
    try {

        const userId = req.user?.id;
        const { soilDataId } = req.params;

        const existing = await prisma.soilData.findFirst({
            where: {
                id: soilDataId as string,
                field: {
                    farmer: { userId }
                }
            }
        });

        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Soil data not found"
            });
        }

        // Prevent PATCH {} from doing nothing silently.
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required for update"
            });
        }

        const updated = await prisma.soilData.update({
            where: { id: existing.id },
            data: {
                ...(req.body.nitrogen !== undefined && {
                    nitrogen: req.body.nitrogen
                }),
                ...(req.body.phosphorus !== undefined && {
                    phosphorus: req.body.phosphorus
                }),
                ...(req.body.potassium !== undefined && {
                    potassium: req.body.potassium
                }),
                ...(req.body.soilPH !== undefined && {
                    soilPH: req.body.soilPH
                }),
                ...(req.body.soilMoisture !== undefined && {
                    soilMoisture: req.body.soilMoisture
                }),
                ...(req.body.organicCarbon !== undefined && {
                    organicCarbon:
                        req.body.organicCarbon
                }),
                ...(req.body.recordedAt !== undefined && {
                    recordedAt: req.body.recordedAt
                })
            }
        });

        return res.status(200).json({
            success: true,
            message: "Soil data updated successfully",
            soilData: updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Delete Single Soil Data
export const deleteSoilData = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { soilDataId } = req.params;

        const soilData =
            await prisma.soilData.findFirst({
                where: {
                    id: soilDataId as string,
                    field: {
                        farmer: { userId }
                    }
                }
            });

        if (!soilData) {
            return res.status(404).json({
                success: false,
                message: "Soil data not found"
            });
        }

        await prisma.soilData.delete({
            where: { id: soilData.id }
        });

        return res.status(200).json({
            success: true,
            message: "Soil data deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Delete all Soil Data of Field
export const deleteAllSoilData = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        const field = await findFarmerField(userId, fieldId as string);

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        const result = await prisma.soilData.deleteMany({
            where: { fieldId: field.id }
        });

        return res.status(200).json({
            success: true,
            message: "All soil data deleted successfully",
            deletedCount: result.count
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};





