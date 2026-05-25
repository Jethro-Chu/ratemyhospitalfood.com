'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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

    const isActive = (href) =>
        href === '/' ? pathname === '/' : pathname.startsWith(href);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-orange-100/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shadow-sm shrink-0 transition-transform group-hover:scale-105 border border-orange-200/60">
                        <Image
                            src="/logo.png"
                            alt="Rate My Hospital Food Logo"
                            width={28}
                            height={28}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-bold text-lg text-zinc-800 tracking-tight whitespace-nowrap">
                        Rate My <span className="text-[#C5612B] font-extrabold">Hospital Food</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={[
                                    'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                                    active
                                        ? 'bg-orange-50 text-[#C5612B] font-semibold shadow-sm ring-1 ring-orange-200/70'
                                        : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/80',
                                ].join(' ')}
                            >
                                {label}
                                {active && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8733A]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: CTA + Mobile Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/search"
                        className="hidden sm:inline-flex items-center gap-1.5 bg-[#E8733A] hover:bg-[#D4622A] text-white text-sm font-semibold py-2 px-4 rounded-xl shadow-md shadow-orange-300/25 hover:shadow-orange-400/30 transition-all duration-200 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Review
                    </Link>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-all duration-200"
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="md:hidden border-t border-orange-100/50 bg-white/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                className={[
                                    'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                    active
                                        ? 'bg-orange-50 text-[#C5612B] font-semibold ring-1 ring-orange-200/70'
                                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                                ].join(' ')}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <Link
                        href="/add"
                        onClick={() => setMobileOpen(false)}
                        className="mt-2 flex items-center justify-center gap-1.5 bg-[#E8733A] hover:bg-[#D4622A] text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-orange-300/20 transition-all duration-200 active:scale-95"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Review
                    </Link>
                </div>
            )}
        </header>
    );
}
