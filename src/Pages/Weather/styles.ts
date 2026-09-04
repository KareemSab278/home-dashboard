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
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "#fff",
    },

    currentCard: {
        padding: "24px",
        border: "1px solid #1e1e1e",
        borderRadius: 14,
        display: "flex",
        alignItems: "flex-start",
        gap: 28,
    },

    tempBlock: {
        display: "flex",
        flexDirection: "column",
    },

    tempLarge: {
        fontSize: 76,
        fontWeight: 700,
        color: "#fff",
        lineHeight: 1,
    },

    feelsLike: {
        fontSize: 21,
        color: "#555",
        marginTop: 7,
    },

    detailBlock: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 7,
    },

    description: {
        fontSize: 36,
        fontWeight: 600,
        color: "#ccc",
    },

    metaRow: {
        fontSize: 22,
        color: "#aeadad",
    },

    sectionLabel: {
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#444",
        marginBottom: 10,
    },

    forecastGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 10,
    },

    forecastCell: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px 8px",
        border: "1px solid #1a1a1a",
        borderRadius: 12,
        gap: 7,
        minHeight: 130,
    },

    forecastDay: {
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: "#555",
        textTransform: "uppercase",
    },

    forecastHigh: {
        fontSize: 27,
        fontWeight: 500,
        color: "#fff",
    },

    forecastLow: {
        fontSize: 23,
        color: "#838383",
    },

    forecastIcon: {
        width: 56,
        height: 56,
        objectFit: "contain",
    },

    currentIcon: {
        width: 68,
        height: 68,
        objectFit: "contain",
    },

    forecastRain: {
        fontSize: 15,
        color: "#3b82f6",
    },

    errorText: {
        fontSize: 19,
        color: "#ef4444",
    },

    emptyText: {
        fontSize: 19,
        color: "#444",
        fontStyle: "italic",
    },
};