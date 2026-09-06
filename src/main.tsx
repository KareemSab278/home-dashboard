import React from "react";
import ReactDOM from "react-dom/client";
import { Router } from "./Router";
import { goFullScreen as GoFullScreen } from "./Helpers/Environment/environment";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <GoFullScreen />
        <Router />
    </React.StrictMode>,
);
