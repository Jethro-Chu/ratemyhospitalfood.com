'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import { getHospitals } from '@/lib/actions';
import { Star } from 'lucide-react';

export default function TopRated() {
    const [hospitals, setHospitals] = useState([]);

    useEffect(() => {
        async function loadHospitals() {
            try {
                const data = await getHospitals();
                const topRatedHospitals = (data || []).filter(h => h.rating >= 4.5);
                setHospitals(topRatedHospitals);
            } catch (err) {
                console.error("Failed to load", err);
            }
        }
        loadHospitals();
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col antialiased">
            <Header />
            <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16">
                <div className="mb-8 animate-fade-up">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-500">Hall of Fame</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                        Top Rated Hospitals
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        The best hospital dining, ranked by patients and staff.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up-delay">
                    {hospitals.map(hospital => (
                        <HospitalCard hospital={hospital} key={hospital.id} />
                    ))}
                    {hospitals.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <Star className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-600 font-medium">No 4.5+ cafeterias yet.</p>
                            <p className="text-zinc-400 text-sm mt-1">The search for edible hospital food continues.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
