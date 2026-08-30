import type { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
    page: {
        flex: 1,
        overflow: "auto",
        background: "#0a0a0a",
        color: "#fff",
        padding: "20px 16px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        WebkitUserSelect: "none",
        userSelect: "none",
    },
    title: {
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: "0.04em",
        color: "#fff",
    },
    currentCard: {
        padding: "16px",
        border: "1px solid #1e1e1e",
        borderRadius: 10,
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
    },
    tempBlock: {
        display: "flex",
        flexDirection: "column",
    },
    tempLarge: {
        fontSize: 52,
        fontWeight: 700,
        color: "#fff",
        lineHeight: 1,
    },
    feelsLike: {
        fontSize: 17,
        color: "#555",
        marginTop: 4,
    },
    detailBlock: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    description: {
        fontSize: 30,
        fontWeight: 600,
        color: "#ccc",
    },
    metaRow: {
        fontSize: 18,
        color: "#aeadad",
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#444",
        marginBottom: 8,
    },
    forecastGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 6,
    },
    forecastCell: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 4px",
        border: "1px solid #1a1a1a",
        borderRadius: 8,
        gap: 4,
    },
    forecastDay: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        color: "#555",
        textTransform: "uppercase",
    },
    forecastHigh: {
        fontSize: 20,
        fontWeight: 500,
        color: "#fff",
    },
    forecastLow: {
        fontSize: 18,
        color: "#838383",
    },
    forecastIcon: {
        width: 40,
        height: 40,
        objectFit: "contain",
    },
    currentIcon: {
        width: 48,
        height: 48,
        objectFit: "contain",
    },
    forecastRain: {
        fontSize: 11,
        color: "#3b82f6",
    },
    errorText: {
        fontSize: 13,
        color: "#ef4444",
    },
    emptyText: {
        fontSize: 13,
        color: "#333",
        fontStyle: "italic",
    },
};
