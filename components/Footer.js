import Link from 'next/link';
import { Utensils, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-cream-300/60 bg-cream-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">

          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 ring-1 ring-brand-600/30 flex items-center justify-center shadow-warm-md">
                <Utensils className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <p className="font-display font-semibold text-[15px] text-ink-900">Rate My Hospital Food</p>
            </div>
            <p className="text-[13px] text-ink-500 leading-relaxed max-w-xs">
              A community-driven guide to the best (and worst) hospital cafeterias.
              Real reviews from patients, staff, and visitors.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-3">Explore</h3>
            <ul className="flex flex-col gap-2 text-[14px]">
              <li><Link href="/"               className="text-ink-600 hover:text-brand-600 transition-colors">Home</Link></li>
              <li><Link href="/top-rated"      className="text-ink-600 hover:text-brand-600 transition-colors">Top Rated</Link></li>
              <li><Link href="/recent-reviews" className="text-ink-600 hover:text-brand-600 transition-colors">Recent Reviews</Link></li>
              <li><Link href="/games"          className="text-ink-600 hover:text-brand-600 transition-colors">Games</Link></li>
            </ul>
          </div>

          {/* Contribute */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-ink-400 mb-3">Contribute</h3>
            <ul className="flex flex-col gap-2 text-[14px]">
              <li><Link href="/add"    className="text-ink-600 hover:text-brand-600 transition-colors">Add a Hospital</Link></li>
              <li><Link href="/search" className="text-ink-600 hover:text-brand-600 transition-colors">Write a Review</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream-300/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-ink-400">
          <p>&copy; {new Date().getFullYear()} Rate My Hospital Food. For entertainment purposes.</p>
          <p className="inline-flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 fill-brand-500 text-brand-500" /> by{' '}
            <a
              href="https://www.instagram.com/jethrochu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-700 hover:text-brand-600 transition-colors"
            >
              @jethrochu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
