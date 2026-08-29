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
        fontWeight: 300,
        letterSpacing: "0.04em",
        color: "#fff",
        marginBottom: 4,
    },
    section: {
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "14px",
        border: "1px solid #1a1a1a",
        borderRadius: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#444",
        marginBottom: 4,
    },
    row: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid #111",
    },
    label: {
        fontSize: 14,
        color: "#aaa",
    },
    value: {
        fontSize: 14,
        color: "#555",
    },
    note: {
        fontSize: 12,
        color: "#333",
        fontStyle: "italic",
        marginTop: 4,
    },
};
