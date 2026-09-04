import { useEffect, useRef } from "react";

export const useDragScroll = () => {
    const TOUCH_CODE_REQUIRED: boolean = import.meta.env.VITE_TOUCH_CODE_REQUIRED === 'true';

    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!TOUCH_CODE_REQUIRED) return;
        const el = ref.current;
        if (!el) return;
        let startY = 0, startScrollTop = 0, active = false, moved = false;

        const onDown = (e: PointerEvent) => { active = true; moved = false; startY = e.clientY; startScrollTop = el.scrollTop; };
        const onMove = (e: PointerEvent) => {
            if (!active) return;
            const dy = Math.round(startY - e.clientY);
            if (!moved && Math.abs(dy) < 0.2) return;
            moved = true;
            el.scrollTop = startScrollTop + Math.round(dy * 7);
        };
        const onUp = () => { active = false; };
        const onClick = (e: MouseEvent) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } };

        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointermove', onMove);
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
    }, [TOUCH_CODE_REQUIRED]);
    return ref;
}