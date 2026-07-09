'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, PenLine, Search, UtensilsCrossed } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Discover' },
  { href: '/top-rated', label: 'Rankings' },
  { href: '/recent-reviews', label: 'Reviews' },
  { href: '/games', label: 'Games' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-900/10 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-5 px-4 sm:px-6">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3" aria-label="Rate My Hospital Food home">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white transition-colors group-hover:bg-brand-600">
            <UtensilsCrossed className="h-[18px] w-[18px]" strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-[15px] font-extrabold tracking-tight text-ink-900 sm:text-[17px]">
              Rate My Hospital Food
            </span>
            <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.2em] text-ink-400">
              Community dining index
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden h-full items-center md:flex" aria-label="Main navigation">
          {navLinks.map(({ href, label }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`relative flex h-full items-center px-3 text-[13px] font-semibold transition-colors ${active ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900'}`}
              >
                {label}
                {active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand-500" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-2">
          <Link
            href="/search"
            aria-label="Search hospitals"
            title="Search hospitals"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-ink-900/10 text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
          <Link href="/search?intent=review" className="action-primary hidden py-2.5 sm:inline-flex">
            <PenLine className="h-4 w-4" aria-hidden="true" />
            Write a review
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-ink-900/10 text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600 md:hidden"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="absolute inset-x-0 top-full z-40 min-h-[calc(100vh-68px)] overflow-y-auto border-t border-ink-900/10 bg-cream-100 px-4 py-6 md:hidden">
          <nav className="border-t border-ink-900/10" aria-label="Mobile navigation">
            {navLinks.map(({ href, label }, index) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center border-b border-ink-900/10 py-5"
              >
                <span className="w-9 font-mono text-[10px] text-ink-400">0{index + 1}</span>
                <span className={`font-display text-2xl font-bold ${isActive(href) ? 'text-brand-600' : 'text-ink-900'}`}>{label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/add" onClick={() => setMobileOpen(false)} className="action-secondary">Add hospital</Link>
            <Link href="/search?intent=review" onClick={() => setMobileOpen(false)} className="action-primary">
              <PenLine className="h-4 w-4" /> Review
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
