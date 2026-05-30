'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import Link from 'next/link';
import { Gamepad2, Utensils, Trophy, Dices, Sparkles, ArrowLeft } from 'lucide-react';

const UPCOMING = [
    {
        icon: Utensils,
        title: 'Tray Guesser',
        copy: 'Look at a mystery cafeteria tray and guess the hospital. Streaks earn bragging rights.',
        tone: 'bg-brand-100 text-brand-700 ring-brand-200',
    },
    {
        icon: Trophy,
        title: 'Rating Showdown',
        copy: 'Two dishes enter, one dish wins. Vote on head-to-head matchups and climb the leaderboard.',
        tone: 'bg-honey-100 text-honey-700 ring-honey-200',
    },
    {
        icon: Dices,
        title: 'Daily Dish',
        copy: 'A new food-rating riddle every day. Keep your streak alive and compare with friends.',
        tone: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    },
];

export default function GamesPage() {
    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-cream-300/60 bg-gradient-to-b from-cream-200/40 to-cream-100">
                <div className="absolute top-0 right-0 -z-10 w-[440px] h-[440px] bg-brand-200/35 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" aria-hidden="true" />
                <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-honey-200/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" aria-hidden="true" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 text-center">
                    <AnimatedSection>
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-brand-500 ring-1 ring-brand-600/30 shadow-warm-md mb-6 animate-float">
                            <Gamepad2 className="w-7 h-7 text-white" strokeWidth={2.5} />
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={100}>
                        <div className="inline-flex items-center gap-1.5 bg-cream-50 border border-brand-200/60 text-brand-700 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider mb-5 shadow-warm-sm">
                            <Sparkles className="w-3 h-3" />
                            Coming soon
                        </div>
                    </AnimatedSection>

                    <AnimatedSection delay={180}>
                        <h1 className="font-display text-[40px] sm:text-[56px] lg:text-[68px] font-semibold tracking-tight text-ink-900 leading-[1.0]">
                            Hospital food,<br className="hidden sm:block" />
                            <span className="gradient-text">but make it a game.</span>
                        </h1>
                    </AnimatedSection>

                    <AnimatedSection delay={260}>
                        <p className="text-[17px] text-ink-600 mt-6 max-w-xl mx-auto leading-relaxed">
                            We&rsquo;re cooking up playful little games built on real cafeteria reviews. Check back soon, or leave a review while you wait.
                        </p>
                    </AnimatedSection>

                    <AnimatedSection delay={340}>
                        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Link
                                href="/search"
                                className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold py-3.5 px-7 rounded-xl text-[15px] transition-all active:scale-[0.97] shadow-warm hover:shadow-warm-md w-full sm:w-auto"
                            >
                                <Utensils className="w-4 h-4" />
                                Write a Review
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center gap-2 bg-cream-50 hover:bg-cream-200/70 text-ink-800 border border-cream-300 font-semibold py-3.5 px-7 rounded-xl text-[15px] transition-all active:scale-[0.97] shadow-warm-sm w-full sm:w-auto"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back Home
                            </Link>
                        </div>
                    </AnimatedSection>
                </div>
            </section>

            {/* Upcoming games */}
            <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-16 sm:py-20">
                <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="font-display text-[28px] sm:text-[36px] font-semibold tracking-tight text-ink-900 leading-tight">
                        On the menu
                    </h2>
                    <p className="text-ink-500 text-[14.5px] mt-2">
                        A taste of what we&rsquo;re building. Nothing here is playable yet.
                    </p>
                </AnimatedSection>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                    {UPCOMING.map((game, i) => {
                        const Icon = game.icon;
                        return (
                            <AnimatedSection key={game.title} delay={i * 120} distance={32}>
                                <div className="relative h-full bg-cream-50 border border-cream-300/70 rounded-3xl p-6 sm:p-7 shadow-warm-sm hover:shadow-warm-md transition-shadow duration-300">
                                    <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-widest text-ink-400 bg-cream-100 border border-cream-300/70 px-2 py-1 rounded-md">
                                        Soon
                                    </span>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-1 ${game.tone} mb-5`}>
                                        <Icon className="w-5 h-5" strokeWidth={2.5} />
                                    </div>
                                    <h3 className="font-display text-[22px] font-semibold text-ink-900 leading-tight mb-2">
                                        {game.title}
                                    </h3>
                                    <p className="text-ink-600 text-[14.5px] leading-relaxed">
                                        {game.copy}
                                    </p>
                                </div>
                            </AnimatedSection>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
}
