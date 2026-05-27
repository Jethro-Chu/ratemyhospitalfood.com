'use client';
import { useEffect, useState } from 'react';
import useReducedMotion from './useReducedMotion';

/**
 * Animates a number from 0 to `target` over `duration` ms once `active` is true.
 * Falls back to the final value immediately if reduced-motion is requested.
 *
 * @param {number} target  - the final value
 * @param {boolean} active - start the animation when this becomes true
 * @param {number} duration - ms (default 1400)
 * @param {number} decimals - decimal places to round to (default 0)
 */
export default function useCountUp(target, active, duration = 1400, decimals = 0) {
    const [value, setValue] = useState(0);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (!active) return;
        const finalValue = Number(target) || 0;
        if (reduced) {
            setValue(finalValue);
            return;
        }

        let raf = 0;
        const start = performance.now();
        // Ease-out cubic
        const ease = (t) => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const next = finalValue * ease(t);
            const factor = Math.pow(10, decimals);
            setValue(Math.round(next * factor) / factor);
            if (t < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, active, duration, decimals, reduced]);

    return value;
}
