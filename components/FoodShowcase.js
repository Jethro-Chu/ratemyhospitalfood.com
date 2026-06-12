'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapClient';
import useReducedMotion from '@/hooks/useReducedMotion';

/**
 * GSAP-pinned cinema section. The stage pins for ~150vh of scroll
 * while the food video scales up from a small tile to near-fullscreen
 * and a giant outlined headline slides through behind it.
 *
 * Asset: Pexels Video #30141959 ("Plates of food on a table"),
 * licensed under the Pexels License (free for commercial use).
 */
export default function FoodShowcase() {
    const rootRef = useRef(null);
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: '+=160%',
                    pin: true,
                    scrub: 0.6,
                },
                defaults: { ease: 'none' },
            });

            tl.fromTo('.fs-video',
                { scale: 0.42, borderRadius: '32px' },
                { scale: 1, borderRadius: '0px', duration: 1 }, 0)
              .fromTo('.fs-headline-top',
                { xPercent: 12 },
                { xPercent: -16, duration: 1 }, 0)
              .fromTo('.fs-headline-bottom',
                { xPercent: -12 },
                { xPercent: 16, duration: 1 }, 0)
              .fromTo('.fs-caption',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.25 }, 0.7)
              .to('.fs-headline-top, .fs-headline-bottom',
                { opacity: 0.1, duration: 0.4 }, 0.6);
        }, rootRef);
        return () => ctx.revert();
    }, [reduced]);

    return (
        <section
            ref={rootRef}
            className="relative w-full h-screen overflow-hidden bg-cream-100 border-y border-ink-900/10"
            aria-label="Featured food showcase"
        >
            {/* Giant outlined headlines behind/around the video */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 select-none" aria-hidden="true">
                <span className="fs-headline-top font-display font-extrabold uppercase whitespace-nowrap leading-none text-outline text-[16vw]">
                    Real food
                </span>
                <span className="fs-headline-bottom font-display font-extrabold uppercase whitespace-nowrap leading-none gradient-text text-[16vw]">
                    Real reviews
                </span>
            </div>

            {/* Video stage */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="fs-video w-full h-full overflow-hidden will-change-transform shadow-warm-xl">
                    <video
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        aria-hidden="true"
                    >
                        <source
                            src="https://videos.pexels.com/video-files/30141959/12925634_1920_1080_24fps.mp4"
                            type="video/mp4"
                        />
                    </video>
                    {/* Tint so the caption stays readable at full bleed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-cream-100/90 via-transparent to-cream-100/40" />
                </div>
            </div>

            {/* Caption pinned to the bottom of the stage */}
            <div className="fs-caption absolute bottom-0 left-0 right-0 z-20 pb-12 sm:pb-16 px-6 text-center">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 mb-3">
                    On the tray today
                </p>
                <p className="text-ink-800 text-[16px] sm:text-[19px] max-w-xl mx-auto leading-relaxed font-medium">
                    Hospital dining is having a moment. From mystery casserole to
                    unexpectedly great pho — we&apos;ve seen it all.
                </p>
            </div>
        </section>
    );
}
