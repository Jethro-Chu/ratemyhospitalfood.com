'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PenLine, Plus } from 'lucide-react';

/**
 * Mobile-only floating action bar. Slides up after the user scrolls
 * past the hero so the primary actions stay thumb-reachable.
 * Respects the home-indicator safe area on iOS.
 */
export default function MobileActionBar() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div
            className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 transition-transform duration-300 ease-out ${
                visible ? 'translate-y-0' : 'translate-y-[120%]'
            }`}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
        >
            <div className="glass-panel rounded-full shadow-warm-xl p-2 flex items-center gap-2">
                <Link
                    href="/search?intent=review"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-500 active:bg-brand-400 text-cream-100 font-mono text-[11px] font-bold uppercase tracking-[0.12em] py-3.5 rounded-full transition-colors"
                >
                    <PenLine className="w-4 h-4" strokeWidth={2.5} />
                    Write a Review
                </Link>
                <Link
                    href="/add"
                    aria-label="Add a hospital"
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-ink-900/15 text-ink-800 active:bg-cream-200 transition-colors shrink-0"
                >
                    <Plus className="w-5 h-5" strokeWidth={2.5} />
                </Link>
            </div>
        </div>
    );
}
