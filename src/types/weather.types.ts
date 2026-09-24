
// Weather Type
export interface WeatherData {
    city: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    weather: string;
    rainProbability: number;
    fiveDayRainfall: number;
}


export interface WeatherLocation {
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}
