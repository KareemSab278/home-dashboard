import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

export const goFullScreen = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            getCurrentWindow().setFullscreen(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);
    return null;
}


export const KillApp = () => {
    return (
        <button
            style={{
                position: "fixed",
                bottom: 60,
                right: 30,
                zIndex: 9999,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#ff4444",
                background: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: 8,
                cursor: "pointer",
            }}
            onClick={async () => await invoke("kill")}
        >
            Kill App
        </button>
    );
};