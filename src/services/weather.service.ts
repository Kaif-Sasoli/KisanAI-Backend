import axios from "axios";
import { WeatherData, WeatherLocation } from "../types/weather.types.js";


const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Get Weather
export const getWeatherData = async ({
    city,
    latitude,
    longitude,
}: WeatherLocation): Promise<WeatherData> => {
    try {

        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            throw new Error("OPENWEATHER_API_KEY is not configured");
        }

        // Validate location
        const hasCoordinates = latitude !== undefined && latitude !== null &&
            longitude !== undefined && longitude !== null;

        const hasCity = city !== undefined && city !== null && city.trim() !== "";

        if (!hasCoordinates && !hasCity) {
            throw new Error("City or latitude and longitude are required")
        }

        // Build API parameters
        const params: Record<string, string | number> = {
            units: "metric",
            appid: apiKey,
        };

        // Prefer coordinates
        if (hasCoordinates) {
            params.lat = latitude!;
            params.lon = longitude!;

        } else if (hasCity) {
            params.q = city!.trim();
        }

        // Call OpenWeather
        const response = await axios.get(
            OPENWEATHER_URL,
            {
                params,
            }
        );

        const data = response.data;
        const forecast = data.list;

        if (!forecast || forecast.length === 0) {
            throw new Error("No weather forecast data available");
        }

        const current = forecast[0];

        // Five-day rainfall
        const fiveDayRainfall = forecast.reduce((total: number, item: any) => {
            return (
                total + (item.rain?.["3h"] ?? 0)
            );

        },
            0
        );

        // Return normalized weather data
        return {
            city: data.city?.name ?? city ?? "Unknown",
            temperature: current.main?.temp ?? 0,
            humidity: current.main?.humidity ?? 0,
            windSpeed: current.wind?.speed ?? 0,
            weather: current.weather?.[0]?.description ?? "Unknown",
            rainProbability: Number(((current.pop ?? 0) * 100).toFixed(2)),
            fiveDayRainfall: Number(fiveDayRainfall.toFixed(2)),
        };

    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Unable to fetch weather data");
    }
};

