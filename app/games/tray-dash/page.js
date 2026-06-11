'use client';

import Header from '@/components/Header';
import TrayDashGame from '@/components/games/TrayDashGame';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TrayDashPage() {
    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />
            <main className="flex-grow w-full px-3 sm:px-6 py-6 sm:py-10">
                <div className="max-w-[760px] mx-auto mb-4 flex items-center justify-between">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Games
                    </Link>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
                        Endless Runner
                    </span>
                </div>

                <TrayDashGame />
            </main>
        </div>
    );
}
