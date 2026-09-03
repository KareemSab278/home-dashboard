import { invoke } from "@tauri-apps/api/core";
import type { WeatherData } from "../../Types";

// Cache weather data and only refresh from the API once per hour.

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedWeather: WeatherData | null = null;
let lastWeatherCall = new Date(0);

const isCacheValid = () =>
    cachedWeather !== null &&
    new Date().getTime() - lastWeatherCall.getTime() < CACHE_TTL_MS;

const fetchWeather = async (): Promise<WeatherData> => {
    lastWeatherCall = new Date();
    cachedWeather = await invoke<WeatherData>("get_weather");
    console.log("Weather.fetch response:", cachedWeather);
    return cachedWeather;
};

export const Weather = {
    get: async (): Promise<WeatherData> => {
        if (isCacheValid()) {
            console.log("Weather.get using cached data");
            return cachedWeather!;
        }
        return fetchWeather();
    },
    getForecast: async (): Promise<WeatherData> => {
        if (isCacheValid()) {
            console.log("Weather.getForecast using cached data");
            return cachedWeather!;
        }
        return fetchWeather();
    },
};
