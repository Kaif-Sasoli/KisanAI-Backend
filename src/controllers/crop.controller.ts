import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { AreaUnit, CropStatus } from "../../generated/prisma/enums";
import { findFarmerField } from "../utils/field.utils.js";


const toAcres = (area: number, unit: AreaUnit): number => {
    if (unit === AreaUnit.HECTARE) {
        return area * 2.47105;
    }
    return area;
};

// Check Crop Area
const validateCropArea = async (
    tx: any,
    fieldId: string,
    cropName: string | null,
    season: any,
    cropArea: number | null | undefined,
    cropAreaUnit: AreaUnit | null | undefined,
    excludeCropId?: string
) => {

    // No crop area means nothing to validate.
    if (cropArea === undefined || cropArea === null) {
        return;
    }

    if (!cropAreaUnit) {
        throw new Error("Crop area unit is required");
    }

    // Convert crop area to acres
    const newCropAreaInAcres = toAcres(
        cropArea,
        cropAreaUnit
    );

    // Convert field area to acres
    const field = await tx.field.findUnique({
        where: { id: fieldId },
        select: {
            area: true,
            areaUnit: true
        }
    });

    if (!field) {
        throw new Error("Field not found");
    }

    const fieldAreaInAcres = toAcres(
        field.area,
        field.areaUnit
    );

    // A single crop cannot be larger than the field.
    if (newCropAreaInAcres > fieldAreaInAcres) {
        throw new Error(
            `Crop area cannot exceed field area of ${field.area} ${field.areaUnit}`
        );
    }

    // Find other crops from the SAME season.
    const existingCrops = await tx.crop.findMany({
        where: {
            fieldId,
            season,
            ...(excludeCropId
                ? {
                    id: { not: excludeCropId }
                }
                : {})
        },
        select: {
            area: true,
            areaUnit: true
        }
    });

    const existingAreaInAcres = existingCrops.reduce(
        (total: number, crop: any) => {
            if (crop.area === null || crop.area === undefined) {
                return total;
            }
            return total + toAcres(crop.area, crop.areaUnit ?? AreaUnit.ACRE);
        },
        0
    );

    const totalArea = existingAreaInAcres + newCropAreaInAcres;

    if (totalArea > fieldAreaInAcres) {
        throw new Error(
            `Total crop area for ${cropName} cannot exceed field area. ` +
            `Field area: ${fieldAreaInAcres.toFixed(2)} acres, ` +
            `already used: ${existingAreaInAcres.toFixed(2)} acres, ` +
            `requested: ${newCropAreaInAcres.toFixed(2)} acres.`
        );
    }
};


// Add Crop
export const addCrop = async (req: Request, res: Response) => {
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

        const { cropName, season, plantingDate, expectedHarvestDate,
            actualHarvestDate, area, areaUnit, status } = req.body;


        //   Use a transaction so checking the existing crop area
        const crop = await prisma.$transaction(
            async (tx) => {
                await validateCropArea(tx, field.id, cropName, season, area, areaUnit);
                return tx.crop.create({
                    data: {
                        fieldId: field.id,
                        cropName,
                        season,
                        plantingDate,
                        expectedHarvestDate,
                        actualHarvestDate,
                        area,
                        areaUnit,
                        status: status ?? CropStatus.ACTIVE
                    }
                });
            },
            {
                isolationLevel: "Serializable"
            }
        );

        return res.status(201).json({
            success: true,
            message: "Crop added successfully",
            crop
        });

    } catch (error: any) {
        if (error?.message?.includes("Crop area") || error?.message?.includes("Total crop area") ||
            error?.message?.includes("area unit")) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Get all Crops of a Field
export const getCrops = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const field = await findFarmerField(
            userId,
            fieldId as string
        );

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
        const skip = (page - 1) * limit;

        const [crops, totalCrops] = await Promise.all([
            prisma.crop.findMany({
                where: { fieldId: field.id },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit
            }),
            prisma.crop.count({
                where: { fieldId: field.id }
            })
        ]);

        const totalPages = Math.ceil(totalCrops / limit);

        return res.status(200).json({
            success: true,
            message: "Crops retrieved successfully",
            crops,
            pagination: {
                currentPage: page,
                limit,
                totalCrops,
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


// Get Single Crop
export const getCrop = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { cropId } = req.params;

        const crop = await prisma.crop.findFirst({
            where: {
                id: cropId as string,
                field: {
                    farmer: { userId }
                }
            },
            include: { field: true }
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Crop retrieved successfully",
            crop
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Update Crop
export const updateCrop = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { cropId } = req.params;

        const existingCrop = await prisma.crop.findFirst({
            where: {
                id: cropId as string,
                field: {
                    farmer: { userId }
                }
            }
        });

        if (!existingCrop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        const body = req.body;
        const season = body.season !== undefined ? body.season : existingCrop.season;
        const area = body.area !== undefined ? body.area : existingCrop.area;
        const areaUnit = body.areaUnit !== undefined ? body.areaUnit : existingCrop.areaUnit;

        const effectiveAreaUnit = areaUnit ?? AreaUnit.ACRE;

        const plantingDate = body.plantingDate !== undefined
            ? body.plantingDate : existingCrop.plantingDate;

        const expectedHarvestDate =
            body.expectedHarvestDate !== undefined
                ? body.expectedHarvestDate : existingCrop.expectedHarvestDate;

        const actualHarvestDate =
            body.actualHarvestDate !== undefined
                ? body.actualHarvestDate : existingCrop.actualHarvestDate;

        // Date validation after combining old + new values
        if (plantingDate && expectedHarvestDate && expectedHarvestDate < plantingDate) {
            return res.status(400).json({
                success: false,
                message: "Expected harvest date cannot be before planting date"
            });
        }

        if (plantingDate && actualHarvestDate && actualHarvestDate < plantingDate) {
            return res.status(400).json({
                success: false,
                message: "Actual harvest date cannot be before planting date"
            });
        }

        const updatedCrop = await prisma.$transaction(
            async (tx) => {
                await validateCropArea(
                    tx,
                    existingCrop.fieldId,
                    null,
                    season,
                    area,
                    effectiveAreaUnit,
                    existingCrop.id
                );

                return tx.crop.update({
                    where: { id: existingCrop.id },
                    data: {
                        ...(body.cropName !== undefined && {
                            cropName: body.cropName
                        }),
                        ...(body.season !== undefined && {
                            season: body.season
                        }),
                        ...(body.plantingDate !== undefined && {
                            plantingDate: body.plantingDate
                        }),
                        ...(body.expectedHarvestDate !== undefined && {
                            expectedHarvestDate: body.expectedHarvestDate
                        }),
                        ...(body.actualHarvestDate !== undefined && {
                            actualHarvestDate: body.actualHarvestDate
                        }),
                        ...(body.area !== undefined && {
                            area: body.area
                        }),
                        ...(body.areaUnit !== undefined && {
                            areaUnit: body.areaUnit
                        }),
                        ...(body.status !== undefined && {
                            status: body.status
                        })
                    }
                });
            },
            {
                isolationLevel: "Serializable"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Crop updated successfully",
            crop: updatedCrop
        });

    } catch (error: any) {
        if (error?.message?.includes("Crop area") ||
            error?.message?.includes("Total crop area") ||
            error?.message?.includes("area unit")) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


// Delete a Crop
export const deleteCrop = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { cropId } = req.params;

        const crop = await prisma.crop.findFirst({
            where: {
                id: cropId as string,
                field: {
                    farmer: { userId }
                }
            }
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found"
            });
        }

        await prisma.crop.delete({
            where: { id: crop.id }
        });

        return res.status(200).json({
            success: true,
            message: "Crop deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Delete Crops of a Field
export const deleteAllCrops = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fieldId } = req.params;

        const field = await findFarmerField(
            userId,
            fieldId as string
        );

        if (!field) {
            return res.status(404).json({
                success: false,
                message: "Field not found"
            });
        }

        const result = await prisma.crop.deleteMany({
            where: { fieldId: field.id }
        });

        return res.status(200).json({
            success: true,
            message: "All crops deleted successfully",
            deletedCount: result.count
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};