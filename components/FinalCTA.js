'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { PenLine, Plus, Star } from 'lucide-react';
import { gsap } from '@/lib/gsapClient';
import useReducedMotion from '@/hooks/useReducedMotion';
import Marquee from './Marquee';

/**
 * Closing call-to-action: marquee strip, massive display headline that
 * wipes in line by line, magnetic primary button.
 */
export default function FinalCTA() {
    const rootRef = useRef(null);
    const magnetRef = useRef(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.cta-line',
                { yPercent: 105 },
                {
                    yPercent: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out',
                    scrollTrigger: { trigger: rootRef.current, start: 'top 72%' },
                });
            gsap.fromTo('.cta-fade',
                { y: 24, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
                    scrollTrigger: { trigger: rootRef.current, start: 'top 60%' },
                });
        }, rootRef);
        return () => ctx.revert();
    }, [reduced]);

    // Magnetic pull on the primary button
    useEffect(() => {
        if (reduced) return;
        const el = magnetRef.current;
        if (!el) return;
        const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
        const onMove = (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const dist = Math.hypot(dx, dy);
            if (dist < 160) {
                xTo(dx * 0.3);
                yTo(dy * 0.3);
            } else {
                xTo(0);
                yTo(0);
            }
        };
        window.addEventListener('mousemove', onMove, { passive: true });
        return () => window.removeEventListener('mousemove', onMove);
    }, [reduced]);

    return (
        <section ref={rootRef} className="relative overflow-hidden bg-cream-100" aria-labelledby="final-cta-title">

            {/* Top marquee strip */}
            <div className="border-y border-ink-900/10 py-4 bg-cream-50">
                <Marquee
                    slow
                    items={[
                        'Had hospital food recently?',
                        'Rate the tray',
                        'Help the next patient',
                        'No login required',
                        'Takes under a minute',
                    ]}
                    className="font-display font-bold text-[22px] sm:text-[28px] text-cream-500"
                />
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-36 text-center">

                <h2 id="final-cta-title" className="font-display font-bold tracking-tight text-ink-900 leading-[1.02] text-[12vw] sm:text-[92px] lg:text-[120px]">
                    <span className="block overflow-hidden pb-1"><span className="cta-line block">Had hospital</span></span>
                    <span className="block overflow-hidden pb-2">
                        <span className="cta-line block">food <span className="gradient-text">recently?</span></span>
                    </span>
                </h2>

                <p className="cta-fade text-[16px] sm:text-[18px] text-ink-500 mt-8 max-w-xl mx-auto leading-relaxed">
                    Leave a review and help the next patient, nurse, visitor, or hungry
                    resident know what they&rsquo;re walking into.
                </p>

                <div className="cta-fade mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        ref={magnetRef}
                        href="/search"
                        className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-400 text-cream-100 font-mono text-[13px] font-bold uppercase tracking-[0.14em] py-5 px-10 rounded-full transition-colors shadow-glow w-full sm:w-auto"
                    >
                        <PenLine className="w-4 h-4" />
                        Write a Review
                    </Link>
                    <Link
                        href="/add"
                        className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-cream-50 text-ink-900 border border-ink-900/20 hover:border-ink-900/40 font-mono text-[13px] font-bold uppercase tracking-[0.14em] py-5 px-10 rounded-full transition-all active:scale-[0.97] w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" />
                        Add a Hospital
                    </Link>
                </div>

                {/* Trust line */}
                <div className="cta-fade mt-14 inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">
                    <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className="w-3.5 h-3.5 fill-honey-400 text-honey-400" />
                        ))}
                    </span>
                    Free · No login required · Takes under a minute
                </div>
            </div>
        </section>
    );
}
