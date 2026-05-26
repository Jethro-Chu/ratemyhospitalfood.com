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
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-zinc-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

                <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center transition-transform group-hover:scale-105">
                        <Image
                            src="/logo.png"
                            alt="Rate My Hospital Food Logo"
                            width={24}
                            height={24}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="font-bold text-[15px] text-zinc-900 tracking-tight whitespace-nowrap">
                        Rate My <span className="text-brand-600">Hospital Food</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                                    active
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
                        className="hidden sm:inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-semibold py-2 px-4 rounded-lg transition-all duration-150 active:scale-[0.97]"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Review
                    </Link>

                    <button
                        onClick={() => setMobileOpen((v) => !v)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {mobileOpen && (
                <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-3 flex flex-col gap-1">
                    {navLinks.map(({ href, label }) => {
                        const active = isActive(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    active
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
                        className="mt-2 flex items-center justify-center gap-1.5 bg-zinc-900 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.97]"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Review
                    </Link>
                </div>
            )}
        </header>
    );
}
