import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";


// Admin Dashboard
export const getAdminDashboard = async (req: Request, res: Response) => {
    try {

        const [
            totalUsers,
            totalFarmers,
            totalFields,
            totalCrops,
            activeCrops,
            harvestedCrops,
            totalDiseasePredictions,
            totalYieldPredictions,
            totalSoilRecords,
            totalWeatherRecords,
            recentFarmers,
            recentDiseasePredictions,
            recentYieldPredictions,
        ] = await Promise.all([

            prisma.user.count({
                where: { role: "FARMER" },
            }),

            prisma.farmer.count(),
            prisma.field.count(),
            prisma.crop.count(),
            prisma.crop.count({
                where: { status: "ACTIVE" },
            }),
            prisma.crop.count({
                where: { status: "HARVESTED" },
            }),

            prisma.diseasePrediction.count(),
            prisma.yieldPrediction.count(),
            prisma.soilData.count(),
            prisma.weatherData.count(),
            prisma.farmer.findMany({
                take: 5,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    province: true,
                    city: true,
                    district: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            profileImageUrl: true,
                        },
                    },
                },
            }),

            prisma.diseasePrediction.findMany({
                take: 5,
                orderBy: {
                    predictionDate: "desc",
                },
                select: {
                    id: true,
                    diseaseName: true,
                    confidence: true,
                    predictionDate: true,

                    farmer: {
                        select: {
                            user: {
                                select: {
                                    fullName: true,
                                },
                            },
                        },
                    },

                    crop: {
                        select: {
                            cropName: true,
                        },
                    },
                },
            }),

            prisma.yieldPrediction.findMany({
                take: 5,
                orderBy: {
                    predictionDate: "desc",
                },
                select: {
                    id: true,
                    predictedYield: true,
                    yieldUnit: true,
                    predictionDate: true,

                    crop: {
                        select: {
                            cropName: true,

                            field: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalFarmers,
                    totalFields,
                    totalCrops,
                    activeCrops,
                    harvestedCrops,
                    totalDiseasePredictions,
                    totalYieldPredictions,
                    totalSoilRecords,
                    totalWeatherRecords,
                },

                recentFarmers,
                recentDiseasePredictions,
                recentYieldPredictions,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get admin dashboard",
        });
    }
};


// Overview Analytics
export const getAdminOverviewAnalytics = async (req: Request, res: Response) => {
    try {

        const [users, farmers, fields, crops,
            diseases, yields, soil, weather,
        ] = await Promise.all([
            prisma.user.count({
                where: { role: "FARMER" },
            }),

            prisma.farmer.count(),
            prisma.field.count(),
            prisma.crop.count(),
            prisma.diseasePrediction.count(),
            prisma.yieldPrediction.count(),
            prisma.soilData.count(),
            prisma.weatherData.count(),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                users,
                farmers,
                fields,
                crops,
                diseasePredictions: diseases,
                yieldPredictions: yields,
                soilRecords: soil,
                weatherRecords: weather,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get overview analytics",
        });
    }
};


export const getAdminUserAnalytics = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count({
            where: {
                role: "FARMER",
            },
        });

        const verifiedUsers = await prisma.user.count({
            where: {
                role: "FARMER",
                isEmailVerified: true,
            },
        });

        const unverifiedUsers = totalUsers - verifiedUsers;

        const googleUsers = await prisma.user.count({
            where: {
                role: "FARMER",
                providerType: "GOOGLE",
            },
        });

        const emailUsers = await prisma.user.count({
            where: {
                role: "FARMER",
                providerType: "EMAIL",
            },
        });

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                verifiedUsers,
                unverifiedUsers,
                providers: {
                    google: googleUsers,
                    email: emailUsers,
                },
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get user analytics",
        });
    }
};

// Farmer Analytics
export const getAdminFarmerAnalytics = async (req: Request, res: Response) => {
    try {

        const farmers = await prisma.farmer.findMany({
            select: {
                id: true,
                province: true,
                city: true,
                district: true,
                createdAt: true,
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        isEmailVerified: true,
                        providerType: true,
                        createdAt: true,
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

        const byProvince = Object.values(
            farmers.reduce(
                (acc, farmer) => {
                    const province = farmer.province || "UNKNOWN";
                    if (!acc[province]) {
                        acc[province] = {
                            province,
                            count: 0,
                        };
                    }
                    acc[province].count++;
                    return acc;
                },
                {} as Record<string,
                    {
                        province: string;
                        count: number;
                    }
                >
            )
        );

        return res.status(200).json({
            success: true,
            data: {
                totalFarmers: farmers.length,
                byProvince,
                farmers: farmers.map((farmer) => ({
                    id: farmer.id,
                    fullName: farmer.user.fullName,
                    email: farmer.user.email,
                    province: farmer.province,
                    city: farmer.city,
                    district: farmer.district,
                    verified: farmer.user.isEmailVerified,
                    provider: farmer.user.providerType,
                    fieldCount: farmer._count.fields,
                    diseasePredictionCount: farmer._count.diseasePredictions,
                    createdAt: farmer.createdAt,
                })),
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get farmer analytics",
        });
    }
};


// Field Analytics
export const getAdminFieldAnalytics = async (req: Request, res: Response) => {
    try {
        const fields = await prisma.field.findMany({
            select: {
                id: true,
                name: true,
                area: true,
                areaUnit: true,
                soilType: true,
                irrigationType: true,
                region: true,
                province: true,
                city: true,
                village: true,
                farmer: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        crops: true,
                        soilDatas: true,
                        weatherDatas: true,
                    },
                },
            },
        });

        const areaByUnit = fields.reduce((acc, field) => {

            if (!acc[field.areaUnit]) {
                acc[field.areaUnit] = 0;
            }
            acc[field.areaUnit] += field.area;
            return acc;
        },
            {} as Record<string, number>
        );

        const bySoilType = Object.values(
            fields.reduce((acc, field) => {
                const soil = field.soilType || "UNKNOWN";
                if (!acc[soil]) {
                    acc[soil] = {
                        soilType: soil,
                        count: 0,
                    };
                }
                acc[soil].count++;
                return acc;
            },
                {} as Record<string,
                    {
                        soilType: string;
                        count: number;
                    }
                >
            )
        );

        const byIrrigation = Object.values(
            fields.reduce((acc, field) => {
                const irrigation = field.irrigationType || "UNKNOWN";
                if (!acc[irrigation]) {
                    acc[irrigation] = {
                        irrigationType: irrigation,
                        count: 0,
                    };
                }
                acc[irrigation].count++;
                return acc;
            },
                {} as Record<string,
                    {
                        irrigationType: string;
                        count: number;
                    }
                >
            )
        );

        return res.status(200).json({
            success: true,
            data: {
                totalFields: fields.length,
                areaByUnit,
                bySoilType,
                byIrrigation,
                fields,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get field analytics",
        });
    }
};

export const getAdminCropAnalytics = async (req: Request, res: Response) => {
    try {

        const crops = await prisma.crop.findMany({
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
                field: {
                    select: {
                        id: true,
                        name: true,
                        farmer: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const byCrop = Object.values(
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

        const bySeason = Object.values(
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

        const byStatus = Object.values(
            crops.reduce((acc, crop) => {
                if (!acc[crop.status]) {
                    acc[crop.status] = {
                        status: crop.status,
                        count: 0,
                    };
                }
                acc[crop.status].count++;
                return acc;
            },
                {} as Record<string,
                    {
                        status: string;
                        count: number;
                    }
                >
            )
        );

        return res.status(200).json({
            success: true,
            data: {
                totalCrops: crops.length,
                byCrop,
                bySeason,
                byStatus,
                crops,
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get crop analytics",
        });
    }
};

// Disease Analytics
export const getAdminDiseaseAnalytics = async (req: Request, res: Response) => {
    try {
        const predictions = await prisma.diseasePrediction.findMany({
            select: {
                id: true,
                diseaseName: true,
                confidence: true,
                predictionDate: true,
                farmer: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },

                crop: {
                    select: {
                        cropName: true,
                    },
                },
            },
            orderBy: {
                predictionDate: "desc",
            },
        });

        const totalPredictions = predictions.length;
        const healthyPredictions = predictions.filter((prediction) =>
            prediction.diseaseName
                .toLowerCase()
                .includes("healthy")
        ).length;

        const diseasedPredictions = totalPredictions - healthyPredictions;

        const averageConfidence = totalPredictions > 0 ? predictions.reduce(
            (sum, prediction) =>
                sum + prediction.confidence,
            0
        ) / totalPredictions
            : 0;

        const diseaseDistribution = Object.values(predictions.reduce(
            (acc, prediction) => {
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

        return res.status(200).json({
            success: true,
            data: {
                totalPredictions,
                healthyPredictions,
                diseasedPredictions,
                averageConfidence: Number(averageConfidence.toFixed(2)),
                diseaseDistribution,
                recentPredictions: predictions.slice(0, 20),
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get disease analytics",
        });
    }
};


// Yield Analytics
export const getAdminYieldAnalytics = async (req: Request, res: Response) => {
    try {

        const predictions = await prisma.yieldPrediction.findMany({
            select: {
                id: true,
                predictedYield: true,
                yieldUnit: true,
                predictionDate: true,
                crop: {
                    select: {
                        cropName: true,
                        season: true,
                        field: {
                            select: {
                                name: true,
                                farmer: {
                                    select: {
                                        user: {
                                            select: {
                                                fullName: true,
                                            },
                                        },
                                    },
                                },
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

        const averageYield = totalPredictions > 0 ? predictions.reduce(
            (sum, prediction) => sum + prediction.predictedYield, 0) / totalPredictions : 0;

        const highestYield = totalPredictions > 0 ? Math.max(...predictions.map((p) => p.predictedYield)) : 0;

        const lowestYield = totalPredictions > 0 ? Math.min(...predictions.map((p) => p.predictedYield)) : 0;

        const byCrop = Object.values(predictions.reduce((acc, prediction) => {
            const crop = prediction.crop.cropName;
            if (!acc[crop]) {
                acc[crop] = {
                    cropName: crop,
                    count: 0,
                    totalYield: 0,
                };
            }
            acc[crop].count++;
            acc[crop].totalYield +=
                prediction.predictedYield;
            return acc;
        },
            {} as Record<string,
                {
                    cropName: string;
                    count: number;
                    totalYield: number;
                }
            >
        )
        ).map((item) => ({
            cropName: item.cropName,
            predictionCount: item.count,
            averageYield: Number((item.totalYield / item.count).toFixed(2)),
        }));

        return res.status(200).json({
            success: true,
            data: {
                totalPredictions,
                averageYield: Number(averageYield.toFixed(2)),
                highestYield,
                lowestYield,
                byCrop,
                history: predictions.slice(0, 10),
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get yield analytics",
        });
    }
};

// Soil Analytics
export const getAdminSoilAnalytics = async (req: Request, res: Response) => {
    try {
        const fields = await prisma.field.findMany({
            select: {
                id: true,
                name: true,
                soilType: true,
                farmer: {
                    select: {
                        user: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
                soilDatas: {
                    orderBy: {
                        recordedAt: "desc",
                    },
                    take: 1,
                    select: {
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
            orderBy: {
                updatedAt: "desc",
            },
        });

        const fieldsWithData = fields.filter((field) => field.soilDatas.length > 0);

        const calculateAverage = (values: (number | null)[]) => {

            const validValues = values.filter(
                (value): value is number =>
                    value !== null
            );
            if (validValues.length === 0) {
                return null;
            }
            return Number(
                (validValues.reduce((sum, value) =>
                    sum + value, 0) / validValues.length).toFixed(2)
            );
        };

        const latestSoil = fieldsWithData.map((field) => field.soilDatas[0]);

        return res.status(200).json({
            success: true,
            data: {
                totalFields: fields.length,
                fieldsWithSoilData: fieldsWithData.length,
                fieldsWithoutSoilData: fields.length - fieldsWithData.length,
                averages: {
                    nitrogen: calculateAverage(latestSoil.map((soil) => soil.nitrogen)),
                    phosphorus: calculateAverage(latestSoil.map((soil) => soil.phosphorus)),
                    potassium: calculateAverage(latestSoil.map((soil) => soil.potassium)),
                    soilPH: calculateAverage(latestSoil.map((soil) => soil.soilPH)),
                    soilMoisture: calculateAverage(latestSoil.map((soil) => soil.soilMoisture)),
                    organicCarbon: calculateAverage(latestSoil.map((soil) => soil.organicCarbon)),
                },
                fields: fields.slice(0, 10).map((field) => ({
                    fieldId: field.id,
                    fieldName: field.name,
                    soilType: field.soilType,
                    farmer: field.farmer.user.fullName,
                    latestSoilData: field.soilDatas[0] || null,
                })),
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get soil analytics",
        });
    }
};

// Weather Analytics
export const getAdminWeatherAnalytics = async (req: Request, res: Response) => {
    try {
        const weather = await prisma.weatherData.findMany({
            select: {
                id: true,
                temperature: true,
                humidity: true,
                rainfall: true,
                rainProbability: true,
                windSpeed: true,
                weather: true,
                recordedAt: true,
                field: {
                    select: {
                        id: true,
                        name: true,
                        farmer: {
                            select: {
                                user: {
                                    select: {
                                        fullName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

            orderBy: { recordedAt: "desc", },
        });

        const calculateAverage = (values: (number | null)[]) => {

            const valid = values.filter(
                (value): value is number =>
                    value !== null
            );

            if (valid.length === 0) {
                return null;
            }

            return Number((valid.reduce((sum, value) =>
                sum + value, 0) / valid.length).toFixed(2));
        };

        const weatherDistribution =
            Object.values(weather.reduce((acc, record) => {
                const condition = record.weather || "UNKNOWN";
                if (!acc[condition]) {
                    acc[condition] = {
                        weather: condition,
                        count: 0,
                    };
                }
                acc[condition].count++;
                return acc;
            },
                {} as Record<string,
                    {
                        weather: string;
                        count: number;
                    }
                >
            )
            );

        return res.status(200).json({
            success: true,
            data: {
                totalRecords: weather.length,
                averages: {
                    temperature: calculateAverage(weather.map((w) => w.temperature)),
                    humidity: calculateAverage(weather.map((w) => w.humidity)),
                    rainfall: calculateAverage(weather.map((w) => w.rainfall)),
                    rainProbability: calculateAverage(weather.map((w) => w.rainProbability)),
                    windSpeed: calculateAverage(weather.map((w) => w.windSpeed)),
                },
                weatherDistribution,
                recentWeather: weather.slice(0, 5),
            },
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to get weather analytics",
        });
    }
};