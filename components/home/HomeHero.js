import { Suspense } from 'react';
import Link from 'next/link';
import HeroSearch from './HeroSearch';
import HeroStats from './HeroStats';
import { Shimmer } from '@/components/Skeletons';

const FLOATERS = [
  { emoji: '🍜', className: 'top-24 right-[8%] rotate-6 animate-float' },
  { emoji: '🥗', className: 'top-48 left-[6%] -rotate-6 animate-float-delay' },
  { emoji: '🍮', className: 'bottom-24 right-[14%] -rotate-3 animate-float' },
];

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      <div
        className="absolute inset-0 paper-grid opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-44 -left-32 w-80 h-80 bg-honey-400/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {FLOATERS.map(({ emoji, className }) => (
        <div
          key={emoji}
          className={`hidden lg:flex absolute items-center justify-center w-14 h-14 rounded-2xl bg-cream-50 border border-ink-900/10 shadow-warm-md text-2xl pointer-events-none ${className}`}
          aria-hidden="true"
        >
          {emoji}
        </div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-24 pb-16 sm:pb-24 flex flex-col items-center text-center">
        <p className="inline-flex items-center gap-2 rounded-full bg-cream-50 border border-ink-900/10 shadow-warm-sm px-4 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-ink-500 animate-fade-up">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-dot" aria-hidden="true" />
          Real reviews · Real cafeterias
        </p>

        <h1
          id="hero-heading"
          className="mt-6 font-display font-bold tracking-tight text-ink-900 text-[38px] sm:text-6xl lg:text-[64px] leading-[1.08] sm:leading-[1.05] max-w-3xl animate-fade-up-delay"
        >
          Find out which hospitals actually have <span className="gradient-text">good food</span>.
        </h1>

        <p className="mt-5 text-ink-500 text-base sm:text-lg max-w-xl leading-relaxed animate-fade-up-delay-2">
          Search hospitals, read real food reviews, and see what patients, visitors, and staff are saying.
        </p>

        <div className="mt-8 w-full flex justify-center animate-fade-up-delay-3">
          <HeroSearch />
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto animate-fade-up-delay-3">
          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-cream-50 font-semibold text-[14px] py-3 px-7 rounded-full transition-all duration-150 active:scale-[0.97] shadow-warm-sm hover:shadow-glow"
          >
            Search hospitals
          </Link>
          <Link
            href="/search?intent=review"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-ink-900/15 hover:border-brand-500 hover:text-brand-600 text-ink-700 font-semibold text-[14px] py-3 px-7 rounded-full transition-all duration-150 active:scale-[0.97] bg-cream-50/60"
          >
            Add a review
          </Link>
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-400 animate-fade-up-delay-3">
          Free · No sign-up · Takes under a minute
        </p>

        <Suspense
          fallback={
            <div className="mt-10 w-full max-w-md">
              <Shimmer className="h-[88px] rounded-3xl" />
            </div>
          }
        >
          <HeroStats />
        </Suspense>
      </div>
    </section>
  );
}
