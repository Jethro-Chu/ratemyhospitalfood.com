import Link from 'next/link';
import { ArrowUpRight, Heart, Radar, UtensilsCrossed } from 'lucide-react';

const explore = [
  ['/', 'Discover'],
  ['/search', 'Search hospitals'],
  ['/top-rated', 'Rankings'],
  ['/recent-reviews', 'Review feed'],
  ['/games', 'Games'],
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-400 text-white">
                <UtensilsCrossed className="h-[18px] w-[18px]" strokeWidth={2.4} />
              </span>
              <p className="font-display text-lg font-extrabold tracking-tight">Rate My Hospital Food</p>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-cream-400">
              A community index of hospital cafeterias, built from the people who actually ate there.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/search?intent=review" className="action-primary">Write a review</Link>
              <Link href="/add" className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-white/50">Add a hospital</Link>
            </div>
          </div>

          <div className="md:col-span-3 md:col-start-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-300">Explore</p>
            <ul className="mt-4 space-y-3 text-sm text-cream-300">
              {explore.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                    {label}<ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-honey-300">About</p>
            <p className="mt-4 text-sm leading-6 text-cream-400">Ratings are community opinions and are provided for entertainment.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[11px] text-cream-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            © {new Date().getFullYear()} Rate My Hospital Food
            <Link href="/abyss" aria-label="Signal detected below safe depth" className="opacity-30 transition-opacity hover:opacity-100"><Radar className="h-3.5 w-3.5" /></Link>
          </p>
          <p className="inline-flex items-center gap-1.5">
            Built with <Heart className="h-3 w-3 fill-[#E9685A] text-[#E9685A]" /> by
            <a href="https://www.instagram.com/jethrochu" target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-brand-300">@jethrochu</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
