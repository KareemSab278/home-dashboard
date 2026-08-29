import { invoke } from "@tauri-apps/api/core";
import type { DashboardData, Reminder, RemindersResult } from "../../Types";

export const Dashboard = {
    get: async (): Promise<DashboardData> => await invoke("get_dashboard"),

    getTodayOverview: async (): Promise<Reminder[]> => await invoke("get_today_overview"),

    getUpcomingItems: async (): Promise<RemindersResult> => await invoke("get_upcoming_items"),

    getNextItem: async (): Promise<Reminder | null> => await invoke("get_next_item"),
};
