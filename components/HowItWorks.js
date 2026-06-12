'use client';

import { useEffect, useRef } from 'react';
import { Search, MessageSquare, PenLine, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { gsap } from '@/lib/gsapClient';
import useReducedMotion from '@/hooks/useReducedMotion';

const STEPS = [
    {
        n: '01',
        icon: Search,
        title: 'Search your hospital',
        copy: 'Find the dining hall by name or city. We’ll surface the score and the receipts.',
        accent: 'text-brand-500',
        chip: 'bg-brand-100 text-brand-700',
    },
    {
        n: '02',
        icon: MessageSquare,
        title: 'Read real reviews',
        copy: 'Honest takes from patients, staff, and visitors. Photos of what they actually served.',
        accent: 'text-honey-400',
        chip: 'bg-honey-100 text-honey-700',
    },
    {
        n: '03',
        icon: PenLine,
        title: 'Rate your meal',
        copy: 'Drop a star rating, a quick note, and a picture. Help the next person decide.',
        accent: 'text-emerald-700',
        chip: 'bg-emerald-100 text-emerald-700',
    },
];

/**
 * Editorial numbered rows. Each row wipes in from below with a GSAP
 * scroll-triggered stagger; hovering a row lights up its index.
 */
export default function HowItWorks() {
    const rootRef = useRef(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.hiw-row',
                { y: 60, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: 'power3.out',
                    scrollTrigger: { trigger: rootRef.current, start: 'top 70%' },
                });
            gsap.fromTo('.hiw-head',
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
                    scrollTrigger: { trigger: rootRef.current, start: 'top 80%' },
                });
        }, rootRef);
        return () => ctx.revert();
    }, [reduced]);

    return (
        <section
            id="how-it-works"
            ref={rootRef}
            className="relative bg-cream-100 overflow-hidden"
            aria-labelledby="how-it-works-title"
        >
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-32">

                {/* Header */}
                <div className="hiw-head flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 sm:mb-20">
                    <div>
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 mb-4">
                            ( How it works )
                        </p>
                        <h2
                            id="how-it-works-title"
                            className="font-display font-bold text-[12vw] sm:text-[64px] lg:text-[96px] tracking-tight text-ink-900 leading-[1.02]"
                        >
                            Three bites,<br />
                            <span className="gradient-text">no nonsense.</span>
                        </h2>
                    </div>
                    <p className="text-ink-500 text-[15px] leading-relaxed max-w-xs sm:text-right">
                        Built for patients, families, and hospital staff who&rsquo;d rather know
                        what&rsquo;s on the menu before they get there.
                    </p>
                </div>

                {/* Numbered rows */}
                <div className="border-t border-ink-900/10">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.n}
                                className="hiw-row group grid grid-cols-[auto_1fr] sm:grid-cols-[120px_auto_1fr_auto] items-center gap-x-5 sm:gap-x-10 gap-y-2 py-8 sm:py-10 border-b border-ink-900/10 transition-colors duration-300 hover:bg-cream-50/60 px-2 sm:px-4 -mx-2 sm:-mx-4"
                            >
                                <span className="font-display font-bold text-[40px] sm:text-[64px] leading-none text-cream-400 transition-all duration-300">
                                    {step.n}
                                </span>
                                <div className={`hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center ${step.chip}`}>
                                    <Icon className="w-[22px] h-[22px]" strokeWidth={2.2} />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-display text-[22px] sm:text-[28px] font-bold tracking-tight text-ink-900 leading-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-ink-500 text-[14.5px] leading-relaxed mt-1.5 max-w-xl">
                                        {step.copy}
                                    </p>
                                </div>
                                <ArrowUpRight className={`hidden sm:block w-7 h-7 ${step.accent} opacity-0 -translate-x-2 translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300`} />
                            </div>
                        );
                    })}
                </div>

                {/* CTA below */}
                <div className="text-center mt-14">
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-cream-100 font-mono text-[12px] font-bold uppercase tracking-[0.14em] py-4 px-8 rounded-full transition-all active:scale-[0.97] hover:shadow-glow"
                    >
                        Start with your hospital
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
