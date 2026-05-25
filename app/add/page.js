'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { saveHospital } from '@/lib/data';
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
        
        const result = saveHospital({ name, location });
        
        if (!result) {
             alert('Failed to save hospital');
             setIsLoading(false);
             return;
        }
        
        router.push(`/hospital/${result.id}?review=true`);
    }

    return (
        <div className="min-h-screen bg-[#FAFBFC] flex flex-col antialiased">
            <Header />
            
            {/* Decorative top banner */}
            <div className="bg-gradient-to-b from-blue-50/60 to-[#FAFBFC] pt-28 pb-6 border-b border-slate-100">
                <div className="container mx-auto px-4 max-w-xl">
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to all hospitals
                    </Link>
                </div>
            </div>

            <div className="flex-grow container mx-auto px-4 py-10 md:py-16 flex flex-col justify-center max-w-xl">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.04)] p-6 md:p-10 fade-in-up">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-b from-blue-50 to-blue-100 border border-blue-200/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-7 h-7 text-blue-600" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                            Add a Dining Hall
                        </h1>
                        <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                            Help others find and rate healthcare dining facilities near them.
                        </p>
                    </div>

                    <form action={handleSubmit} className="space-y-5">
                        {/* Name input */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2">
                                Hospital / Dining Hall Name
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Building2 className="w-4 h-4" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    placeholder="e.g. St. Jude Cafeteria"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus-ring text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Location input */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2">
                                Location (City, State)
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <input
                                    name="location"
                                    type="text"
                                    placeholder="e.g. Memphis, TN"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus-ring text-sm text-slate-800 placeholder-slate-400 transition-all duration-200 bg-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/15 active:scale-[0.98] transition-all duration-200 mt-2"
                        >
                            {isLoading ? 'Adding Hospital...' : 'Add Hospital'}
                        </button>
                    </form>
                </div>

                {/* Helper text */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    Duplicate entries will be automatically detected.
                </p>
            </div>
        </div>
    );
}