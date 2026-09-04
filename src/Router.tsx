import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./Routes";
import { Navigation } from "./Components/Navigation/Navigation";
import { AmbientClock, useAmbientMode } from "./Components/AmbientClock/AmbientClock";
import type { CSSProperties } from "react";

const shell: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100dvh",
    background: "#0a0a0a",
};

const ShellLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAmbient, dismiss } = useAmbientMode();

    return (
        <div style={shell}>
            <AmbientClock isActive={isAmbient} onDismiss={dismiss} />
            {children}
            <Navigation />
        </div>
    );
};

const router = createBrowserRouter(
    routes.map((route) => ({
        path: route.path,
        element: <ShellLayout>{route.element}</ShellLayout>,
    }))
);

export const Router = () => <RouterProvider router={router} />;
