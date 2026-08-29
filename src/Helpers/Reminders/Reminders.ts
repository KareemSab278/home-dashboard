import { invoke } from "@tauri-apps/api/core";
import type { CreateReminderInput, RemindersResult, UpdateReminderInput } from "../../Types";

export const Reminders = {
    get: async (): Promise<RemindersResult> =>
        await invoke("get_reminders"),

    getForDate: async (date: string): Promise<RemindersResult> =>
        await invoke("get_reminders_for_date", { date }),

    getForRange: async (start: string, end: string): Promise<RemindersResult> =>
        await invoke("get_reminders_for_range", { start, end }),

    create: async (reminder: CreateReminderInput): Promise<RemindersResult> =>
        await invoke("create_reminder", { reminder }),

    update: async (id: string, reminder: UpdateReminderInput): Promise<RemindersResult> =>
        await invoke("update_reminder", { id, reminder }),

    complete: async (id: string): Promise<RemindersResult> =>
        await invoke("complete_reminder", { id }),

    dismiss: async (id: string): Promise<RemindersResult> =>
        await invoke("dismiss_reminder", { id }),

    delete: async (id: string): Promise<RemindersResult> =>
        await invoke("delete_reminder", { id }),
};
