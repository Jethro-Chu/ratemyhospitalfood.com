'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { gsap } from '@/lib/gsapClient';
import useReducedMotion from '@/hooks/useReducedMotion';
import HospitalCard from './HospitalCard';

/**
 * "The leaderboard" — top cafeterias in a staggered editorial grid.
 * Cards rise in with a GSAP scroll-triggered stagger; odd columns are
 * offset on desktop for an asymmetric rhythm.
 */
export default function HospitalDiscovery({ hospitals }) {
    const rootRef = useRef(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.hd-cell',
                { y: 70, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, stagger: 0.1, ease: 'power3.out',
                    scrollTrigger: { trigger: '.hd-grid', start: 'top 78%' },
                });
            gsap.fromTo('.hd-head',
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
                    scrollTrigger: { trigger: rootRef.current, start: 'top 80%' },
                });
        }, rootRef);
        return () => ctx.revert();
    }, [reduced]);

    if (!hospitals || hospitals.length === 0) return null;

    const list = hospitals.slice(0, 6);

    return (
        <section
            ref={rootRef}
            className="relative bg-cream-100 overflow-hidden"
            aria-labelledby="discover-title"
        >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">

                {/* Heading */}
                <div className="hd-head flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 sm:mb-20">
                    <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-honey-400 mb-4">
                            ( The leaderboard )
                        </p>
                        <h2 id="discover-title" className="font-display font-extrabold uppercase text-[40px] sm:text-[56px] lg:text-[72px] tracking-tight text-ink-900 leading-[0.95]">
                            Most-loved<br />
                            <span className="text-outline">cafeterias.</span>
                        </h2>
                    </div>
                    <p className="text-ink-500 text-[15px] leading-relaxed max-w-xs sm:text-right">
                        Hospitals where the food is actually worth showing up early for.
                    </p>
                </div>

                {/* Staggered grid */}
                <div className="hd-grid grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {list.map((hospital, i) => {
                        const isOdd = i % 2 === 1;
                        return (
                            <div key={hospital.id} className={`hd-cell relative ${isOdd ? 'md:mt-16' : ''}`}>
                                <span
                                    className="absolute -top-6 -left-1 sm:-left-3 font-display font-extrabold text-[72px] sm:text-[96px] leading-none text-outline select-none z-10 pointer-events-none"
                                    aria-hidden="true"
                                >
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <HospitalCard hospital={hospital} />
                            </div>
                        );
                    })}
                </div>

                {/* See all link */}
                <div className="text-center mt-20">
                    <Link
                        href="/top-rated"
                        className="group inline-flex items-center gap-3 font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-ink-900 hover:text-brand-500 transition-colors"
                    >
                        <span className="w-10 h-px bg-ink-300 group-hover:bg-brand-500 group-hover:w-16 transition-all duration-300" />
                        See all top-rated hospitals
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
