import { useEffect, useRef, useState } from "react";
import { Weather } from "@/Helpers/Weather/Weather";
import type { WeatherData } from "@/Types";
import { styles } from "./styles";
import { useDragScroll } from "@/Components/DragScroll/useDragScroll";

const REFRESH_INTERVAL_MS = 5 * 60_000;

const shortDay = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", { weekday: "short" });

export const WeatherPage = () => {
    const pageRef = useDragScroll();
    const [data, setData] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    const load = async () => {
        try {
            const result = await Weather.get();
            console.log("WeatherPage loaded data:", result);
            setData(result);
            setError(null);
        } catch (err) {
            console.error("WeatherPage load failed:", err);
            setError("weather_unavailable");
        }
    };

    useEffect(() => {
        load();
        intervalRef.current = window.setInterval(load, REFRESH_INTERVAL_MS);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const current = data?.current ?? null;
    const forecast = data?.forecast ?? [];

    const currentIconUrl = current?.icon
        ? current.icon.startsWith("//")
            ? `https:${current.icon}`
            : current.icon
        : undefined;

    return (
        <div ref={pageRef} style={styles.page}>
            <div style={styles.title}>Weather</div>

            {error && <span style={styles.errorText}>Could not load weather data.</span>}

            {current && (
                <div style={styles.currentCard}>
                    <div style={styles.tempBlock}>
                        <div style={styles.tempLarge}>{current.temperature}°</div>
                        <div style={styles.feelsLike}>feels like {current.feels_like}°</div>
                    </div>
                    <div style={styles.detailBlock}>
                        <div style={styles.description}>{current.description}</div>
                        {currentIconUrl && (
                            <img
                                src={currentIconUrl}
                                alt={current.description ?? "weather icon"}
                                style={styles.currentIcon}
                            />
                        )}
                        <div style={styles.metaRow}>↑{current.high}° ↓{current.low}°</div>
                        <div style={styles.metaRow}>Rain {current.rain_probability}%</div>
                        <div style={styles.metaRow}>Wind {current.wind_speed} km/h</div>
                        <div style={styles.metaRow}>
                            ↑ {current.sunrise}  ↓ {current.sunset}
                        </div>
                    </div>
                </div>
            )}

            {!current && !error && <div style={styles.emptyText}>No weather data available.</div>}

            {forecast.length > 0 && (
                <>
                    <div style={styles.sectionLabel}>10-Day Forecast</div>
                    <div style={styles.forecastGrid}>
                        {forecast.map((day, i) => {
                            const iconUrl = day.icon
                                ? day.icon.startsWith("//")
                                    ? `https:${day.icon}`
                                    : day.icon
                                : undefined;

                            return (
                                <div key={i} style={styles.forecastCell}>
                                    <div style={styles.forecastDay}>{shortDay(day.date)}</div>
                                    {iconUrl && (
                                        <img
                                            src={iconUrl}
                                            alt={day.description ?? "forecast icon"}
                                            style={styles.forecastIcon}
                                        />
                                    )}
                                    <div style={styles.forecastHigh}>
                                        ↑ {day.high != null ? Number(day.high).toFixed(1) : "—"}°
                                    </div>

                                    <div style={styles.forecastLow}>
                                        ↓ {day.low != null ? Number(day.low).toFixed(1) : "—"}°
                                    </div>
                                    {day.rain_probability != null && day.rain_probability > 0 && (
                                        <div style={styles.forecastRain}>💧 {day.rain_probability}%</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
