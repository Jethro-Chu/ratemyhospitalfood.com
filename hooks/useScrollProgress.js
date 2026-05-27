'use client';
import { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion';

/**
 * Returns a value 0→1 representing how far the user has scrolled
 * THROUGH a section: 0 when the section bottom touches the viewport bottom,
 * 1 when the section top has left the viewport top.
 *
 * Throttled with requestAnimationFrame for 60fps performance.
 * Returns a stable 0.5 (mid-state) if reduced-motion is requested.
 */
export default function useScrollProgress() {
    const ref = useRef(null);
    const [progress, setProgress] = useState(0);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) {
            setProgress(0.5);
            return;
        }
        if (!ref.current) return;

        let raf = 0;
        const compute = () => {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            // Total scrollable distance = section height + viewport
            // Progress = (vh - rect.top) / (vh + rect.height)
            const raw = (vh - rect.top) / (vh + rect.height);
            const clamped = Math.max(0, Math.min(1, raw));
            setProgress(clamped);
        };

        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(compute);
        };

        compute();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [reduced]);

    return [ref, progress];
}
