'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsapClient';
import useReducedMotion from '@/hooks/useReducedMotion';

const VIDEO_SRC = 'https://videos.pexels.com/video-files/30141959/12925634_1920_1080_24fps.mp4';

/**
 * Desktop: GSAP-pinned cinema — the stage pins for ~160vh of scroll
 * while the food video scales from a small tile to fullscreen and a
 * giant outlined headline slides through behind it.
 *
 * Mobile: no pinning (pinned scrub + browser-chrome resize is janky on
 * phones) — a static editorial composition with a simple rise-in.
 *
 * Asset: Pexels Video #30141959 ("Plates of food on a table"),
 * licensed under the Pexels License (free for commercial use).
 */
export default function FoodShowcase() {
    const rootRef = useRef(null);
    const reduced = useReducedMotion();
    const [isDesktop, setIsDesktop] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(mq.matches);
        update();
        setMounted(true);
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

    // CSS position:sticky does the pinning; GSAP only scrubs the
    // animation across the tall outer section (pin spacers proved
    // unreliable in this layout).
    useEffect(() => {
        if (reduced || !isDesktop) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: rootRef.current,
                    start: 'top top',
                    end: 'bottom bottom',
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
    }, [reduced, isDesktop]);

    // Simple rise-in for the mobile composition
    useEffect(() => {
        if (reduced || isDesktop || !mounted) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.fsm-rise',
                { y: 36, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out',
                    scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
                });
        }, rootRef);
        return () => ctx.revert();
    }, [reduced, isDesktop, mounted]);

    // ----- Mobile / reduced-motion-on-small-screens layout -----
    if (mounted && !isDesktop) {
        return (
            <section
                ref={rootRef}
                className="relative w-full overflow-hidden bg-cream-100 border-y border-ink-900/10 py-16"
                aria-label="Featured food showcase"
            >
                <div className="px-4">
                    <p className="fsm-rise font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 mb-4">
                        On the tray today
                    </p>
                    <h2 className="fsm-rise font-display font-bold tracking-tight leading-[1.05] text-[12vw]">
                        <span className="block text-ink-900">Real food,</span>
                        <span className="block gradient-text">real reviews.</span>
                    </h2>

                    <div className="fsm-rise mt-7 rounded-3xl overflow-hidden border border-ink-900/10 shadow-warm-xl">
                        <video
                            className="w-full aspect-[4/3] object-cover"
                            autoPlay loop muted playsInline preload="metadata"
                            aria-hidden="true"
                        >
                            <source src={VIDEO_SRC} type="video/mp4" />
                        </video>
                    </div>

                    <p className="fsm-rise mt-6 text-ink-600 text-[15px] leading-relaxed">
                        Hospital dining is having a moment. From mystery casserole to
                        unexpectedly great pho — we&apos;ve seen it all.
                    </p>
                </div>
            </section>
        );
    }

    // ----- Desktop sticky cinema -----
    return (
        <section
            ref={rootRef}
            className="relative w-full bg-cream-100 border-y border-ink-900/10"
            style={{ height: '260vh' }}
            aria-label="Featured food showcase"
        >
            <div className="sticky top-0 h-screen overflow-hidden">
            {/* Giant outlined headlines behind/around the video */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 select-none" aria-hidden="true">
                <span className="fs-headline-top font-display font-bold whitespace-nowrap leading-none text-cream-400 text-[16vw]">
                    Real food,
                </span>
                <span className="fs-headline-bottom font-display font-bold whitespace-nowrap leading-[1.1] gradient-text text-[16vw]">
                    real reviews.
                </span>
            </div>

            {/* Video stage */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <div className="fs-video w-full h-full overflow-hidden will-change-transform shadow-warm-xl">
                    <video
                        className="w-full h-full object-cover"
                        autoPlay loop muted playsInline preload="metadata"
                        aria-hidden="true"
                    >
                        <source src={VIDEO_SRC} type="video/mp4" />
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
            </div>
        </section>
    );
}
