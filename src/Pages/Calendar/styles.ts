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
        gap: 30,
        WebkitUserSelect: "none",
        userSelect: "none",
    },

    title: {
        fontSize: 34,
        fontWeight: 300,
        letterSpacing: "0.04em",
        color: "#fff",
        marginBottom: 6,
    },

    monthRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },

    monthLabel: {
        fontSize: 24,
        fontWeight: 500,
        color: "#fff",
    },

    navButton: {
        background: "transparent",
        border: "1px solid #333",
        color: "#888",
        borderRadius: 9,
        padding: "10px 20px",
        fontSize: 22,
        cursor: "pointer",
        touchAction: "manipulation",
        minWidth: 60,
        minHeight: 52,
    },

    dayGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 5,
    },

    dayHeader: {
        textAlign: "center",
        fontSize: 15,
        fontWeight: 700,
        color: "#555",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "8px 0",
    },

    dayCell: {
        textAlign: "center",
        padding: "16px 4px",
        borderRadius: 9,
        fontSize: 27,
        cursor: "pointer",
        color: "#a7a7a7",
        touchAction: "manipulation",
        minHeight: 58,
    },

    dayCellToday: {
        background: "#fff",
        color: "#000",
        fontWeight: 700,
    },

    dayCellSelected: {
        background: "#222",
        color: "#fff",
    },

    dayCellHasEvent: {
        position: "relative",
    },

    eventList: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 6,
    },

    eventRow: {
        display: "flex",
        alignItems: "center",
        gap: 15,
        padding: "15px 18px",
        border: "1px solid #1e1e1e",
        borderRadius: 12,
        minHeight: 60,
    },

    eventDot: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        flexShrink: 0,
    },

    eventTime: {
        fontSize: 19,
        color: "#555",
        minWidth: 58,
    },

    eventTitle: {
        fontSize: 20,
        color: "#ddd",
        flex: 1,
    },

    emptyText: {
        fontSize: 19,
        color: "#444",
        fontStyle: "italic",
        paddingTop: 10,
    },

    sectionLabel: {
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#555",
        marginBottom: 6,
    },

    errorText: {
        fontSize: 19,
        color: "#ef4444",
    },

    modalOverlay: {
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },

    modal: {
        background: "#111",
        border: "1px solid #222",
        borderRadius: 16,
        padding: "30px 24px",
        width: "100%",
        maxWidth: 600,
        display: "flex",
        flexDirection: "column",
        gap: 18,
    },

    modalTitle: {
        fontSize: 25,
        fontWeight: 600,
        color: "#fff",
        marginBottom: 6,
    },

    modalRow: {
        display: "flex",
        alignItems: "center",
        gap: 15,
        padding: "14px 0",
        borderBottom: "1px solid #1a1a1a",
        fontSize: 19,
    },

    actionButton: {
        background: "transparent",
        border: "1px solid #222",
        color: "#777",
        borderRadius: 7,
        padding: "9px 16px",
        fontSize: 17,
        cursor: "pointer",
        touchAction: "manipulation",
        minHeight: 44,
        minWidth: 70,
    },

    closeButton: {
        marginTop: 8,
        background: "transparent",
        border: "1px solid #333",
        color: "#888",
        borderRadius: 9,
        padding: "15px",
        fontSize: 19,
        cursor: "pointer",
        touchAction: "manipulation",
        width: "100%",
        minHeight: 54,
    },
};
