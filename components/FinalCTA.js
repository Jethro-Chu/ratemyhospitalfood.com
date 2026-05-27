'use client';

import Link from 'next/link';
import { PenLine, Plus, Utensils, Star } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

/**
 * Closing call-to-action. Big editorial headline, two buttons, and
 * parallax-decorated background. Fades up as it enters view.
 */
export default function FinalCTA() {
    return (
        <section className="relative overflow-hidden bg-cream-100" aria-labelledby="final-cta-title">

            {/* Background decoration */}
            <div className="absolute inset-0 -z-10 paper-grid opacity-50" aria-hidden="true" />
            <div className="absolute top-1/4 left-1/4 -z-0 w-[460px] h-[460px] bg-brand-200/30 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 -z-0 w-[420px] h-[420px] bg-honey-200/30 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" aria-hidden="true" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">

                <AnimatedSection>
                    {/* Floating utensil mark */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-500 ring-1 ring-brand-600/30 shadow-warm-md mb-7 animate-float">
                        <Utensils className="w-7 h-7 text-white" strokeWidth={2.5} />
                    </div>
                </AnimatedSection>

                <AnimatedSection delay={120}>
                    <h2 id="final-cta-title" className="font-display text-[40px] sm:text-[58px] lg:text-[72px] font-semibold tracking-tight text-ink-900 leading-[1.0]">
                        Had hospital food<br className="hidden sm:block" /> recently?
                    </h2>
                </AnimatedSection>

                <AnimatedSection delay={240}>
                    <p className="text-[16px] sm:text-[18px] text-ink-600 mt-6 max-w-xl mx-auto leading-relaxed">
                        Leave a review and help the next patient, nurse, visitor, or hungry resident know what they&rsquo;re walking into.
                    </p>
                </AnimatedSection>

                <AnimatedSection delay={360}>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/search"
                            className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold py-3.5 px-7 rounded-xl text-[15px] transition-all active:scale-[0.97] shadow-warm hover:shadow-warm-md w-full sm:w-auto"
                        >
                            <PenLine className="w-4 h-4" />
                            Write a Review
                        </Link>
                        <Link
                            href="/add"
                            className="inline-flex items-center justify-center gap-2 bg-cream-50 hover:bg-cream-200/70 text-ink-800 border border-cream-300 font-semibold py-3.5 px-7 rounded-xl text-[15px] transition-all active:scale-[0.97] shadow-warm-sm w-full sm:w-auto"
                        >
                            <Plus className="w-4 h-4" />
                            Add a Hospital
                        </Link>
                    </div>
                </AnimatedSection>

                {/* Trust line */}
                <AnimatedSection delay={480}>
                    <div className="mt-12 inline-flex items-center gap-2 text-[12.5px] text-ink-500">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="w-3.5 h-3.5 fill-honey-400 text-honey-400" />
                            ))}
                        </div>
                        <span className="font-medium">Free · No login required · Takes under a minute</span>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
}
