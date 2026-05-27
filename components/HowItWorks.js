'use client';

import { Search, MessageSquare, PenLine, ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import Link from 'next/link';

const STEPS = [
    {
        n: '01',
        icon: Search,
        title: 'Search your hospital',
        copy: 'Find the dining hall by name or city. We&rsquo;ll surface the score and the receipts.',
        tone: 'bg-brand-100 text-brand-700 ring-brand-200',
    },
    {
        n: '02',
        icon: MessageSquare,
        title: 'Read real reviews',
        copy: 'Honest takes from patients, staff, and visitors. Photos of what they actually served.',
        tone: 'bg-honey-100 text-honey-700 ring-honey-200',
    },
    {
        n: '03',
        icon: PenLine,
        title: 'Rate your meal',
        copy: 'Drop a star rating, a quick note, and a picture. Help the next person decide.',
        tone: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    },
];

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="relative bg-cream-50 border-y border-cream-300/60 overflow-hidden"
            aria-labelledby="how-it-works-title"
        >
            <div className="absolute top-0 right-1/4 -z-0 w-[420px] h-[420px] bg-honey-200/30 rounded-full blur-3xl -translate-y-1/4" aria-hidden="true" />
            <div className="absolute bottom-0 left-1/4 -z-0 w-[420px] h-[420px] bg-brand-200/30 rounded-full blur-3xl translate-y-1/4" aria-hidden="true" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">

                {/* Header */}
                <AnimatedSection className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
                    <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-3">
                        How it works
                    </div>
                    <h2
                        id="how-it-works-title"
                        className="font-display text-[34px] sm:text-[44px] lg:text-[52px] font-semibold tracking-tight text-ink-900 leading-[1.05]"
                    >
                        Three bites, no nonsense.
                    </h2>
                    <p className="text-ink-600 text-[15.5px] mt-4 leading-relaxed">
                        Built for patients, families, and hospital staff who&rsquo;d rather know what&rsquo;s on the menu before
                        they get there.
                    </p>
                </AnimatedSection>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                    {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <AnimatedSection key={step.n} delay={i * 120} distance={32}>
                                <div className="relative h-full bg-cream-50 border border-cream-300/70 rounded-3xl p-6 sm:p-7 shadow-warm-sm hover:shadow-warm-md transition-shadow duration-300">

                                    {/* Number chip in top right */}
                                    <span className="absolute top-5 right-5 font-display text-[28px] font-semibold text-cream-400/90 leading-none">
                                        {step.n}
                                    </span>

                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-1 ${step.tone} mb-5`}>
                                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-display text-[22px] font-semibold text-ink-900 leading-tight mb-2">
                                        {step.title}
                                    </h3>
                                    <p
                                        className="text-ink-600 text-[14.5px] leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: step.copy }}
                                    />

                                    {/* Connector arrow on desktop */}
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-cream-50 border border-cream-300 items-center justify-center z-10 shadow-warm-sm"
                                            aria-hidden="true"
                                        >
                                            <ArrowRight className="w-3.5 h-3.5 text-ink-400" />
                                        </div>
                                    )}
                                </div>
                            </AnimatedSection>
                        );
                    })}
                </div>

                {/* CTA below */}
                <AnimatedSection delay={STEPS.length * 120 + 80} className="text-center mt-14">
                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-6 rounded-xl text-[14px] transition-all active:scale-[0.97] shadow-warm hover:shadow-warm-md"
                    >
                        Start with your hospital
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </AnimatedSection>
            </div>
        </section>
    );
}
