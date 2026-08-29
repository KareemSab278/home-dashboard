import { invoke } from "@tauri-apps/api/core";
import type { WeatherCurrent, WeatherData } from "../../Types";

export const Weather = {
    get: async (): Promise<WeatherCurrent> => await invoke("get_weather"),

    getForecast: async (): Promise<WeatherData> => await invoke("get_weather_forecast"),
};
