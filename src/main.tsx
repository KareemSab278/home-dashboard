import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "./Router";
// import { getCurrentWindow } from "@tauri-apps/api/window";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>,
);

// setTimeout(() => {
//     getCurrentWindow().setFullscreen(true).catch((err) => {
//         console.error("Failed to set fullscreen:", err);
//     });
// }, 3000);
