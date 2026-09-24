import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { predictYieldService } from "../services/yield.service.js";
import { fetchAndStoreWeatherData } from '../services/weather-data.service.js'


// Predict Yield
export const predictYield = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { cropId } = req.params;
        const { Fertilizer_Used = 0, Pesticide_Used = 0, Sunlight_Hours } = req.body;


        // Get crop + field
        const crop = await prisma.crop.findFirst({
            where: {
                id: cropId as string,
                field: {
                    farmer: { userId },
                },
            },
            include: { field: true },
        });

        if (!crop) {
            return res.status(404).json({
                success: false,
                message: "Crop not found",
            });
        }

        const field = crop.field;

        if (field.altitude === null || field.soilType === null ||
            field.region === null || field.irrigationType === null ||
            !field.city
        ) {
            return res.status(400).json({
                success: false,
                message: "Please complete field location, altitude, soil type, region and irrigation information",
            });
        }

        // Get soil data
        const soilData = await prisma.soilData.findFirst({
            where: {
                fieldId: field.id,
            },
            orderBy: {
                recordedAt: "desc",
            },
        });

        if (!soilData) {
            return res.status(400).json({
                success: false,
                message: "No soil data found. Please add soil data before predicting yield",
            });
        }

        // Required soil values
        if (soilData.nitrogen === null || soilData.phosphorus === null ||
            soilData.potassium === null || soilData.soilPH === null ||
            soilData.soilMoisture === null || soilData.organicCarbon === null) {
            return res.status(400).json({
                success: false,
                message: "Latest soil data is incomplete. Please complete all soil values",
            });
        }

        //  Fetch weather and save it
        const weatherData = await fetchAndStoreWeatherData(field.id, field.city);

        if (weatherData.temperature === null || weatherData.humidity === null ||
            weatherData.rainfall === null || weatherData.windSpeed === null) {
            return res.status(400).json({
                success: false,
                message: "Weather data is incomplete",
            });
        }

        // Build ML input
        const predictionData = {
            // Soil - DB
            N: soilData.nitrogen,
            P: soilData.phosphorus,
            K: soilData.potassium,
            Soil_pH: soilData.soilPH,
            Soil_Moisture: soilData.soilMoisture,
            Organic_Carbon: soilData.organicCarbon,

            // Weather - API
            Temperature: weatherData.temperature,
            Humidity: weatherData.humidity,
            Rainfall: weatherData.rainfall,
            Wind_Speed: weatherData.windSpeed,

            // User input
            Sunlight_Hours: Number(Sunlight_Hours),
            Fertilizer_Used: Number(Fertilizer_Used),
            Pesticide_Used: Number(Pesticide_Used),

            // Field - DB
            Altitude: field.altitude,
            Soil_Type: field.soilType,
            Region: field.region,
            Irrigation_Type: field.irrigationType,

            // Crop - DB
            Season: crop.season,
            Crop_Type: crop.cropName,
        };

        // Send data to ML service
        const prediction = await predictYieldService(predictionData);

        // Save prediction
        const savedPrediction = await prisma.yieldPrediction.create({
            data: {
                farmerId: crop.field.farmerId,
                cropId: crop.id,
                predictedYield: prediction.prediction,
                inputData: predictionData,
            },
        });

        // Response
        return res.status(201).json({
            success: true,
            message: "Yield predicted successfully",
            data: {
                prediction: savedPrediction,
                weather: {
                    temperature: weatherData.temperature,
                    humidity: weatherData.humidity,
                    rainfall: weatherData.rainfall,
                    windSpeed: weatherData.windSpeed,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to predict yield",
        });
    }
};




// Get one yield prediction
export const getYieldPrediction = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { predictionId } = req.params;

        const prediction = await prisma.yieldPrediction.findFirst({
            where: {
                id: predictionId as string,
                // crop: {
                //     field: {
                //         farmer: { userId },
                //     },
                // },
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
                        field: {
                            select: {
                                id: true,
                                name: true,
                                farmerId: true,
                            },
                        },
                    },
                },
            },
        });

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: "Yield prediction not found",
            });
        }

        return res.status(200).json({ success: true, data: prediction });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch yield prediction",
        });
    }
};


// Get all yield predictions with pagination
export const getYieldPredictions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const where = {
            crop: {
                field: {
                    farmer: {
                        userId,
                    },
                },
            },
        };

        const [predictions, total] = await prisma.$transaction([
            prisma.yieldPrediction.findMany({
                where,
                include: {
                    crop: {
                        select: {
                            id: true,
                            cropName: true,
                            season: true,
                            field: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    predictionDate: "desc",
                },
                skip,
                take: limit,
            }),

            prisma.yieldPrediction.count({
                where,
            }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            data: predictions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch yield predictions",
        });
    }
};



// Delete one yield prediction
export const deleteYieldPrediction = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { predictionId } = req.params;

        // Check ownership first
        const prediction = await prisma.yieldPrediction.findFirst({
            where: {
                id: predictionId as string,
                crop: {
                    field: {
                        farmer: {
                            userId,
                        },
                    },
                },
            },
        });

        if (!prediction) {
            return res.status(404).json({
                success: false,
                message: "Yield prediction not found",
            });
        }

        await prisma.yieldPrediction.delete({
            where: {
                id: predictionId as string,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Yield prediction deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete yield prediction",
        });
    }
};


// Delete all yield predictions
export const deleteAllYieldPredictions = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        await prisma.yieldPrediction.deleteMany({
            where: {
                crop: {
                    field: {
                        farmer: {
                            userId,
                        },
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: "All yield predictions deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete yield predictions",
        });
    }
};