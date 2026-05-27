'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import { getHospitals } from '@/lib/actions';
import { Star, Trophy, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TopRated() {
    const [hospitals, setHospitals] = useState([]);
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        async function loadHospitals() {
            try {
                const data = await getHospitals();
                const topRatedHospitals = (data || []).filter(h => h.rating >= 4.5);
                setHospitals(topRatedHospitals);
            } catch (err) {
                console.error('Failed to load', err);
            } finally {
                setLoading(false);
            }
        }
        loadHospitals();
    }, []);

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />

            {/* Page header */}
            <div className="relative overflow-hidden border-b border-cream-300/60 bg-gradient-to-b from-cream-200/40 to-cream-100">
                <div className="absolute top-0 right-0 -z-10 w-[420px] h-[420px] bg-honey-200/40 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" aria-hidden="true" />
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12">
                    <div className="animate-fade-up max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 bg-honey-100 border border-honey-200/80 text-honey-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-3">
                            <Trophy className="w-3 h-3" />
                            Hall of Fame
                        </div>
                        <h1 className="font-display text-[36px] sm:text-[48px] font-semibold text-ink-900 tracking-tight leading-tight">
                            Top-rated hospitals
                        </h1>
                        <p className="text-ink-600 text-[15px] mt-2 leading-relaxed">
                            The cafeterias people are actually excited to eat at. Ranked 4.5+ stars by patients and staff.
                        </p>
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-9 h-9 text-brand-500 animate-spin mb-3" />
                        <div className="text-ink-500 text-sm font-medium">Loading top-rated hospitals…</div>
                    </div>
                ) : hospitals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up-delay">
                        {hospitals.map(hospital => (
                            <HospitalCard hospital={hospital} key={hospital.id} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-cream-50 rounded-3xl border border-cream-300/70 shadow-warm-sm max-w-md mx-auto animate-fade-up-delay">
                        <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-ink-400" />
                        </div>
                        <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">No 4.5+ cafeterias yet</h3>
                        <p className="text-ink-500 text-sm mb-5">The search for edible hospital food continues.</p>
                        <Link
                            href="/search"
                            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all inline-flex items-center gap-2 active:scale-95 shadow-warm"
                        >
                            Be the first to rate one
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
