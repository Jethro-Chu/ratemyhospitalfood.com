import Link from 'next/link';
import { Utensils, Heart, Radar, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative border-t border-ink-900/10 bg-cream-100 mt-auto overflow-hidden">

      {/* Giant ghost wordmark */}
      <div
        className="pointer-events-none select-none absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-display font-bold leading-none text-cream-300 opacity-60 text-[18vw] sm:text-[13vw]"
        aria-hidden="true"
      >
        Hospital Food
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-28 sm:pb-36">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-10">

          {/* Brand */}
          <div className="sm:col-span-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow">
                <Utensils className="w-4 h-4 text-cream-100" strokeWidth={2.5} />
              </div>
              <p className="font-display font-bold text-[16px] tracking-tight text-ink-900">
                Rate My<span className="text-brand-500">*</span>Hospital Food
              </p>
            </div>
            <p className="text-[13.5px] text-ink-500 leading-relaxed max-w-sm">
              The community guide to hospital cafeteria food. Honest, friendly
              reviews from patients, staff, and visitors — so you know before you go.
            </p>
          </div>

          {/* Explore */}
          <div className="sm:col-span-3">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 mb-4">Explore</h3>
            <ul className="flex flex-col gap-2.5 text-[14px]">
              {[
                ['/',               'Home'],
                ['/top-rated',      'Top Rated'],
                ['/recent-reviews', 'Recent Reviews'],
                ['/games',          'Games'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="group inline-flex items-center gap-1 text-ink-600 hover:text-ink-900 transition-colors">
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contribute */}
          <div className="sm:col-span-3">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-honey-400 mb-4">Contribute</h3>
            <ul className="flex flex-col gap-2.5 text-[14px]">
              {[
                ['/add',    'Add a Hospital'],
                ['/search?intent=review', 'Write a Review'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="group inline-flex items-center gap-1 text-ink-600 hover:text-ink-900 transition-colors">
                    {label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-honey-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-ink-900/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-400">
          <p className="inline-flex items-center gap-2">
            &copy; {new Date().getFullYear()} Rate My Hospital Food · For entertainment purposes
            <Link
              href="/abyss"
              aria-label="Signal detected below safe depth"
              title="Signal detected below safe depth"
              className="opacity-30 hover:opacity-100 hover:text-cyan-600 transition-all duration-300"
            >
              <Radar className="w-3.5 h-3.5" />
            </Link>
          </p>
          <p className="inline-flex items-center gap-1.5 normal-case tracking-normal">
            Built with <Heart className="w-3 h-3 fill-brand-500 text-brand-500" /> by{' '}
            <a
              href="https://www.instagram.com/jethrochu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-700 hover:text-brand-500 transition-colors"
            >
              @jethrochu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
