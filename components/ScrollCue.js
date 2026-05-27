'use client';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Subtle "scroll to explore" indicator at the bottom of the hero.
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
            className={`hidden md:flex flex-col items-center gap-2 transition-opacity duration-500 ${
                hidden ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
                {label}
            </span>
            <div className="w-7 h-11 rounded-full border-2 border-ink-300 flex items-start justify-center p-1.5">
                <span className="w-1 h-2 rounded-full bg-brand-500 animate-bounce" />
            </div>
        </div>
    );
}
