import { useEffect, useRef, useState } from "react";
import { styles } from "./styles";

const AMBIENT_TIMEOUT_MS = 60_000;

interface AmbientClockProps {
    isActive: boolean;
    onDismiss: () => void;
}

export const AmbientClock = ({ isActive, onDismiss }: AmbientClockProps) => {
    const [time, setTime] = useState("");

    useEffect(() => {
        if (!isActive) return;

        const tick = () => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            setTime(`${hh}:${mm}`);
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div style={styles.overlay} onPointerDown={onDismiss}>
            <span style={styles.clock}>{time}</span>
        </div>
    );
};

export const useAmbientMode = (disabled = false) => {
    const [isAmbient, setIsAmbient] = useState(false);
    const timerRef = useRef<number | null>(null);

    const reset = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (disabled) return;
        timerRef.current = window.setTimeout(() => setIsAmbient(true), AMBIENT_TIMEOUT_MS);
    };

    const dismiss = () => {
        setIsAmbient(false);
        reset();
    };

    useEffect(() => {
        if (disabled) return;
        const events: (keyof DocumentEventMap)[] = ["pointerdown", "pointermove", "keydown"];
        events.forEach((e) => document.addEventListener(e, reset));
        reset();
        return () => {
            events.forEach((e) => document.removeEventListener(e, reset as EventListener));
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [disabled]);

    return { isAmbient, dismiss };
};
