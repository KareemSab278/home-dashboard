import { DashboardPage } from "./Pages/Dashboard/Dashboard";
import { CalendarPage } from "./Pages/Calendar/Calendar";
import { WeatherPage } from "./Pages/Weather/Weather";
import { RemindersPage } from "./Pages/Reminders/Reminders";
import { JSX } from "react";
import { CameraFeed } from "./Components/Camera/CameraFeed";

export const routes: { path: string; element: JSX.Element }[] = [
    { path: "/", element: <DashboardPage /> },
    { path: "/calendar", element: <CalendarPage /> },
    { path: "/weather", element: <WeatherPage /> },
    { path: "/reminders", element: <RemindersPage /> },
    { path: "/camera", element: <CameraFeed /> },
];
