'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, PenLine, Utensils } from 'lucide-react';

const navLinks = [
    { href: '/',               label: 'Home'           },
    { href: '/top-rated',      label: 'Top Rated'      },
    { href: '/recent-reviews', label: 'Recent Reviews' },
    { href: '/add',            label: 'Add Hospital'   },
    { href: '/games',          label: 'Games'          },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (href) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${
                scrolled
                    ? 'bg-cream-100/85 backdrop-blur-xl border-b border-cream-300/60 shadow-warm-sm'
                    : 'bg-cream-100/60 backdrop-blur-sm border-b border-transparent'
            }`}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

                <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Rate My Hospital Food home">
                    <div className="w-10 h-10 rounded-2xl bg-brand-500 ring-1 ring-brand-600/30 shadow-warm-md flex items-center justify-center transition-transform group-hover:scale-105 group-hover:-rotate-3 duration-200">
                        <Utensils className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-display font-semibold text-[17px] text-ink-900 tracking-tight whitespace-nowrap">
                            Rate My <span className="text-brand-600">Hospital Food</span>
                        </span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-0.5" aria-label="Main">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={`px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-150 ${
                                    active
                                        ? 'bg-brand-50 text-brand-700 font-semibold'
                                        : 'text-ink-500 hover:text-ink-900 hover:bg-cream-200/60'
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/search"
                        className="hidden sm:inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-[13px] font-semibold py-2 px-4 rounded-full transition-all duration-150 active:scale-[0.97] shadow-warm hover:shadow-warm-md"
                    >
                        <PenLine className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Write a Review
                    </Link>

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-ink-700 hover:text-ink-900 hover:bg-cream-200/60 transition-all"
                        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-cream-300/60 bg-cream-100 px-4 py-3 flex flex-col gap-1 animate-fade-up">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                aria-current={active ? 'page' : undefined}
                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    active
                                        ? 'bg-brand-50 text-brand-700 font-semibold'
                                        : 'text-ink-700 hover:bg-cream-200/60'
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/search"
                        onClick={() => setMobileOpen(false)}
                        className="mt-2 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.97] shadow-warm"
                    >
                        <PenLine className="w-4 h-4" strokeWidth={2.5} />
                        Write a Review
                    </Link>
                </div>
            )}
        </header>
    );
}
