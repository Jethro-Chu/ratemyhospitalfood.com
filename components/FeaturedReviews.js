'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import useReducedMotion from '@/hooks/useReducedMotion';

/**
 * Sticky pin section. As the user scrolls through the outer 300vh
 * container, the inner stage stays fixed and the review cards slide
 * horizontally (left-to-right) across it. Mobile collapses to a
 * normal vertical stack of cards.
 */
export default function FeaturedReviews({ reviews }) {
    const ref = useRef(null);
    const [progress, setProgress] = useState(0);
    const [isDesktop, setIsDesktop] = useState(false);
    const reduced = useReducedMotion();

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (reduced || !isDesktop) return;
        let raf = 0;
        const compute = () => {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const vh = window.innerHeight;
            // Progress through the pinned travel: 0 when section enters
            // viewport top, 1 when bottom of inner reaches viewport bottom.
            const travel = rect.height - vh;
            const raw = travel > 0 ? -rect.top / travel : 0;
            setProgress(Math.max(0, Math.min(1, raw)));
        };
        const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(compute); };
        compute();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [reduced, isDesktop]);

    const reviewsToShow = (reviews && reviews.length > 0) ? reviews.slice(0, 6) : [];
    if (reviewsToShow.length === 0) return null;

    const ratingTone = (r) => {
        if (r >= 4.5) return 'bg-emerald-100 text-emerald-700 ring-emerald-200';
        if (r >= 4)   return 'bg-green-100 text-green-700 ring-green-200';
        if (r >= 3)   return 'bg-honey-100 text-honey-700 ring-honey-200';
        if (r >= 2)   return 'bg-orange-100 text-orange-700 ring-orange-200';
        return 'bg-red-100 text-red-700 ring-red-200';
    };

    // Total horizontal travel: enough to slide the row from off-screen-right to off-screen-left
    const trackTranslate = isDesktop && !reduced ? -progress * 70 : 0; // % of track width
    const headlineY = isDesktop && !reduced ? Math.max(0, (0.15 - progress) * 100) : 0;
    const headlineOpacity = isDesktop && !reduced ? Math.min(1, progress * 4) : 1;

    return (
        <section
            ref={ref}
            className="relative bg-cream-100 overflow-hidden"
            style={{ height: isDesktop ? '300vh' : 'auto' }}
            aria-labelledby="featured-reviews-title"
        >
            {/* Decorative blurs */}
            <div className="absolute top-1/4 right-0 -z-0 w-[420px] h-[420px] bg-brand-200/25 rounded-full blur-3xl translate-x-1/4" aria-hidden="true" />
            <div className="absolute bottom-1/4 left-0 -z-0 w-[420px] h-[420px] bg-honey-200/25 rounded-full blur-3xl -translate-x-1/4" aria-hidden="true" />

            <div className={isDesktop ? 'sticky top-0 h-screen flex flex-col justify-center' : 'py-16 sm:py-20'}>

                {/* Heading */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mb-10 sm:mb-14">
                    <div
                        className="max-w-2xl"
                        style={{ transform: `translate3d(0, ${headlineY}px, 0)`, opacity: headlineOpacity, transition: 'transform 0.3s, opacity 0.3s' }}
                    >
                        <div className="inline-flex items-center gap-1.5 bg-cream-50 border border-brand-200/60 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-3">
                            <MessageSquare className="w-3 h-3" />
                            Live from the cafeteria
                        </div>
                        <h2
                            id="featured-reviews-title"
                            className="font-display text-[36px] sm:text-[48px] lg:text-[60px] font-semibold tracking-tight text-ink-900 leading-[1.0]"
                        >
                            What people are actually saying.
                        </h2>
                    </div>
                </div>

                {/* Horizontal track */}
                <div className="w-full overflow-hidden">
                    <div
                        className={isDesktop && !reduced
                            ? 'flex gap-5 sm:gap-6 px-[10vw] will-change-transform'
                            : 'flex flex-col gap-4 px-4 sm:px-6 max-w-3xl mx-auto'}
                        style={isDesktop && !reduced ? {
                            transform: `translate3d(${trackTranslate}vw, 0, 0)`,
                            width: 'max-content',
                        } : undefined}
                    >
                        {reviewsToShow.map((review, i) => (
                            <article
                                key={review.id || i}
                                className={`bg-cream-50 rounded-3xl border border-cream-300/70 p-6 shadow-warm-md hover:shadow-warm-lg transition-shadow ${
                                    isDesktop && !reduced ? 'w-[360px] shrink-0' : 'w-full'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className={`inline-flex items-center justify-center min-w-[48px] h-12 px-3 rounded-xl ring-1 ${ratingTone(Number(review.rating))} font-display font-semibold text-xl leading-none`}>
                                        {Number(review.rating).toFixed(1)}
                                    </div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-cream-100 text-ink-600 border border-cream-300/70">
                                        {review.badge || 'Review'}
                                    </span>
                                </div>

                                <h3 className="font-display text-[18px] font-semibold text-ink-900 leading-snug mb-2 line-clamp-2">
                                    {review.hospitalName || review.hospital_name}
                                </h3>

                                <p className="text-ink-700 text-[14px] italic leading-relaxed line-clamp-4 mb-4">
                                    &ldquo;{review.comment || 'No comment provided.'}&rdquo;
                                </p>

                                <div className="pt-3 border-t border-cream-200 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                        {(review.firstName || review.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-[13.5px] font-semibold text-ink-800">
                                        {review.firstName || review.name || 'Anonymous'}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>

                {/* Hint row only on desktop pinned mode */}
                {isDesktop && !reduced && (
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full mt-8 flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-ink-400">
                            Scroll to see more
                        </span>
                        <div className="h-1 w-32 rounded-full bg-cream-300 overflow-hidden">
                            <div
                                className="h-full bg-brand-500 transition-all duration-150"
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
