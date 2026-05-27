'use client';
import { useEffect, useRef, useState } from 'react';
import useReducedMotion from './useReducedMotion';

/**
 * Fires once when the element first enters the viewport.
 * Returns [ref, inView] – set inView to true immediately if reduced-motion.
 */
export default function useInView({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) {
            setInView(true);
            return;
        }
        const el = ref.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold, rootMargin }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [reduced, threshold, rootMargin]);

    return [ref, inView];
}
