import { useEffect, useState } from "react";
import { Reminders } from "@/Helpers/Reminders/Reminders";
import { Buttons } from "@/Components/Button/Button";
import type { Reminder } from "@/Types";
import { STATUS_COLORS } from "@/Types";
import { styles } from "./styles";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const toDateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const formatModalDate = (dateKey: string) =>
    new Date(dateKey + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long",
    });

const DayModal = ({
    dateKey,
    reminders,
    onClose,
    onComplete,
    onDelete,
}: {
    dateKey: string;
    reminders: Reminder[];
    onClose: () => void;
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
}) => (
    <div style={styles.modalOverlay} onPointerDown={onClose}>
        <div style={styles.modal} onPointerDown={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>{formatModalDate(dateKey)}</div>
            {reminders.length === 0 ? (
                <>
                    <div style={styles.emptyText}>No reminders.</div>
                    <Buttons.nav title="Add Reminder" onClick={() => { }} onNavigateTo="/reminders" style={styles.addButton} />
                </>
            ) : (
                reminders.map((r) => (
                    <div key={r.id} style={styles.modalRow}>
                        <div
                            style={{
                                ...styles.eventDot,
                                background: STATUS_COLORS[r.status],
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    ...styles.eventTitle,
                                    ...(r.completed ? { textDecoration: "line-through", color: "#444" } : {}),
                                }}
                            >
                                {r.title}
                            </div>
                            {r.due_time && (
                                <div style={styles.eventTime}>{r.due_time}</div>
                            )}
                        </div>
                        {!r.completed && (
                            <Buttons.main title="Done" onClick={() => onComplete(r.id)} style={styles.actionButton} />
                        )}
                        <Buttons.main title="✕" onClick={() => onDelete(r.id)} style={styles.actionButton} />
                    </div>
                ))
            )}
            <Buttons.main title="Close" onClick={onClose} style={styles.closeButton} />
        </div>
    </div>
);

export const CalendarPage = () => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const load = async (start: string, end: string) => {
        try {
            const result = await Reminders.getForRange(start, end);
            setReminders(result.reminders ?? []);
            setError(null);
        } catch {
            setError("reminders_unavailable");
        }
    };

    useEffect(() => {
        const firstDay = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
        const lastDay = new Date(viewYear, viewMonth + 1, 0);
        load(firstDay, toDateKey(lastDay));
    }, [viewYear, viewMonth]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
        else setViewMonth((m) => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
        else setViewMonth((m) => m + 1);
    };

    const byDate = reminders.reduce<Record<string, Reminder[]>>((acc, r) => {
        acc[r.due_date] = [...(acc[r.due_date] ?? []), r];
        return acc;
    }, {});

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const handleComplete = async (id: string) => {
        try {
            const result = await Reminders.complete(id);
            setReminders(result.reminders ?? []);
        } catch { /* handled by error state */ }
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await Reminders.delete(id);
            setReminders(result.reminders ?? []);
            if (selectedDate && !(result.reminders ?? []).some((r) => r.due_date === selectedDate)) {
                setSelectedDate(null);
            }
        } catch { /* handled by error state */ }
    };

    const selectedReminders = selectedDate ? (byDate[selectedDate] ?? []) : [];

    return (
        <div style={styles.page}>
            <div style={styles.title}>Calendar</div>

            {error && <span style={styles.errorText}>Could not load reminders.</span>}

            <div style={styles.monthRow}>
                <Buttons.main title="‹" onClick={prevMonth} style={styles.navButton} />
                <span style={styles.monthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
                <Buttons.main title="›" onClick={nextMonth} style={styles.navButton} />
            </div>

            <div style={styles.dayGrid}>
                {DAY_NAMES.map((d) => (
                    <div key={d} style={styles.dayHeader}>{d}</div>
                ))}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isToday = key === toDateKey(today);
                    const dayReminders = byDate[key] ?? [];
                    const hasReminder = dayReminders.length > 0;

                    return (
                        <div
                            key={key}
                            style={{
                                ...styles.dayCell,
                                ...(isToday ? styles.dayCellToday : {}),
                                ...(hasReminder && !isToday ? { fontWeight: 600, color: "#ccc" } : {}),
                            }}
                            onPointerDown={() => setSelectedDate(key)}
                        >
                            {day}
                            {hasReminder && (
                                <div
                                    style={{
                                        width: 4,
                                        height: 4,
                                        borderRadius: "50%",
                                        background: isToday ? "#000" : "#888",
                                        margin: "2px auto 0",
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {selectedDate && (
                <DayModal
                    dateKey={selectedDate}
                    reminders={selectedReminders}
                    onClose={() => setSelectedDate(null)}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};
