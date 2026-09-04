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
        gap: 36,
        WebkitUserSelect: "none",
        userSelect: "none",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    time: {
        fontSize: "clamp(84px, 18vw, 144px)",
        fontWeight: 200,
        letterSpacing: "0.02em",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        color: "#fff",
    },

    dateText: {
        fontSize: 22,
        color: "#888",
        marginTop: 8,
        fontWeight: 400,
    },

    section: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
    },

    sectionLabel: {
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#555",
        marginBottom: 4,
    },

    nextItem: {
        padding: "18px 20px",
        border: "1px solid #222",
        borderRadius: 12,
        fontSize: 22,
        fontWeight: 500,
    },

    nextItemTitle: {
        fontSize: 24,
        fontWeight: 600,
        color: "#fff",
    },

    nextItemMeta: {
        fontSize: 19,
        color: "#888",
        marginTop: 5,
    },

    weatherRow: {
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "15px 20px",
        border: "1px solid #222",
        borderRadius: 12,
    },

    weatherTemp: {
        fontSize: 88,
        fontWeight: 200,
        color: "#fff",
    },

    weatherDetail: {
        fontSize: 28,
        color: "#888",
        lineHeight: 1.6,
    },

    eventRow: {
        display: "flex",
        alignItems: "center",
        gap: 15,
        padding: "12px 0",
        borderBottom: "1px solid #1a1a1a",
    },

    eventDot: {
        width: 9,
        height: 9,
        borderRadius: "50%",
        flexShrink: 0,
    },

    eventTime: {
        fontSize: 19,
        color: "#666",
        minWidth: 60,
    },

    eventTitle: {
        fontSize: 20,
        color: "#ddd",
        flex: 1,
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
    },

    errorText: {
        fontSize: 19,
        color: "#ef4444",
    },
};