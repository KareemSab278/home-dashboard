import type { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
    nav: {
        display: "flex",
        flexDirection: "row",
        borderTop: "1px solid #222",
        background: "#0a0a0a",
        flexShrink: 0,
    },
    item: {
        flex: 1,
        padding: "14px 4px",
        background: "transparent",
        border: "none",
        color: "#555",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
    },
    itemActive: {
        color: "#fff",
    },
};
