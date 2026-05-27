'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { createHospitalClient } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, ArrowLeft, Plus, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function AddHospital() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]         = useState('');
    const router = useRouter();

    async function handleSubmit(formData) {
        setIsLoading(true);
        setError('');
        const name     = formData.get('name');
        const location = formData.get('location');
        try {
            const result = await createHospitalClient({ name, location });
            if (!result || !result.id) {
                setError('Failed to save hospital. Please try again.');
                setIsLoading(false);
                return;
            }
            router.push(`/hospital/${result.id}?review=true`);
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />

            <div className="border-b border-cream-300/60 bg-cream-100">
                <div className="max-w-lg mx-auto px-4 pt-6 pb-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center max-w-lg mx-auto w-full px-4 py-12">
                <div className="bg-cream-50 rounded-3xl border border-cream-300/70 shadow-warm-md p-7 sm:p-8 animate-fade-up">
                    <div className="text-center mb-7">
                        <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-4">
                            <Sparkles className="w-3 h-3" />
                            Help the community
                        </div>
                        <h1 className="font-display text-3xl sm:text-[34px] font-semibold text-ink-900 tracking-tight leading-tight">
                            Add a dining hall
                        </h1>
                        <p className="text-ink-500 text-[14.5px] mt-2 leading-relaxed">
                            Add your hospital so others can rate it.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="hospital-name" className="block text-[12px] font-semibold text-ink-700 mb-1.5">
                                Hospital / Dining Hall Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <input
                                    id="hospital-name"
                                    name="name"
                                    type="text"
                                    placeholder="e.g. St. Jude Cafeteria"
                                    autoComplete="off"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-cream-300 focus-ring text-[14.5px] text-ink-900 placeholder-ink-300 bg-cream-50"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="hospital-location" className="block text-[12px] font-semibold text-ink-700 mb-1.5">
                                Location (City, State)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-ink-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <input
                                    id="hospital-location"
                                    name="location"
                                    type="text"
                                    placeholder="e.g. Memphis, TN"
                                    autoComplete="off"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-cream-300 focus-ring text-[14.5px] text-ink-900 placeholder-ink-300 bg-cream-50"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div role="alert" className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-xl text-[15px] transition-all active:scale-[0.98] mt-2 shadow-warm hover:shadow-warm-md inline-flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Adding…
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Hospital
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-ink-400 mt-5">
                    Duplicates are detected automatically.
                </p>
            </div>
            <Footer />
        </div>
    );
}
