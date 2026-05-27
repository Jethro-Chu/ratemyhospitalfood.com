'use client';

import Link from 'next/link';
import { ArrowRight, MapPin, Star } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import HospitalCard from './HospitalCard';

/**
 * Cinematic zigzag layout for top hospitals.
 * - Even-indexed cards align left, odd-indexed cards align right.
 * - Each cell uses AnimatedSection for a delayed fade-up on enter.
 * - Visual depth via alternating column offset on desktop.
 */
export default function HospitalDiscovery({ hospitals }) {
    if (!hospitals || hospitals.length === 0) return null;

    const list = hospitals.slice(0, 6);

    return (
        <section
            className="relative bg-cream-50 border-y border-cream-300/60 overflow-hidden"
            aria-labelledby="discover-title"
        >
            <div className="absolute top-1/3 left-0 -z-0 w-[420px] h-[420px] bg-brand-200/25 rounded-full blur-3xl -translate-x-1/3" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 -z-0 w-[460px] h-[460px] bg-honey-200/25 rounded-full blur-3xl translate-x-1/3 translate-y-1/4" aria-hidden="true" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">

                {/* Heading */}
                <AnimatedSection className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
                    <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-3">
                        <Star className="w-3 h-3 fill-brand-500 text-brand-500" />
                        Discover
                    </div>
                    <h2 id="discover-title" className="font-display text-[36px] sm:text-[48px] lg:text-[60px] font-semibold tracking-tight text-ink-900 leading-[1.02]">
                        Most-loved cafeterias.
                    </h2>
                    <p className="text-ink-600 text-[15.5px] mt-4 leading-relaxed">
                        Hospitals where the food is actually worth showing up early for.
                    </p>
                </AnimatedSection>

                {/* Zigzag layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
                    {list.map((hospital, i) => {
                        const isOdd = i % 2 === 1;
                        const wrapperClass = `md:col-span-6 ${isOdd ? 'md:col-start-7 md:mt-12' : 'md:col-start-1'}`;
                        return (
                            <AnimatedSection
                                key={hospital.id}
                                delay={i * 90}
                                distance={32}
                                className={wrapperClass}
                            >
                                <HospitalCard hospital={hospital} />
                            </AnimatedSection>
                        );
                    })}
                </div>

                {/* See all link */}
                <AnimatedSection className="text-center mt-16" delay={list.length * 90 + 100}>
                    <Link
                        href="/top-rated"
                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:text-brand-700 transition-colors group"
                    >
                        See all top-rated hospitals
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </AnimatedSection>
            </div>
        </section>
    );
}
