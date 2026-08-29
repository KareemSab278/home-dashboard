import type { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
    overlay: {
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },
    clock: {
        fontSize: "clamp(96px, 20vw, 200px)",
        fontWeight: 100,
        color: "#fff",
        letterSpacing: "0.05em",
        fontVariantNumeric: "tabular-nums",
        userSelect: "none",
    },
};
