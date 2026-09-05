export type ItemStatus =
    | "upcoming"
    | "due_soon"
    | "due"
    | "overdue"
    | "completed"
    | "dismissed";

export type Reminder = {
    id: string;
    title: string;
    due_date: string;        // ISO date "2026-08-29"
    due_time: string | null; // "14:30" or null for all-day
    status: ItemStatus;
    completed: boolean;
};


export type CreateReminderInput = {
    title: string;
    due_date: string;
    due_time: string | null;
};

export type EditReminderInput = {
    title?: string;
    due_date?: string;
    due_time?: string | null;
};

export type RemindersResult = {
    reminders: Reminder[];
};

type WeatherCurrent = {
    temperature: number | null;
    feels_like: number | null;
    high: number | null;
    low: number | null;
    description: string | null;
    rain_probability: number | null;
    wind_speed: number | null;
    sunrise: string | null;
    sunset: string | null;
    icon: string | null;
};

type WeatherForecastDay = {
    date: string;
    high: number | null;
    low: number | null;
    description: string | null;
    rain_probability: number | null;
    icon: string | null;
};

export type WeatherData = {
    current: WeatherCurrent;
    forecast: WeatherForecastDay[]; // for 10 days or something
};


export const STATUS_COLORS: Record<ItemStatus, string> = {
    upcoming: "#22c55e",
    due_soon: "#eab308",
    due: "#eab308",
    overdue: "#ef4444",
    completed: "#555",
    dismissed: "#555",
};


export type CameraResult = {
    path: string;
};