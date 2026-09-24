import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { getWeatherData } from "../services/weather.service.js";

// Get Weather
export const getWeather = async (req: Request, res: Response) => {
    try {

        const userId = req.user?.id;

        // Find farmer profile
        const farmer = await prisma.farmer.findUnique({
            where: {
                userId: userId
            },
            select: {
                city: true
            }
        });

        if (!farmer) {
            return res.status(404).json({
                success: false,
                message: "Farmer profile not found"
            });
        }

        // Check city
        if (!farmer.city || farmer.city.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Please update your city in your profile to get weather information."
            });
        }

        // Get weather using farmer's city
        const weather = await getWeatherData({
            city: farmer.city
        });

        return res.status(200).json({
            success: true,
            message: "Weather fetched successfully",
            weather
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: error.message || "Unable to fetch weather data"
        });
    }
};