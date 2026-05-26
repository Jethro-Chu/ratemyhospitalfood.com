'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createHospitalClient } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddHospital() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData) {
        setIsLoading(true);
        const name = formData.get('name');
        const location = formData.get('location');
        const result = await createHospitalClient({ name, location });
        if (!result || !result.id) {
             alert('Failed to save hospital');
             setIsLoading(false);
             return;
        }
        router.push(`/hospital/${result.id}?review=true`);
    }

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col antialiased">
            <Header />

            <div className="bg-zinc-50 border-b border-zinc-100 pt-24 pb-4">
                <div className="max-w-lg mx-auto px-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center max-w-lg mx-auto w-full px-4 py-12">
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8 animate-fade-up">
                    <div className="text-center mb-7">
                        <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-6 h-6 text-brand-600" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                            Add a Dining Hall
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1.5">
                            Help others find and rate hospital dining near them.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                                Hospital / Dining Hall Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="e.g. St. Jude Cafeteria"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 focus-ring text-sm text-zinc-800 placeholder-zinc-400 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">
                                Location (City, State)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <input
                                    name="location"
                                    type="text"
                                    placeholder="e.g. Memphis, TN"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-zinc-200 focus-ring text-sm text-zinc-800 placeholder-zinc-400 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all active:scale-[0.98] mt-2"
                        >
                            {isLoading ? 'Adding...' : 'Add Hospital'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-300 mt-5">
                    Duplicate entries are automatically detected.
                </p>
            </div>
            <Footer />
        </div>
    );
}
