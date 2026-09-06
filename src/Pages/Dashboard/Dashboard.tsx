import { useEffect, useRef, useState } from "react";
import type { RemindersResult, ItemStatus, WeatherData } from "@/Types";
import { STATUS_COLORS } from "@/Types";
import { styles } from "./styles";
import { useDragScroll } from "@/Components/DragScroll/useDragScroll";
import { Reminders } from "@/Helpers/Reminders/Reminders";
import { Weather } from "@/Helpers/Weather/Weather";
import { KillApp } from "@/Helpers/Environment/environment"; 

const REFRESH_INTERVAL_MS = 60_000;

const formatTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const StatusBadge = ({ status }: { status: ItemStatus }) => (
    <span
        style={{
            ...styles.statusBadge,
            background: STATUS_COLORS[status] + "22",
            color: STATUS_COLORS[status],
        }}
    >
        {status.replace("_", " ")}
    </span>
);

export const DashboardPage = () => {
    const pageRef = useDragScroll();
    const [time, setTime] = useState(formatTime());
    const [data, setData] = useState<RemindersResult | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    const load = async () => {
        try {
            const [reminders, weather] = await Promise.all([Reminders.get(), Weather.get()]);
            console.log("Dashboard loaded weather:", weather);

            setData(reminders);
            setWeather(weather);
            setError(null);
        } catch (err) {
            console.error("Dashboard load failed:", err);
            setError("dashboard_unavailable");
        }
    };

    useEffect(() => {
        load();
        intervalRef.current = window.setInterval(load, REFRESH_INTERVAL_MS);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    useEffect(() => {
        const tick = () => setTime(formatTime());
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const reminders = data?.reminders ?? [];
    const todayReminders = reminders.filter(reminder => {
        const today = new Date();
        const dueDate = new Date(reminder.due_date);
        return dueDate.toDateString() === today.toDateString();
    });

    const tomorrowReminders = reminders.filter(reminder => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = new Date(reminder.due_date);
        return dueDate.toDateString() === tomorrow.toDateString();
    });
    
    const next = reminders.find(reminder => {
        const dueDate = new Date(reminder.due_date);
        const now = new Date();
        return dueDate > now;
    }) ?? null;
    // const weather = data?.weather ?? null;

    return (
        <div ref={pageRef} style={styles.page}>
            <div style={styles.header}>
                <div>
                    <div style={styles.time}>{time}</div>
                    <div style={styles.dateText}>{formatDate()}</div>
                </div>
            </div>

            {error && <span style={styles.errorText}>Could not load dashboard data.</span>}

            {next && (
                <div style={styles.section}>
                    <div style={styles.sectionLabel}>Next</div>
                    <div
                        style={{
                            ...styles.nextItem,
                            borderColor: STATUS_COLORS[next.status] + "44",
                        }}
                    >
                        <div style={styles.nextItemTitle}>{next.title}</div>
                        <div style={styles.nextItemMeta}>
                            {next.due_time && <span>{next.due_time} · </span>}
                            <StatusBadge status={next.status} />
                        </div>
                    </div>
                </div>
            )}

            {weather && (
                <div style={styles.section}>
                    <div style={styles.sectionLabel}>Weather</div>
                    <div style={styles.weatherRow}>
                        <div style={styles.weatherTemp}>
                            {weather.current.temperature != null ? `${weather.current.temperature}°` : "—"}
                        </div>
                        <div style={styles.weatherDetail}>
                            {weather.current.description && <div>{weather.current.description}</div>}
                            {weather.current.rain_probability != null && (
                                <div>Rain {weather.current.rain_probability}%</div>
                            )}
                            {weather.current.high != null && weather.current.low != null && (
                                <div>↑{weather.current.high}° ↓{weather.current.low}°</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.section}>
                <div style={styles.sectionLabel}>Today</div>
                {todayReminders.length === 0 && (
                    <div style={styles.emptyText}>Nothing scheduled.</div>
                )}
                {todayReminders.map((r) => (
                    <div key={r.id} style={styles.eventRow}>
                        <div style={{ ...styles.eventDot, background: STATUS_COLORS[r.status] }} />
                        <span style={styles.eventTime}>{r.due_time ?? ""}</span>
                        <span style={styles.eventTitle}>{r.title}</span>
                        <StatusBadge status={r.status} />
                    </div>
                ))}
            </div>

            {tomorrowReminders.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionLabel}>Tomorrow</div>
                    {tomorrowReminders.map((r) => (
                        <div key={r.id} style={styles.eventRow}>
                            <div style={{ ...styles.eventDot, background: STATUS_COLORS[r.status] }} />
                            <span style={styles.eventTime}>{r.due_time ?? ""}</span>
                            <span style={styles.eventTitle}>{r.title}</span>
                        </div>
                    ))}
                </div>
            )}
            <KillApp />

        </div>
    );
};
