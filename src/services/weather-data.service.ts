import { prisma } from "../lib/prisma.js";
import { getWeatherData } from "./weather.service.js";


// Fetch And Store Weather Data
export const fetchAndStoreWeatherData = async (fieldId: string, city: string) => {

    // Get fresh weather
    const weather = await getWeatherData({ city: city });

    // Store 
    const weatherData = await prisma.weatherData.create({
        data: {
            fieldId,
            temperature: weather.temperature,
            humidity: weather.humidity,
            rainfall: weather.fiveDayRainfall,
            rainProbability: weather.rainProbability,
            windSpeed: weather.windSpeed,
            weather: weather.weather,

            recordedAt: new Date()
        }
    });

    return weatherData;
};