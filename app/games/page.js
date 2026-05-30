'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import PixelSprite from '@/components/games/PixelSprite';
import Link from 'next/link';
import { Gamepad2, Play, Sparkles, Star, Smartphone, Layers, Lock } from 'lucide-react';

const COMING_SOON = [
    { title: 'Mystery Meat Match', tag: 'Memory Game', blurb: 'Flip cafeteria trays and match the mystery dishes before the lunch bell.', emoji: '🍖' },
    { title: 'Tray Dash', tag: 'Endless Runner', blurb: 'Dash down the lunch line grabbing jello and dodging spilled soup.', emoji: '🍮' },
    { title: 'Soup or Nope', tag: 'Quick Decisions', blurb: 'Swipe yes or no on each bowl. Trust your gut. Survive the broth.', emoji: '🥣' },
];

export default function GamesPage() {
    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-cream-300/60 bg-gradient-to-b from-cream-200/40 to-cream-100">
                <div className="absolute top-0 right-0 -z-10 w-[440px] h-[440px] bg-brand-200/35 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-honey-200/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" aria-hidden="true" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-12 sm:pt-16 sm:pb-14 text-center">
                    <AnimatedSection>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500 ring-1 ring-brand-600/30 shadow-warm-md mb-5">
                            <Gamepad2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </div>
                    </AnimatedSection>
                    <AnimatedSection delay={100}>
                        <h1 className="font-display text-[38px] sm:text-[54px] font-semibold tracking-tight text-ink-900 leading-[1.02]">
                            Hospital food, <span className="gradient-text">but make it playable.</span>
                        </h1>
                    </AnimatedSection>
                    <AnimatedSection delay={200}>
                        <p className="text-[16px] text-ink-600 mt-5 max-w-2xl mx-auto leading-relaxed">
                            Tiny cafeteria games made for kids, families, mystery soup survivors, and heroic snacks.
                        </p>
                    </AnimatedSection>
                </div>
            </section>

            <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">

                {/* Featured game */}
                <AnimatedSection>
                    <div className="relative overflow-hidden rounded-3xl border border-cream-300/70 shadow-warm-lg bg-cream-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2">

                            {/* Pixel scene */}
                            <div className="relative bg-gradient-to-br from-[#fff3d6] to-[#ffd9b0] p-8 sm:p-10 flex items-end justify-center min-h-[240px] overflow-hidden">
                                <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-cream-50/90 border border-brand-200/60 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest shadow-warm-sm">
                                    <Sparkles className="w-3 h-3" /> Now Playable
                                </div>
                                {/* floating coin + petal */}
                                <div className="absolute top-10 right-10 animate-float"><PixelSprite spriteKey="coin" scale={4} alt="Golden Garlic Coin" /></div>
                                <div className="absolute top-20 right-24 animate-float-delay"><PixelSprite spriteKey="petal" scale={4} alt="Peach Heart Crumb" /></div>
                                <div className="flex items-end gap-4">
                                    <PixelSprite spriteKey="matt_idle" scale={6} alt="Matt Mozzarella" />
                                    <div className="mb-1"><PixelSprite spriteKey="peach_tart" scale={5} alt="Princess Peach Tart" /></div>
                                </div>
                                {/* ground strip */}
                                <div className="absolute bottom-0 inset-x-0 h-5 bg-[#d98b46]" />
                                <div className="absolute bottom-5 inset-x-0 h-1.5 bg-[#f0a85c]" />
                            </div>

                            {/* Details */}
                            <div className="p-7 sm:p-9 flex flex-col">
                                <span className="inline-flex items-center gap-1.5 bg-honey-100 text-honey-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest w-fit mb-3">
                                    2D Pixel Food Adventure
                                </span>
                                <h2 className="font-display text-[26px] sm:text-[30px] font-semibold text-ink-900 leading-tight">
                                    Matt&rsquo;s Mozzarella and the Sweetheart Quest
                                </h2>
                                <p className="text-ink-600 text-[14.5px] leading-relaxed mt-3">
                                    Run, jump, and throw marinara through five food-filled levels to rescue Princess Peach Tart from King Charbroil.
                                </p>

                                <div className="flex flex-wrap gap-2 mt-5">
                                    <Feature icon={Layers}>5 story levels</Feature>
                                    <Feature icon={Smartphone}>Phone &amp; desktop</Feature>
                                    <Feature icon={Star}>Free to play</Feature>
                                </div>

                                <Link
                                    href="/games/matt-mozzarella"
                                    className="mt-6 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold py-3.5 px-7 rounded-xl text-[15px] transition-all active:scale-[0.97] shadow-warm hover:shadow-warm-md w-full sm:w-fit"
                                >
                                    <Play className="w-4 h-4" /> Play Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Coming soon library */}
                <AnimatedSection delay={120} className="mt-14">
                    <div className="flex items-center gap-2 mb-5">
                        <h3 className="font-display text-[22px] font-semibold text-ink-900">More games cooking</h3>
                        <span className="text-[10.5px] font-bold uppercase tracking-widest text-ink-400 bg-cream-200/70 border border-cream-300/70 px-2 py-1 rounded-md">
                            In the kitchen
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {COMING_SOON.map((g, i) => (
                            <AnimatedSection key={g.title} delay={i * 100}>
                                <div className="relative h-full bg-cream-50 border border-cream-300/70 rounded-3xl p-6 shadow-warm-sm">
                                    <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-ink-400 bg-cream-100 border border-cream-300/70 px-2 py-1 rounded-md">
                                        <Lock className="w-3 h-3" /> Soon
                                    </span>
                                    <div className="text-4xl mb-4" aria-hidden="true">{g.emoji}</div>
                                    <div className="text-[10.5px] font-bold uppercase tracking-widest text-brand-600 mb-1">{g.tag}</div>
                                    <h4 className="font-display text-[19px] font-semibold text-ink-900 leading-tight mb-1.5">{g.title}</h4>
                                    <p className="text-ink-600 text-[13.5px] leading-relaxed">{g.blurb}</p>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </AnimatedSection>
            </main>

            <Footer />
        </div>
    );
}

function Feature({ icon: Icon, children }) {
    return (
        <span className="inline-flex items-center gap-1.5 bg-cream-100 border border-cream-300/70 text-ink-700 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold">
            <Icon className="w-3.5 h-3.5 text-brand-500" />
            {children}
        </span>
    );
}
