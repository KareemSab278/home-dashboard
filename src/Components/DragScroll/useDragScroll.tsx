import { useEffect, useRef } from "react";

// Pointer-driven scroll fallback for WebKitGTK (Raspberry Pi), which often ignores native touch scroll on overflow:auto.
export const useDragScroll = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let startY = 0, startScrollTop = 0, active = false, moved = false, pointerId = -1;

        const onDown = (e: PointerEvent) => {
            active = true;
            moved = false;
            pointerId = e.pointerId;
            startY = e.clientY;
            startScrollTop = el.scrollTop;
        };
        const onMove = (e: PointerEvent) => {
            if (!active || e.pointerId !== pointerId) return;
            const dy = startY - e.clientY;
            if (!moved && Math.abs(dy) < 4) return;
            if (!moved) el.setPointerCapture(pointerId);
            moved = true;
            el.scrollTop = startScrollTop + dy;
            e.preventDefault();
        };
        const onUp = (e: PointerEvent) => {
            active = false;
            if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        };
        const onClick = (e: MouseEvent) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };

        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointermove', onMove, { passive: false });
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
        el.addEventListener('click', onClick, true);
        return () => {
            el.removeEventListener('pointerdown', onDown);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onUp);
            el.removeEventListener('click', onClick, true);
        };
    }, []);
    return ref;
}