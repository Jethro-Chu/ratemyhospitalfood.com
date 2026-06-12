'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, PenLine, Utensils, ArrowUpRight } from 'lucide-react';

const navLinks = [
    { href: '/',               label: 'Home',           index: '01' },
    { href: '/top-rated',      label: 'Top Rated',      index: '02' },
    { href: '/recent-reviews', label: 'Recent Reviews', index: '03' },
    { href: '/add',            label: 'Add Hospital',   index: '04' },
    { href: '/games',          label: 'Games',          index: '05' },
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

    // Lock body scroll while the overlay menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    const isActive = (href) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <header className="sticky top-0 z-50 w-full">
            {/* backdrop-filter lives on this inner bar, not the header —
                it would otherwise become the containing block for the
                fixed mobile overlay and clip it to the 64px header box */}
            <div
                className={`transition-all duration-300 ${
                    scrolled || mobileOpen
                        ? 'bg-cream-100/80 backdrop-blur-xl border-b border-ink-900/10'
                        : 'bg-transparent border-b border-transparent'
                }`}
            >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

                <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Rate My Hospital Food home">
                    <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center transition-transform group-hover:scale-105 group-hover:-rotate-6 duration-200 shadow-glow">
                        <Utensils className="w-[18px] h-[18px] text-cream-100" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-display font-bold text-[13px] sm:text-[15px] text-ink-900 tracking-tight whitespace-nowrap uppercase">
                            Rate My<span className="text-brand-500">*</span>Hospital Food
                        </span>
                        <span className="hidden sm:block font-mono text-[9px] text-ink-500 uppercase tracking-[0.3em] mt-1">Cafeteria intel</span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-1" aria-label="Main">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={`relative px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-150 ${
                                    active ? 'text-brand-500' : 'text-ink-600 hover:text-ink-900'
                                }`}
                            >
                                {active && <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-brand-500" />}
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/search"
                        className="hidden sm:inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-cream-100 font-mono text-[11px] font-bold uppercase tracking-[0.12em] py-2.5 px-4 rounded-full transition-all duration-150 active:scale-[0.97] hover:shadow-glow"
                    >
                        <PenLine className="w-3.5 h-3.5" strokeWidth={2.5} />
                        Write a Review
                    </Link>

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden w-10 h-10 flex items-center justify-center rounded-full text-ink-800 hover:text-ink-900 hover:bg-cream-200 border border-ink-900/10 transition-all"
                        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            </div>

            {/* Full-screen overlay menu on mobile */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 top-16 z-40 bg-cream-100/95 backdrop-blur-2xl flex flex-col px-6 pt-10 pb-8 animate-fade-up overflow-y-auto">
                    <nav className="flex flex-col" aria-label="Mobile">
                        {navLinks.map(({ href, label, index }, i) => {
                            const active = isActive(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    aria-current={active ? 'page' : undefined}
                                    className="group flex items-baseline gap-4 py-4 border-b border-ink-900/10 animate-fade-up"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <span className="font-mono text-[11px] text-brand-500">{index}</span>
                                    <span className={`font-display text-[32px] font-bold uppercase tracking-tight leading-none ${
                                        active ? 'text-brand-500' : 'text-ink-900 group-hover:text-brand-500'
                                    } transition-colors`}>
                                        {label}
                                    </span>
                                    <ArrowUpRight className="w-5 h-5 text-ink-400 ml-auto self-center group-hover:text-brand-500 transition-colors" />
                                </Link>
                            );
                        })}
                    </nav>
                    <Link
                        href="/search"
                        onClick={() => setMobileOpen(false)}
                        className="mt-8 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-cream-100 font-mono text-[12px] font-bold uppercase tracking-[0.14em] py-4 px-4 rounded-full transition-all active:scale-[0.97] shadow-glow"
                    >
                        <PenLine className="w-4 h-4" strokeWidth={2.5} />
                        Write a Review
                    </Link>
                    <p className="mt-auto pt-10 font-mono text-[10px] text-ink-400 uppercase tracking-[0.25em] text-center">
                        Real reviews · Real cafeterias
                    </p>
                </div>
            )}
        </header>
    );
}
