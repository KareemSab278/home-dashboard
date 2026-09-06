import { useEffect, useState } from "react";
import { Reminders } from "@/Helpers/Reminders/Reminders";
import { Buttons } from "@/Components/Button/Button";
import { VirtualKeyboard } from "@/Components/VirtualKeyboard/VirtualKeyboard";
import type { Reminder } from "@/Types";
import { STATUS_COLORS } from "@/Types";
import { styles } from "./styles";
import { useDragScroll } from "@/Components/DragScroll/useDragScroll";

const today = () => new Date().toISOString().slice(0, 10);

type EditDraft = { title: string; due_date: string; due_time: string };

type FocusedField = 'title' | 'due_date' | 'due_time' | null;

const ReminderRow = ({
    reminder,
    onComplete,
    onDismiss,
    onDelete,
    onSaveEdit,
}: {
    reminder: Reminder;
    onComplete: (id: string) => void;
    onDismiss: (id: string) => void;
    onDelete: (id: string) => void;
    onSaveEdit: (id: string, draft: EditDraft) => void;
}) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState<EditDraft>({
        title: reminder.title,
        due_date: reminder.due_date,
        due_time: reminder.due_time ?? "",
    });
    const [kbField, setKbField] = useState<FocusedField>(null);

    const handleSave = () => {
        onSaveEdit(reminder.id, draft);
        setEditing(false);
        setKbField(null);
    };

    const updateField = (field: Exclude<FocusedField, null>, value: string) => {
        setDraft((d) => ({ ...d, [field]: value }));
    };


    if (editing) {
        return (
            <>
                <div style={styles.addForm}>
                    <input
                        style={styles.input}
                        value={draft.title}
                        onFocus={() => setKbField('title')}
                        placeholder="Title"
                        readOnly
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                        <input
                            style={{ ...styles.input, flex: 1 }}
                            type="text"
                            placeholder="YYYY-MM-DD"
                            value={draft.due_date}
                            onFocus={() => setKbField('due_date')}
                            readOnly
                        />
                        <input
                            style={{ ...styles.input, flex: 1 }}
                            type="text"
                            placeholder="HH:MM"
                            value={draft.due_time}
                            onFocus={() => setKbField('due_time')}
                            readOnly
                        />
                    </div>
                    <div style={styles.formButtons}>
                        <Buttons.main title="Save" onClick={handleSave} style={styles.saveButton} />
                        <Buttons.main title="Cancel" onClick={() => { setEditing(false); setKbField(null); }} style={styles.cancelButton} />
                    </div>
                </div>
                {kbField && (
                    <VirtualKeyboard
                        value={draft[kbField]}
                        onChange={(v) => updateField(kbField, v)}
                        onClose={() => setKbField(null)}
                    />
                )}
            </>
        );
    }

    return (
        <div style={styles.reminderRow}>
            <div style={{ ...styles.reminderDot, background: STATUS_COLORS[reminder.status] }} />
            <div style={{ flex: 1 }}>
                <div style={reminder.status === "completed" ? styles.reminderTitleDone : styles.reminderTitle}>
                    {reminder.title}
                </div>
                <div style={styles.reminderDue}>
                    {reminder.due_date}
                    {reminder.due_time ? ` · ${reminder.due_time}` : ""}
                </div>
            </div>
            {reminder.status !== "completed" && reminder.status !== "dismissed" && (
                <>
                    <Buttons.main title="Done" onClick={() => onComplete(reminder.id)} style={styles.actionButton} />
                    <Buttons.main title="Edit" onClick={() => setEditing(true)} style={styles.actionButton} />
                    <Buttons.main title="Dismiss" onClick={() => onDismiss(reminder.id)} style={styles.actionButton} />
                </>
            )}
            <Buttons.main title="✕" onClick={() => onDelete(reminder.id)} style={styles.actionButton} />
        </div>
    );
};

export const RemindersPage = () => {
    const pageRef = useDragScroll();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newDraft, setNewDraft] = useState<EditDraft>({ title: "", due_date: today(), due_time: "" });
    const [kbField, setKbField] = useState<FocusedField>(null);

    const [serverAddress, setServerAddress] = useState<string>("");


    const load = async () => {
        try {
            const addr = await Reminders.show_address();
            const result = await Reminders.get();
            setServerAddress(addr);
            setReminders(result.reminders ?? []);
            setError(null);
        } catch {
            setError("reminders_unavailable");
        }
    };

    useEffect(() => { load(); }, []);

    const handleComplete = async (id: string) => {
        try { setReminders((await Reminders.complete(id)).reminders ?? []); }
        catch { setError("action_failed"); }
    };

    const handleDismiss = async (id: string) => {
        try { setReminders((await Reminders.dismiss(id)).reminders ?? []); }
        catch { setError("action_failed"); }
    };

    const handleDelete = async (id: string) => {
        try { setReminders((await Reminders.delete(id)).reminders ?? []); }
        catch { setError("action_failed"); }
    };

    const handleSaveEdit = async (id: string, draft: EditDraft) => {
        try {
            const result = await Reminders.edit(id, {
                title: draft.title,
                due_date: draft.due_date,
                due_time: draft.due_time || null,
            });
            setReminders(result.reminders ?? []);
        } catch { setError("update_failed"); }
    };

    const handleCreate = async () => {
        if (!newDraft.title.trim() || !newDraft.due_date) return;
        try {
            const result = await Reminders.create({
                title: newDraft.title.trim(),
                due_date: newDraft.due_date,
                due_time: newDraft.due_time || null,
            });
            setReminders(result.reminders ?? []);
            setNewDraft({ title: "", due_date: today(), due_time: "" });
            setShowAdd(false);
            setKbField(null);
        } catch { setError("create_failed"); }
    };

    const updateNewField = (field: Exclude<FocusedField, null>, value: string) => {
        setNewDraft((d) => ({ ...d, [field]: value }));
    };

    const active = reminders.filter((r) => r.status !== "completed" && r.status !== "dismissed");
    const done = reminders.filter((r) => r.status === "completed" || r.status === "dismissed");

    return (
        <div ref={pageRef} style={styles.page}>
            <div style={styles.header}>
                <div style={styles.title}>Reminders</div>
                <Buttons.main title={showAdd ? "Cancel" : "+ Add"} onClick={() => setShowAdd((v) => !v)} style={styles.addButton} />
            </div>
            <div style={styles.serverAddress}>
                {serverAddress && <span>{serverAddress}</span>}
            </div>

            {error && <span style={styles.errorText}>Error: {error}</span>}

            {showAdd && (
                <>
                    <div style={styles.addForm}>
                        <input
                            style={styles.input}
                            placeholder="Reminder title…"
                            value={newDraft.title}
                            onFocus={() => setKbField('title')}
                            readOnly
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                style={{ ...styles.input, flex: 1 }}
                                type="text"
                                placeholder="YYYY-MM-DD"
                                value={newDraft.due_date}
                                onFocus={() => setKbField('due_date')}
                                readOnly
                            />
                            <input
                                style={{ ...styles.input, flex: 1 }}
                                type="text"
                                placeholder="HH:MM"
                                value={newDraft.due_time}
                                onFocus={() => setKbField('due_time')}
                                readOnly
                            />
                        </div>
                        <div style={styles.formButtons}>
                            <Buttons.main title="Save" onClick={handleCreate} style={styles.saveButton} />
                            <Buttons.main
                                title="Cancel"
                                onClick={() => {
                                    setShowAdd(false);
                                    setNewDraft({ title: "", due_date: today(), due_time: "" });
                                    setKbField(null);
                                }}
                                style={styles.cancelButton}
                            />
                        </div>
                    </div>
                    {kbField && (
                        <VirtualKeyboard
                            value={newDraft[kbField]}
                            onChange={(v) => updateNewField(kbField, v)}
                            onClose={() => setKbField(null)}
                        />
                    )}
                </>
            )}

            {active.length === 0 && !showAdd && (
                <div style={styles.emptyText}>No active reminders.</div>
            )}

            {active.map((r) => (
                <ReminderRow
                    key={r.id}
                    reminder={r}
                    onComplete={handleComplete}
                    onDismiss={handleDismiss}
                    onDelete={handleDelete}
                    onSaveEdit={handleSaveEdit}
                />
            ))}

            {done.length > 0 && (
                <>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "#333", textTransform: "uppercase", marginTop: 8 }}>
                        Done
                    </div>
                    {done.map((r) => (
                        <ReminderRow
                            key={r.id}
                            reminder={r}
                            onComplete={handleComplete}
                            onDismiss={handleDismiss}
                            onDelete={handleDelete}
                            onSaveEdit={handleSaveEdit}
                        />
                    ))}
                </>
            )}
        </div>
    );
};
