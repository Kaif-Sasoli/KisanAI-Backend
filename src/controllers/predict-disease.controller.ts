import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";
import { uploadImage } from "../services/cloudinary.service.js";
import { predictDiseaseService } from "../services/disease.service.js";
import { getDiseaseTreatment } from '../utils/disease.utils.js'
import cloudinary from "../config/cloudinary.config.js";


// Predict Disease
export const predictDisease = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Disease image is required",
            });
        }

        // Body
        const { cropId, model = "efficientnet" } = req.body;

        // Get te Crop
        const crop = await prisma.crop.findFirst({
            where: {
                id: cropId,
                field: {
                    farmer: {
                        userId,
                    },
                },
            },
            include: {
                field: {
                    select: { farmerId: true, },
                },
            },
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        // DL prediction
        const prediction = await predictDiseaseService(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            model
        );

        const diseaseName = prediction.prediction;
        const treatment = getDiseaseTreatment(diseaseName);

        // Upload AFTER prediction
        const cloudinaryImage = await uploadImage(req.file.buffer, `disease/${diseaseName}`);

        // Save prediction
        const savedPrediction = await prisma.diseasePrediction.create({
            data: {
                farmerId: crop.field.farmerId,
                cropId: crop.id,
                imageUrl: cloudinaryImage.imageUrl,
                imagePublicId: cloudinaryImage.publicId,
                diseaseName,
                confidence: prediction.confidence,
                treatment: treatment as unknown as Prisma.InputJsonValue
            },
        });

        return res.status(201).json({
            success: true,
            message: "Disease predicted successfully",
            data: savedPrediction,
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to predict disease",
        });
    }
};


// Get one prediction
export const getDiseasePrediction = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { predictionId } = req.params;

        const prediction = await prisma.diseasePrediction.findFirst({
            where: {
                id: predictionId as string,
                farmer: {
                    userId,
                },
            },
            include: {
                crop: true,
            },
        });

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: "Disease prediction not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: prediction,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch disease prediction",
        });
    }
};


// Get all disease predictions
export const getDiseasePredictions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;


        const predictions = await prisma.diseasePrediction.findMany({
            where: {
                farmer: {
                    userId,
                },
            },
            include: {
                crop: {
                    select: {
                        id: true,
                        cropName: true,
                        season: true,
                    },
                },
            },
            orderBy: { predictionDate: "desc" },
        });

        return res.status(200).json({
            success: true,
            count: predictions.length,
            data: predictions,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch disease predictions",
        });
    }
};


// Delete one prediction
export const deleteDiseasePrediction = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { predictionId } = req.params;

        const prediction = await prisma.diseasePrediction.findFirst({
            where: {
                id: predictionId as string,
                farmer: { userId },
            },
        });

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: "Disease prediction not found",
            });
        }

        // Delete Cloudinary image
        if (prediction.imagePublicId) {
            await cloudinary.uploader.destroy(prediction.imagePublicId);
        }

        // Delete database record
        await prisma.diseasePrediction.delete({
            where: { id: predictionId as string },
        });

        return res.status(200).json({
            success: true,
            message: "Disease prediction deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete disease prediction",
        });
    }
};


export const deleteAllDiseasePredictions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const predictions = await prisma.diseasePrediction.findMany({
            where: {
                farmer: {
                    userId,
                },
            },
            select: {
                id: true,
                imagePublicId: true,
            },
        });

        for (const prediction of predictions) {
            if (prediction.imagePublicId) {
                await cloudinary.uploader.destroy(
                    prediction.imagePublicId
                );
            }
        }

        await prisma.diseasePrediction.deleteMany({
            where: {
                farmer: { userId, },
            },
        });

        return res.status(200).json({
            success: true,
            message: "All disease predictions deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete disease predictions",
        });
    }
};