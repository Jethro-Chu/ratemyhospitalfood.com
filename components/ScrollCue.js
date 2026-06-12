'use client';
import { useEffect, useState } from 'react';

/**
 * "Scroll" indicator at the bottom of the hero.
 * Auto-hides once the user has scrolled more than 80px.
 */
export default function ScrollCue({ label = 'Scroll to explore' }) {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const onScroll = () => setHidden(window.scrollY > 80);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div
            aria-hidden="true"
            className={`hidden md:flex flex-col items-center gap-3 transition-opacity duration-500 ${
                hidden ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-ink-500">
                {label}
            </span>
            <span className="relative block w-px h-12 overflow-hidden bg-ink-200">
                <span
                    className="absolute left-0 top-0 w-full h-1/2 bg-brand-500"
                    style={{ animation: 'scrollCueDrop 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite' }}
                />
            </span>
            <style jsx>{`
                @keyframes scrollCueDrop {
                    0%   { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
            `}</style>
        </div>
    );
}
