'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import PixelSprite from '@/components/games/PixelSprite';
import { SPRITES as DASH_SPRITES } from '@/lib/games/trayDash/sprites';
import Link from 'next/link';
import { Gamepad2, Play, Sparkles, Star, Smartphone, Layers, Lock, Zap, Trophy, Hand } from 'lucide-react';

const COMING_SOON = [
    { title: 'Mystery Meat Match', tag: 'Memory Game', blurb: 'Flip cafeteria trays and match the mystery dishes before the lunch bell.', emoji: '🍖' },
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

                {/* Featured game #2 — Tray Dash */}
                <AnimatedSection delay={100} className="mt-8">
                    <div className="relative overflow-hidden rounded-3xl border border-cream-300/70 shadow-warm-lg bg-cream-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2">

                            {/* Pixel scene — checkered cafeteria floor */}
                            <div className="relative p-8 sm:p-10 flex items-end justify-center min-h-[240px] overflow-hidden lg:order-2 bg-[#f8e9c9]">
                                <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-cream-50/90 border border-brand-200/60 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest shadow-warm-sm z-10">
                                    <Sparkles className="w-3 h-3" /> Now Playable
                                </div>
                                <div className="absolute top-10 right-10 animate-float"><PixelSprite sprite={DASH_SPRITES.jello} scale={4} alt="Jello cup" /></div>
                                <div className="absolute top-24 right-28 animate-float-delay"><PixelSprite sprite={DASH_SPRITES.shield_bubble} scale={3} alt="Jello Shield" /></div>
                                <div className="absolute top-16 left-10 animate-float-delay"><PixelSprite sprite={DASH_SPRITES.tray_fly} scale={3} alt="Flying tray" /></div>
                                <div className="flex items-end gap-5 mb-2">
                                    <PixelSprite sprite={DASH_SPRITES.tot_run1} scale={6} alt="Scooter Tot running" />
                                    <PixelSprite sprite={DASH_SPRITES.meatball_roll} scale={5} alt="Runaway meatball" />
                                </div>
                                {/* checkered floor strip */}
                                <div
                                    className="absolute bottom-0 inset-x-0 h-7"
                                    style={{
                                        background: 'repeating-linear-gradient(90deg, #f0e1c0 0 28px, #e0caa0 28px 56px)',
                                        borderTop: '3px solid #b98d52',
                                    }}
                                />
                            </div>

                            {/* Details */}
                            <div className="p-7 sm:p-9 flex flex-col lg:order-1">
                                <span className="inline-flex items-center gap-1.5 bg-honey-100 text-honey-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest w-fit mb-3">
                                    Endless Runner
                                </span>
                                <h2 className="font-display text-[26px] sm:text-[30px] font-semibold text-ink-900 leading-tight">
                                    Tray Dash
                                </h2>
                                <p className="text-ink-600 text-[14.5px] leading-relaxed mt-3">
                                    Sprint down an endless lunch line — leap soup spills, slide under flying trays,
                                    and grab every jello cup as the rush gets faster and faster. One crash and it&rsquo;s over!
                                </p>

                                <div className="flex flex-wrap gap-2 mt-5">
                                    <Feature icon={Zap}>Gets faster forever</Feature>
                                    <Feature icon={Smartphone}>Phone &amp; desktop</Feature>
                                    <Feature icon={Trophy}>Beat your best</Feature>
                                </div>

                                <Link
                                    href="/games/tray-dash"
                                    className="mt-6 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold py-3.5 px-7 rounded-xl text-[15px] transition-all active:scale-[0.97] shadow-warm hover:shadow-warm-md w-full sm:w-fit"
                                >
                                    <Play className="w-4 h-4" /> Play Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Featured game #3 — Slop Drop */}
                <AnimatedSection delay={100} className="mt-8">
                    <div className="relative overflow-hidden rounded-3xl border border-cream-300/70 shadow-warm-lg bg-cream-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2">

                            {/* Cafeteria bin scene — pure CSS + emoji, like the game itself */}
                            <div className="relative p-8 sm:p-10 flex items-end justify-center min-h-[240px] overflow-hidden bg-[#e7efe9]">
                                <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 bg-cream-50/90 border border-brand-200/60 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest shadow-warm-sm z-10">
                                    <Sparkles className="w-3 h-3" /> Now Playable
                                </div>
                                <div className="absolute top-8 right-12 text-3xl animate-float" aria-hidden="true">🍮</div>
                                <div className="absolute top-20 right-24 text-2xl animate-float-delay" aria-hidden="true">🟩</div>
                                <div className="absolute top-12 left-12 text-2xl animate-float-delay" aria-hidden="true">🧊</div>
                                {/* the bin */}
                                <div className="relative w-[230px] h-[110px] mb-1">
                                    <div className="absolute inset-x-0 bottom-0 h-[96px] rounded-b-xl border-x-8 border-b-8 border-[#b3bcc3] bg-gradient-to-b from-[#dde4e6] to-[#c6cdd2]" />
                                    <div className="absolute -left-2 top-0 w-[26px] h-2.5 bg-[#e4e9ec] rounded-sm" />
                                    <div className="absolute -right-2 top-0 w-[26px] h-2.5 bg-[#e4e9ec] rounded-sm" />
                                    <div className="absolute bottom-2 inset-x-4 flex items-end justify-center gap-0.5 text-3xl" aria-hidden="true">
                                        <span className="translate-y-1">🍖</span>
                                        <span className="text-4xl">🍕</span>
                                        <span className="translate-y-1">🍳</span>
                                        <span className="-translate-y-3 text-2xl">🍎</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-7 sm:p-9 flex flex-col">
                                <span className="inline-flex items-center gap-1.5 bg-honey-100 text-honey-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest w-fit mb-3">
                                    Physics Merge
                                </span>
                                <h2 className="font-display text-[26px] sm:text-[30px] font-semibold text-ink-900 leading-tight">
                                    Slop Drop
                                </h2>
                                <p className="text-ink-600 text-[14.5px] leading-relaxed mt-3">
                                    Drop cafeteria food into the serving bin. Two of the same slop merge into one
                                    greater slop — climb from Ice Chips to the Fabled Five-Star Entrée without
                                    overflowing the bin. Every merge gets a review.
                                </p>

                                <div className="flex flex-wrap gap-2 mt-5">
                                    <Feature icon={Hand}>One-finger play</Feature>
                                    <Feature icon={Smartphone}>Phone &amp; desktop</Feature>
                                    <Feature icon={Star}>11-item menu</Feature>
                                </div>

                                <Link
                                    href="/games/slop-drop"
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
