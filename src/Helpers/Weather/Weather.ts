import { invoke } from "@tauri-apps/api/core";
import type { WeatherData } from "../../Types";

export const Weather = {
    get: async (): Promise<WeatherData> => {
        const result = await invoke<WeatherData>("get_weather");
        console.log("Weather.get response:", result);
        return result;
    },
    getForecast: async (): Promise<WeatherData> => {
        const result = await invoke<WeatherData>("get_weather");
        console.log("Weather.getForecast response:", result);
        return result;
    },
};
