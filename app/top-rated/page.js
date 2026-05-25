'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
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
        <div className="min-h-screen bg-[#FFF7ED] font-sans flex flex-col antialiased">
            <Header />
            <main className="flex-grow container mx-auto px-4 md:px-6 pt-28 pb-16 max-w-6xl fade-in-up">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Hall of Fame</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-800 tracking-tight">
                      Top Rated Hospitals
                    </h1>
                    <p className="text-zinc-500 text-base mt-2">
                      The best hospital dining experiences, ranked by patients and staff.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hospitals.map(hospital => (
                        <HospitalCard hospital={hospital} key={hospital.id} />
                    ))}
                    {hospitals.length === 0 && (
                        <div className="col-span-full text-center py-20 text-zinc-500 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                            <Star className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                            <p className="text-zinc-600 font-medium">No 4.5+ cafeterias yet.</p>
                            <p className="text-zinc-400 text-sm mt-1">The search for edible hospital food continues.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
