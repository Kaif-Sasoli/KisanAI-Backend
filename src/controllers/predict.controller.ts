import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { predictDiseaseService } from "../services/disease.service";
import { predictYieldService } from '../services/yield.service'


// Predict Disease
export const predictDisease = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Disease image is required",
            });
        }

        // Body
        const { model = "efficientnet" } = req.body;

        // DL prediction
        const prediction = await predictDiseaseService(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            model
        );


        return res.status(201).json({
            success: true,
            message: "Disease predicted successfully",
            prediction: prediction,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to predict disease",
        });

    }
}


// Predict Yield
export const predictYield = async (req: Request, res: Response) => {
    try {
        const result = await predictYieldService(req.body);

        return res.status(200).json({
            success: true,
            message: "Yield predicted successfully",
            data: result,
        });

    } catch (error: any) {
        return res.status(503).json({
            success: false,
            message: error.message
        });
    }
};