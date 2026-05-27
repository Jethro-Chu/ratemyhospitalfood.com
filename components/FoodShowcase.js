'use client';

import useScrollProgress from '@/hooks/useScrollProgress';
import { Star, Utensils, Sparkles } from 'lucide-react';

/**
 * Apple-style sticky scroll centerpiece.
 *
 * Container is 220vh tall. Inside it, a sticky 100vh stage holds a
 * food video that scales/fades based on scroll progress through the
 * outer container.
 *
 * Asset: Pexels Video #30141959 ("Plates of food on a table"),
 * top-down food plating shot, licensed under the Pexels License
 * (free for commercial use, no attribution required).
 * https://www.pexels.com/license/
 */
export default function FoodShowcase() {
    const [ref, p] = useScrollProgress();

    // Map progress 0→1 to a centered Apple-style zoom curve.
    // 0.0 → small + faded; 0.5 → large + sharp; 1.0 → settles slightly back
    const scale   = 0.78 + Math.sin(Math.min(p, 0.7) / 0.7 * Math.PI) * 0.30;
    const opacity = Math.min(1, Math.max(0.15, p < 0.15 ? p / 0.15 : p > 0.92 ? (1 - p) / 0.08 : 1));
    const headlineY = (1 - Math.min(p / 0.4, 1)) * 30;
    const headlineOpacity = Math.min(1, p / 0.25);
    const captionOpacity  = Math.min(1, Math.max(0, (p - 0.35) / 0.2));
    const floatLeft  = `translate3d(${(p - 0.5) * -40}px, ${Math.sin(p * Math.PI * 2) * 12}px, 0) rotate(${(p - 0.5) * -12}deg)`;
    const floatRight = `translate3d(${(p - 0.5) *  40}px, ${Math.cos(p * Math.PI * 2) * 12}px, 0) rotate(${(p - 0.5) *  12}deg)`;

    return (
        <section
            ref={ref}
            className="relative w-full"
            style={{ height: '220vh' }}
            aria-label="Featured food showcase"
        >
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

                {/* Warm radial glow that intensifies as user scrolls in */}
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, rgba(255,181,39,${0.20 * opacity}) 0%, rgba(255,247,236,0) 60%)`,
                    }}
                    aria-hidden="true"
                />

                {/* Floating decoration: left utensil */}
                <div
                    className="absolute left-[6%] top-1/2 -translate-y-1/2 z-20 hidden md:block"
                    style={{ transform: `translateY(-50%) ${floatLeft}`, opacity: 0.55 + p * 0.4 }}
                >
                    <div className="w-16 h-16 rounded-2xl bg-cream-50 border border-cream-300 shadow-warm-md flex items-center justify-center">
                        <Utensils className="w-7 h-7 text-brand-500" strokeWidth={2.2} />
                    </div>
                </div>

                {/* Floating decoration: right star */}
                <div
                    className="absolute right-[6%] top-1/2 -translate-y-1/2 z-20 hidden md:block"
                    style={{ transform: `translateY(-50%) ${floatRight}`, opacity: 0.55 + p * 0.4 }}
                >
                    <div className="w-16 h-16 rounded-2xl bg-honey-100 border border-honey-200 shadow-warm-md flex items-center justify-center">
                        <Star className="w-7 h-7 text-honey-500 fill-honey-400" strokeWidth={2.2} />
                    </div>
                </div>

                {/* Centerpiece content */}
                <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">

                    {/* Eyebrow */}
                    <div
                        className="inline-flex items-center gap-1.5 bg-cream-50 border border-brand-200/60 text-brand-700 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest mb-5 shadow-warm-sm"
                        style={{ opacity: headlineOpacity }}
                    >
                        <Sparkles className="w-3 h-3" />
                        On the tray today
                    </div>

                    {/* Headline */}
                    <h2
                        className="font-display text-[34px] sm:text-[44px] lg:text-[52px] font-semibold leading-[1.05] tracking-tight text-ink-900"
                        style={{ opacity: headlineOpacity, transform: `translate3d(0, ${headlineY}px, 0)` }}
                    >
                        Real food.<br />
                        <span className="gradient-text">Real reviews.</span>
                    </h2>

                    {/* Video centerpiece */}
                    <div
                        className="mt-9 w-full max-w-2xl aspect-video rounded-3xl overflow-hidden shadow-warm-xl border border-cream-300/80 bg-cream-200 will-change-transform"
                        style={{
                            transform: `scale(${scale})`,
                            opacity,
                        }}
                    >
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
                    </div>

                    {/* Caption */}
                    <p
                        className="mt-6 text-ink-600 text-[15px] max-w-md leading-relaxed"
                        style={{ opacity: captionOpacity }}
                    >
                        Hospital dining is having a moment. From mystery casserole to
                        unexpectedly great pho — we&apos;ve seen it all.
                    </p>
                </div>
            </div>
        </section>
    );
}
