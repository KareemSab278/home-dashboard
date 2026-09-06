import type { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
    page: {
        flex: 1,
        overflow: "auto",
        minHeight: 0,
        background: "#0a0a0a",
        color: "#fff",
        padding: "36px 30px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        WebkitUserSelect: "none",
        userSelect: "none",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    
    serverAddress: {
        fontSize: 14,
        color: "#888",
    },

    title: {
        fontSize: 44,
        fontWeight: 300,
        letterSpacing: "0.04em",
        color: "#fff",
    },

    addButton: {
        background: "transparent",
        border: "1px solid #333",
        color: "#888",
        borderRadius: 9,
        padding: "12px 22px",
        fontSize: 20,
        cursor: "pointer",
        touchAction: "manipulation",
        minHeight: 52,
        minWidth: 90,
    },

    reminderRow: {
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "18px 20px",
        border: "1px solid #1a1a1a",
        borderRadius: 12,
        minHeight: 70,
    },

    reminderDot: {
        width: 11,
        height: 11,
        borderRadius: "50%",
        flexShrink: 0,
    },

    reminderTitle: {
        flex: 1,
        fontSize: 21,
        color: "#ddd",
    },

    reminderTitleDone: {
        flex: 1,
        fontSize: 21,
        color: "#444",
        textDecoration: "line-through",
    },

    reminderDue: {
        fontSize: 17,
        color: "#555",
    },

    actionButton: {
        background: "transparent",
        border: "1px solid #222",
        color: "#666",
        borderRadius: 7,
        padding: "9px 16px",
        fontSize: 16,
        cursor: "pointer",
        touchAction: "manipulation",
        minHeight: 44,
        minWidth: 70,
    },

    statusBadge: {
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "5px 9px",
        borderRadius: 6,
    },

    emptyText: {
        fontSize: 19,
        color: "#444",
        fontStyle: "italic",
        paddingTop: 10,
    },

    errorText: {
        fontSize: 19,
        color: "#ef4444",
    },

    addForm: {
        display: "flex",
        flexDirection: "column",
        gap: 15,
        padding: "22px",
        border: "1px solid #222",
        borderRadius: 12,
        background: "#111",
    },

    input: {
        background: "#0a0a0a",
        border: "1px solid #333",
        borderRadius: 9,
        color: "#fff",
        fontSize: 20,
        padding: "15px 16px",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        minHeight: 56,
    },

    formButtons: {
        display: "flex",
        gap: 12,
    },

    saveButton: {
        flex: 1,
        background: "#fff",
        border: "none",
        color: "#000",
        borderRadius: 9,
        padding: "14px",
        fontSize: 19,
        fontWeight: 600,
        cursor: "pointer",
        touchAction: "manipulation",
        minHeight: 54,
    },

    cancelButton: {
        flex: 1,
        background: "transparent",
        border: "1px solid #333",
        color: "#888",
        borderRadius: 9,
        padding: "14px",
        fontSize: 19,
        cursor: "pointer",
        touchAction: "manipulation",
        minHeight: 54,
    },
};
