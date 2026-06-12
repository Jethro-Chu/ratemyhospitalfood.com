'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsapClient';
import useReducedMotion from '@/hooks/useReducedMotion';

/**
 * GSAP-pinned horizontal gallery. On desktop the section pins and the
 * review cards scrub sideways as the user scrolls; on mobile (or with
 * reduced motion) it collapses to a vertical stack.
 */
export default function FeaturedReviews({ reviews }) {
    const rootRef  = useRef(null);
    const trackRef = useRef(null);
    const [isDesktop, setIsDesktop] = useState(false);
    const reduced = useReducedMotion();

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    const reviewsToShow = (reviews && reviews.length > 0) ? reviews.slice(0, 6) : [];
    const count = reviewsToShow.length;

    // Chrome's initial snap can land the mobile swipe track mid-list;
    // force it back to the first card.
    useEffect(() => {
        if (isDesktop && !reduced) return;
        const t = setTimeout(() => {
            if (trackRef.current) trackRef.current.scrollLeft = 0;
        }, 80);
        return () => clearTimeout(t);
    }, [isDesktop, reduced, count]);

    // CSS position:sticky does the pinning (via the tall outer section);
    // GSAP only scrubs the horizontal travel. Pin spacers proved
    // unreliable in this layout.
    const [travel, setTravel] = useState(0);

    useEffect(() => {
        if (reduced || !isDesktop || count === 0) { setTravel(0); return; }
        const measure = () => {
            if (trackRef.current) {
                setTravel(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
            }
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [reduced, isDesktop, count]);

    useEffect(() => {
        if (reduced || !isDesktop || count === 0 || travel === 0) return;
        const ctx = gsap.context(() => {
            gsap.to(trackRef.current, {
                x: -travel,
                ease: 'none',
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.5,
                },
            });

            gsap.to('.fr-progress', {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.3,
                },
            });
        }, rootRef);
        return () => ctx.revert();
    }, [reduced, isDesktop, count, travel]);

    if (count === 0) return null;

    const ratingTone = (r) => {
        if (r >= 4.5) return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
        if (r >= 4)   return 'bg-green-100 text-green-700 ring-green-200';
        if (r >= 3)   return 'bg-honey-100 text-honey-700 ring-honey-200';
        if (r >= 2)   return 'bg-orange-100 text-orange-700 ring-orange-200';
        return 'bg-red-100 text-red-700 ring-red-200';
    };

    const horizontal = isDesktop && !reduced;

    return (
        <section
            ref={rootRef}
            className="relative bg-cream-50 border-y border-ink-900/10"
            style={horizontal ? { height: `calc(100vh + ${travel}px)` } : undefined}
            aria-labelledby="featured-reviews-title"
        >
            <div className={horizontal ? 'sticky top-0 h-screen overflow-hidden flex flex-col justify-center' : 'py-16 sm:py-24'}>

                {/* Heading */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mb-10 sm:mb-12 flex items-end justify-between gap-6">
                    <div className="max-w-3xl">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 mb-4 inline-flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-dot" />
                            Live from the cafeteria
                        </p>
                        <h2
                            id="featured-reviews-title"
                            className="font-display font-extrabold uppercase text-[11vw] sm:text-[64px] lg:text-[88px] tracking-tight text-ink-900 leading-[0.95]"
                        >
                            What people are<br />
                            <span className="gradient-text">actually saying.</span>
                        </h2>
                    </div>
                    {horizontal ? (
                        <div className="hidden lg:flex flex-col items-end gap-2 pb-2 shrink-0">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink-400">
                                Scroll →
                            </span>
                            <div className="h-px w-40 bg-ink-200 overflow-hidden">
                                <div className="fr-progress h-full w-full bg-brand-500 origin-left" style={{ transform: 'scaleX(0)' }} />
                            </div>
                        </div>
                    ) : (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink-400 pb-1 shrink-0">
                            Swipe →
                        </span>
                    )}
                </div>

                {/* Track */}
                <div className={horizontal ? 'w-full overflow-hidden' : ''}>
                    <div
                        ref={trackRef}
                        className={horizontal
                            ? 'flex gap-6 pl-4 sm:pl-6 lg:pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pr-[40vw] will-change-transform w-max'
                            : 'flex gap-4 px-4 sm:px-6 overflow-x-auto snap-x snap-mandatory scroll-pl-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'}
                    >
                        {reviewsToShow.map((review, i) => (
                            <article
                                key={review.id || i}
                                className={`relative bg-cream-100 rounded-3xl border border-ink-900/10 p-6 sm:p-7 shadow-warm-md hover:border-brand-500/40 transition-colors ${
                                    horizontal ? 'w-[380px] shrink-0' : 'w-[85%] max-w-[360px] shrink-0 snap-start'
                                }`}
                            >
                                <span className="absolute top-5 right-6 font-display font-extrabold text-[44px] leading-none text-outline select-none" aria-hidden="true">
                                    {String(i + 1).padStart(2, '0')}
                                </span>

                                <div className={`inline-flex items-center justify-center min-w-[52px] h-12 px-3 rounded-xl ring-1 ${ratingTone(Number(review.rating))} font-mono font-bold text-xl leading-none mb-5`}>
                                    {Number(review.rating).toFixed(1)}
                                </div>

                                <h3 className="font-display text-[19px] font-bold uppercase tracking-tight text-ink-900 leading-snug mb-3 line-clamp-2 pr-10">
                                    {review.hospitalName || review.hospital_name}
                                </h3>

                                <p className="text-ink-600 text-[14.5px] leading-relaxed line-clamp-4 mb-5">
                                    &ldquo;{review.comment || 'No comment provided.'}&rdquo;
                                </p>

                                <div className="pt-4 border-t border-ink-900/10 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-cream-100 text-[11px] font-bold shrink-0">
                                            {(review.firstName || review.name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-600">
                                            {review.firstName || review.name || 'Anonymous'}
                                        </span>
                                    </div>
                                    <span className="font-mono text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-[0.15em] bg-cream-200 text-ink-500">
                                        {review.badge || 'Review'}
                                    </span>
                                </div>
                            </article>
                        ))}

                        {/* End-cap inside the horizontal track */}
                        {horizontal && (
                            <div className="w-[320px] shrink-0 flex items-center">
                                <p className="font-display font-extrabold uppercase text-[40px] leading-[1] text-outline select-none">
                                    Your turn<br />next →
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
