'use client';

import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft, Maximize2 } from 'lucide-react';

export default function SlopDropPage() {
    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />
            <main className="flex-grow w-full px-3 sm:px-6 py-6 sm:py-10">
                <div className="max-w-[560px] mx-auto mb-4 flex items-center justify-between">
                    <Link
                        href="/games"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Games
                    </Link>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
                        Physics Merge
                    </span>
                </div>

                {/* The game is a single self-contained static file; the iframe is its phone-shaped stage. */}
                <div
                    className="relative mx-auto rounded-3xl overflow-hidden border border-cream-300/80 shadow-warm-lg bg-[#e7efe9]"
                    style={{ width: 'min(100%, calc(82vh * 0.6), 560px)', aspectRatio: '480 / 800' }}
                >
                    <iframe
                        src="/games/slop-drop.html"
                        title="Slop Drop — hospital cafeteria merge game"
                        className="absolute inset-0 w-full h-full border-0"
                        allow="autoplay"
                    />
                </div>

                <p className="text-center text-ink-400 text-[12px] mt-3">
                    Drag to aim, release to drop. Same slop merges into greater slop.{' '}
                    <a
                        href="/games/slop-drop.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-ink-500 hover:text-brand-600 transition-colors"
                    >
                        <Maximize2 className="w-3 h-3" /> Full screen
                    </a>
                </p>
            </main>
        </div>
    );
}
