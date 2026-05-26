'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Plus } from 'lucide-react';

const navLinks = [
    { href: '/',               label: 'Home'           },
    { href: '/top-rated',      label: 'Top Rated'      },
    { href: '/recent-reviews', label: 'Recent Reviews' },
    { href: '/add',            label: 'Add Hospital'   },
];

export default function Header() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const isHome = pathname === '/';

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const isActive = (href) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    const transparent = isHome && !scrolled;

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
            transparent
                ? 'bg-blue-950/55 backdrop-blur-md border-b border-white/10'
                : 'bg-white/92 backdrop-blur-xl border-b border-zinc-100 shadow-sm shadow-zinc-100/60'
        }`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                        transparent
                            ? 'bg-white/10 border border-white/25'
                            : 'bg-brand-50 border border-brand-100'
                    }`}>
                        <Image
                            src="/logo.png"
                            alt="Rate My Hospital Food Logo"
                            width={24}
                            height={24}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className={`font-bold text-[15px] tracking-tight whitespace-nowrap transition-colors duration-300 ${
                        transparent ? 'text-white' : 'text-zinc-900'
                    }`}>
                        Rate My{' '}
                        <span className={`transition-colors duration-300 ${transparent ? 'text-blue-300' : 'text-brand-600'}`}>
                            Hospital Food
                        </span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-0.5">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                    transparent
                                        ? active
                                            ? 'bg-white/20 text-white font-semibold'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        : active
                                            ? 'bg-brand-50 text-brand-700 font-semibold'
                                            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
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
                        className={`hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold py-2 px-4 rounded-lg transition-all duration-150 active:scale-[0.97] ${
                            transparent
                                ? 'bg-white/12 hover:bg-white/20 text-white border border-white/25'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Review
                    </Link>

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className={`md:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                            transparent
                                ? 'text-white/80 hover:text-white hover:bg-white/10'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                        }`}
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className={`md:hidden border-t px-4 py-3 flex flex-col gap-1 ${
                    transparent
                        ? 'border-white/10 bg-blue-950/85 backdrop-blur-xl'
                        : 'border-zinc-100 bg-white'
                }`}>
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    transparent
                                        ? active
                                            ? 'bg-white/20 text-white font-semibold'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                        : active
                                            ? 'bg-brand-50 text-brand-700 font-semibold'
                                            : 'text-zinc-600 hover:bg-zinc-50'
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/search"
                        onClick={() => setMobileOpen(false)}
                        className={`mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.97] ${
                            transparent
                                ? 'bg-white/12 text-white border border-white/25'
                                : 'bg-blue-600 text-white'
                        }`}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Review
                    </Link>
                </div>
            )}
        </header>
    );
}
