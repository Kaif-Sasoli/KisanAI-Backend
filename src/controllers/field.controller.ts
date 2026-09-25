import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";
import { addFieldSchema } from "../schema/field.schema.js";
import { SoilType } from '../../generated/prisma/enums.js'


export const addField = async (req: Request, res: Response) => {
    try {

        const userId = req.user?.id;

        const { name, area, areaUnit, latitude, longitude, province,
            region, city, village, altitude, soilType, irrigationType } = req.body;

        // Find farmer belonging to logged-in user
        const farmer = await prisma.farmer.findUnique({
            where: { userId }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        // Create field
        const field = await prisma.field.create({
            data: {
                farmerId: farmer.id,
                name,
                area,
                areaUnit,
                latitude,
                longitude,
                province,
                region,
                city,
                village,
                altitude,
                soilType,
                irrigationType
            }
        });

        return res.status(201).json({
            success: true,
            message: "Field added successfully",
            field
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// Get Field
export const getField = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        const farmer = await prisma.farmer.findUnique({
            where: {
                userId
            }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        const field = await prisma.field.findFirst({
            where: {
                id: fieldId as string,
                farmerId: farmer.id
            }
        });

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Field retrieved successfully",
            field
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get Fields
export const getFields = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 50);

        const skip = (page - 1) * limit;

        const farmer = await prisma.farmer.findUnique({
            where: { userId }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        const [fields, totalFields] = await Promise.all([
            prisma.field.findMany({
                where: { farmerId: farmer.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),

            prisma.field.count({
                where: { farmerId: farmer.id }
            })
        ]);

        const totalPages = Math.ceil(totalFields / limit);

        return res.status(200).json({
            success: true,
            message: "Fields retrieved successfully",
            fields,
            pagination: {
                currentPage: page,
                limit,
                totalFields,
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

// Update Field
export const updateField = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        const { name, area, areaUnit, latitude, longitude, province,
            region, city, village, altitude, soilType, irrigationType
        } = req.body;

        const farmer = await prisma.farmer.findUnique({
            where: { userId }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        const field = await prisma.field.findFirst({
            where: {
                id: fieldId as string,
                farmerId: farmer.id
            }
        });

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        // Update field
        const updatedField = await prisma.field.update({
            where: { id: field.id },
            data: {
                name,
                area,
                areaUnit,
                latitude,
                longitude,
                altitude,
                province,
                region,
                city,
                village,
                soilType,
                irrigationType
            }
        });

        return res.status(200).json({
            success: true,
            message: "Field updated successfully",
            field: updatedField
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete Field
export const deleteField = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        const farmer = await prisma.farmer.findUnique({
            where: { userId }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        const field = await prisma.field.findFirst({
            where: {
                id: fieldId as string,
                farmerId: farmer.id
            }
        });

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        await prisma.field.delete({
            where: { id: field.id }
        });

        return res.status(200).json({
            success: true,
            message: "Field deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Delete All Fields
export const deleteAllFields = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const farmer = await prisma.farmer.findUnique({
            where: { userId }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        // Delete all fields of farmer
        const result = await prisma.field.deleteMany({
            where: { farmerId: farmer.id }
        });

        return res.status(200).json({
            success: true,
            message: "All fields deleted successfully",
            deletedCount: result.count
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};