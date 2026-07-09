import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, MessageSquareText, Trophy } from 'lucide-react';
import HeroSearch from './HeroSearch';
import HeroStats from './HeroStats';

export default function HomeHero() {
  return (
    <section className="border-b border-white/10 bg-ink-900 text-white" aria-labelledby="hero-heading">
      <div className="paper-grid">
        <div className="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-6 sm:pb-16 sm:pt-16 lg:pb-20">
          <div className="grid items-end gap-6 sm:gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-brand-300">
                The community cafeteria index
              </p>
              <h1 id="hero-heading" className="mt-4 max-w-4xl font-display text-[38px] font-extrabold leading-[1.02] tracking-tight text-white sm:text-[58px] lg:text-[68px]">
                Hospital food ratings, without the sugarcoating.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-cream-300 sm:text-lg">
                Search real hospitals. Read honest tray reports. Leave the review you wish you had before lunch.
              </p>
              <div className="relative z-20 mt-6 max-w-3xl sm:mt-8">
                <HeroSearch />
              </div>
            </div>

            <div className="border-t border-white/15 pt-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cream-500">Browse the index</p>
              <div className="mt-4 divide-y divide-white/10 border-y border-white/10">
                <QuickLink href="/top-rated" icon={Trophy} label="Top-rated cafeterias" />
                <QuickLink href="/recent-reviews" icon={MessageSquareText} label="Latest tray reports" />
                <QuickLink href="/search?intent=review" icon={Camera} label="Post a rating and photo" />
              </div>
              <Suspense fallback={null}><HeroStats /></Suspense>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLink({ href, icon: Icon, label }) {
  return (
    <Link href={href} className="group flex items-center gap-3 py-2.5 text-sm font-semibold text-cream-200 transition-colors hover:text-white sm:py-3.5">
      <Icon className="h-4 w-4 text-honey-300" aria-hidden="true" />
      <span>{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  );
}
