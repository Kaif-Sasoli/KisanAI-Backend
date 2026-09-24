import { Request, Response } from "express";
import { prisma } from "../lib/prisma";


//   Get the logged-in farmer's Farmer record.
const getFarmer = async (userId: string) => {
    return await prisma.farmer.findUnique({
        where: {
            userId,
        },
    });
};


// Farmer Dashboard
export const getDashboard = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;


        const farmer = await prisma.farmer.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found",
            });
        }

        const farmerId = farmer.id;
        const [
            totalFields,
            totalCrops,
            activeCrops,
            plannedCrops,
            harvestedCrops,
            failedCrops,
            diseasePredictions,
            yieldPredictions,
            recentFields,
            recentCrops,
            recentDiseasePredictions,
            recentYieldPredictions,
        ] = await Promise.all([
            prisma.field.count({
                where: {
                    farmerId,
                },
            }),

            prisma.crop.count({
                where: {
                    field: {
                        farmerId,
                    },
                },
            }),
            prisma.crop.count({
                where: {
                    field: {
                        farmerId,
                    },
                    status: "ACTIVE",
                },
            }),

            prisma.crop.count({
                where: {
                    field: {
                        farmerId,
                    },
                    status: "PLANNED",
                },
            }),

            prisma.crop.count({
                where: {
                    field: {
                        farmerId,
                    },
                    status: "HARVESTED",
                },
            }),

            prisma.crop.count({
                where: {
                    field: {
                        farmerId,
                    },
                    status: "FAILED",
                },
            }),

            // Disease predictions
            prisma.diseasePrediction.count({
                where: { farmerId },
            }),

            // Yield predictions
            prisma.yieldPrediction.count({
                where: {
                    crop: {
                        field: {
                            farmerId,
                        },
                    },
                },
            }),

            // Recent fields
            prisma.field.findMany({
                where: {
                    farmerId,
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    area: true,
                    areaUnit: true,
                    soilType: true,
                    irrigationType: true,
                    createdAt: true,
                },
            }),

            // Recent crops
            prisma.crop.findMany({
                where: {
                    field: {
                        farmerId,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    cropName: true,
                    season: true,
                    status: true,
                    plantingDate: true,
                    expectedHarvestDate: true,
                    field: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),

            // Recent disease predictions
            prisma.diseasePrediction.findMany({
                where: {
                    farmerId,
                },
                orderBy: {
                    predictionDate: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    diseaseName: true,
                    confidence: true,
                    treatment: true,
                    predictionDate: true,
                    crop: {
                        select: {
                            id: true,
                            cropName: true,
                        },
                    },
                },
            }),

            // Recent yield predictions
            prisma.yieldPrediction.findMany({
                where: {
                    crop: {
                        field: {
                            farmerId,
                        },
                    },
                },
                orderBy: {
                    predictionDate: "desc",
                },
                take: 5,
                select: {
                    id: true,
                    predictedYield: true,
                    yieldUnit: true,
                    predictionDate: true,
                    crop: {
                        select: {
                            id: true,
                            cropName: true,
                        },
                    },
                },
            }),
        ]);

        return res.status(200).json({
            success: true,

            data: {
                statistics: {
                    fields: totalFields,

                    crops: {
                        total: totalCrops,
                        active: activeCrops,
                        planned: plannedCrops,
                        harvested: harvestedCrops,
                        failed: failedCrops,
                    },

                    predictions: {
                        disease: diseasePredictions,
                        yield: yieldPredictions,
                    },
                },

                recent: {
                    fields: recentFields,
                    crops: recentCrops,
                    diseasePredictions: recentDiseasePredictions,
                    yieldPredictions: recentYieldPredictions,
                },
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


// Crop Analytics
export const getCropAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as string;

        const farmer = await getFarmer(userId);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found",
            });
        }

        const crops = await prisma.crop.findMany({
            where: {
                field: { farmerId: farmer.id },
            },
            select: {
                id: true,
                cropName: true,
                season: true,
                status: true,
                area: true,
                areaUnit: true,
                plantingDate: true,
                expectedHarvestDate: true,
                actualHarvestDate: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const totalCrops = crops.length;

        const byStatus = {
            planned: crops.filter((crop) => crop.status === "PLANNED").length,
            active: crops.filter((crop) => crop.status === "ACTIVE").length,
            harvested: crops.filter((crop) => crop.status === "HARVESTED").length,
            failed: crops.filter((crop) => crop.status === "FAILED").length,
        };

        const cropDistribution = Object.values(
            crops.reduce((acc, crop) => {
                if (!acc[crop.cropName]) {
                    acc[crop.cropName] = {
                        cropName: crop.cropName,
                        count: 0,
                    };
                }
                acc[crop.cropName].count++;
                return acc;
            },
                {} as Record<string,
                    {
                        cropName: string;
                        count: number;
                    }
                >
            )
        );

        const seasonDistribution = Object.values(
            crops.reduce((acc, crop) => {
                if (!acc[crop.season]) {
                    acc[crop.season] = {
                        season: crop.season,
                        count: 0,
                    };
                }
                acc[crop.season].count++;
                return acc;
            },
                {} as Record<string,
                    {
                        season: string;
                        count: number;
                    }
                >
            )
        );

        const totalCropArea = crops.reduce((total, crop) => total + (crop.area || 0), 0);

        return res.status(200).json({
            success: true,
            data: {
                totalCrops,
                byStatus,
                cropDistribution,
                seasonDistribution,
                totalCropArea,
                recentCrops: crops.slice(0, 10),
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get crop analytics",
        });
    }
};


// Yield Analytics
export const getYieldAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as string;
        const farmer = await getFarmer(userId);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found",
            });
        }

        const predictions = await prisma.yieldPrediction.findMany({
            where: {
                crop: {
                    field: {
                        farmerId: farmer.id,
                    },
                },
            },
            select: {
                id: true,
                predictedYield: true,
                yieldUnit: true,
                predictionDate: true,
                createdAt: true,
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
        });

        const totalPredictions = predictions.length;
        const averagePredictedYield = totalPredictions > 0 ? predictions.reduce(
            (sum, prediction) =>
                sum + prediction.predictedYield,
            0
        ) / totalPredictions
            : 0;

        const highestPredictedYield = totalPredictions > 0
            ? Math.max(...predictions.map((prediction) => prediction.predictedYield)
            ) : 0;

        const lowestPredictedYield = totalPredictions > 0
            ? Math.min(...predictions.map((prediction) => prediction.predictedYield)
            ) : 0;

        const history = predictions.map((prediction) => ({
            id: prediction.id,
            cropId: prediction.crop.id,
            cropName: prediction.crop.cropName,
            season: prediction.crop.season,

            fieldId: prediction.crop.field.id,
            fieldName: prediction.crop.field.name,

            predictedYield: prediction.predictedYield,
            yieldUnit: prediction.yieldUnit,

            predictionDate: prediction.predictionDate,
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalPredictions,
                averagePredictedYield: Number(averagePredictedYield.toFixed(2)),
                highestPredictedYield,
                lowestPredictedYield,
                history,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get yield analytics",
        });
    }
};


// Disease Analytics
export const getDiseaseAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as string;

        const farmer = await getFarmer(userId);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found",
            });
        }

        const predictions =
            await prisma.diseasePrediction.findMany({
                where: {
                    farmerId: farmer.id,
                },
                select: {
                    id: true,
                    diseaseName: true,
                    confidence: true,
                    treatment: true,
                    predictionDate: true,

                    crop: {
                        select: {
                            id: true,
                            cropName: true,

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
            });

        const totalPredictions = predictions.length;

        // Sepeate Healty Predictions
        const healthyPredictions = predictions.filter(
            (prediction) => prediction.diseaseName.toLowerCase().includes("healthy")).length;

        const diseasedPredictions = totalPredictions - healthyPredictions;

        const diseaseDistribution = Object.values(
            predictions.reduce((acc, prediction) => {
                const name = prediction.diseaseName;
                if (!acc[name]) {
                    acc[name] = {
                        diseaseName: name,
                        count: 0,
                    };
                }
                acc[name].count++;
                return acc;
            },
                {} as Record<string,
                    {
                        diseaseName: string;
                        count: number;
                    }
                >
            )
        ).sort((a, b) => b.count - a.count);

        const averageConfidence =
            totalPredictions > 0 ? predictions.reduce(
                (sum, prediction) =>
                    sum + prediction.confidence,
                0
            ) / totalPredictions
                : 0;

        const recentPredictions = predictions.slice(0, 10)
            .map((prediction) => ({
                id: prediction.id,
                diseaseName: prediction.diseaseName,
                confidence: prediction.confidence,
                treatment: prediction.treatment,
                predictionDate: prediction.predictionDate,
                crop: prediction.crop
                    ? {
                        id: prediction.crop.id,
                        cropName: prediction.crop.cropName,
                    }
                    : null,

                field: prediction.crop?.field
                    ? {
                        id: prediction.crop.field.id,
                        name: prediction.crop.field.name,
                    }
                    : null,
            }));

        return res.status(200).json({
            success: true,
            data: {
                totalPredictions,
                healthyPredictions,
                diseasedPredictions,
                averageConfidence: Number(averageConfidence.toFixed(2)),
                diseaseDistribution,
                recentPredictions,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get disease analytics",
        });
    }
};


// Field Analytics
export const getFieldAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as string;

        const farmer = await getFarmer(userId);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found",
            });
        }

        const fields = await prisma.field.findMany({
            where: {
                farmerId: farmer.id,
            },
            select: {
                id: true,
                name: true,
                area: true,
                areaUnit: true,
                soilType: true,
                irrigationType: true,
                region: true,
                city: true,
                village: true,
                latitude: true,
                longitude: true,
                _count: {
                    select: {
                        crops: true,
                        soilDatas: true,
                        weatherDatas: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const totalFields = fields.length;
        const areaByUnit = fields.reduce((acc, field) => {
            const unit = field.areaUnit;
            if (!acc[unit]) {
                acc[unit] = 0;
            }
            acc[unit] += field.area;
            return acc;
        },
            {} as Record<string, number>
        );

        const totalCrops = fields.reduce((sum, field) => sum + field._count.crops, 0);
        const fieldDetails = fields.map((field) => ({
            id: field.id,
            name: field.name,
            area: field.area,
            areaUnit: field.areaUnit,
            soilType: field.soilType,
            irrigationType: field.irrigationType,
            region: field.region,
            city: field.city,
            village: field.village,
            latitude: field.latitude,
            longitude: field.longitude,
            cropCount: field._count.crops,
            soilRecords: field._count.soilDatas,
            weatherRecords: field._count.weatherDatas,
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalFields,
                totalCrops,
                areaByUnit,
                fields: fieldDetails,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get field analytics",
        });
    }
};


// Soil Analytics
export const getSoilAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id as string;

        const farmer = await getFarmer(userId);

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found",
            });
        }

        const fields = await prisma.field.findMany({
            where: {
                farmerId: farmer.id,
            },
            select: {
                id: true,
                name: true,
                soilType: true,
                soilDatas: {
                    orderBy: {
                        recordedAt: "desc",
                    },
                    take: 1,
                    select: {
                        id: true,
                        nitrogen: true,
                        phosphorus: true,
                        potassium: true,
                        soilPH: true,
                        soilMoisture: true,
                        organicCarbon: true,
                        recordedAt: true,
                    },
                },
            },
        });

        const soilData = fields.map((field) => ({
            fieldId: field.id,
            fieldName: field.name,
            soilType: field.soilType,
            latestSoilData: field.soilDatas.length > 0 ? field.soilDatas[0] : null,
        }));

        const fieldsWithSoilData = soilData.filter((field) => field.latestSoilData !== null).length;

        return res.status(200).json({
            success: true,
            data: {
                totalFields: fields.length,
                fieldsWithSoilData,
                fieldsWithoutSoilData: fields.length - fieldsWithSoilData,
                fields: soilData,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get soil analytics",
        });
    }
};