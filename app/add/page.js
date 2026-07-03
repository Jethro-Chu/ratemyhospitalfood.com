'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { createHospitalClient } from '@/lib/actions';
import { Loader2, Plus } from 'lucide-react';

const inputBase =
    'w-full rounded-2xl bg-cream-50 px-4 py-3 text-[16px] text-ink-900 placeholder:text-ink-400 focus-ring border';

export default function AddHospitalPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitError, setSubmitError] = useState('');

    function clearFieldError(field) {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }

    async function handleSubmit(formData) {
        const name = (formData.get('name') || '').toString().trim();
        const location = (formData.get('location') || '').toString().trim();

        const errors = {};
        if (!name) {
            errors.name = 'Give us the hospital name — that’s the whole point.';
        } else if (name.length < 3) {
            errors.name = 'Hospital names run at least 3 characters.';
        }
        if (!location) {
            errors.location = 'Add a city and state so people can find it.';
        }

        setFieldErrors(errors);
        setSubmitError('');
        if (Object.keys(errors).length > 0) return;

        setIsLoading(true);
        try {
            const result = await createHospitalClient({ name, location });
            if (!result || !result.id) {
                setSubmitError('We couldn’t save that — give it another try in a moment.');
                setIsLoading(false);
                return;
            }
            router.push(`/hospital/${result.id}?review=true`);
        } catch (err) {
            console.error(err);
            setSubmitError('We couldn’t save that — give it another try in a moment.');
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col">
            <Header />
            <main className="flex-grow">
                <section className="relative overflow-hidden py-14 sm:py-20">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[480px] bg-brand-500/10 blur-3xl rounded-full"
                    />

                    <div className="relative max-w-lg mx-auto px-4 sm:px-6">
                        <Reveal>
                            <div className="text-center mb-8">
                                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-500">
                                    ( Add a hospital )
                                </p>
                                <h1 className="mt-3 font-display font-bold tracking-tight text-ink-900 text-4xl sm:text-5xl">
                                    Put a cafeteria on the{' '}
                                    <span className="gradient-text">map</span>.
                                </h1>
                                <p className="mt-4 text-ink-700 text-[15px] leading-relaxed">
                                    Not listed yet? Add it in about 20 seconds — then leave the
                                    first review.
                                </p>
                            </div>

                            <div className="rounded-3xl bg-cream-50 border border-ink-900/10 shadow-warm-sm p-6 sm:p-8">
                                <form action={handleSubmit} noValidate className="space-y-5">
                                    <div>
                                        <label
                                            htmlFor="hospital-name"
                                            className="block text-[13px] font-semibold text-ink-700 mb-1.5"
                                        >
                                            Hospital name
                                        </label>
                                        <input
                                            id="hospital-name"
                                            name="name"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="St. Mary's Medical Center"
                                            aria-invalid={fieldErrors.name ? 'true' : undefined}
                                            aria-describedby={
                                                fieldErrors.name
                                                    ? 'hospital-name-error'
                                                    : 'hospital-name-hint'
                                            }
                                            onChange={() => clearFieldError('name')}
                                            className={`${inputBase} ${
                                                fieldErrors.name
                                                    ? 'border-brand-500'
                                                    : 'border-ink-900/15'
                                            }`}
                                        />
                                        {fieldErrors.name ? (
                                            <p
                                                id="hospital-name-error"
                                                role="alert"
                                                className="mt-1.5 text-[13px] text-red-700"
                                            >
                                                {fieldErrors.name}
                                            </p>
                                        ) : (
                                            <p
                                                id="hospital-name-hint"
                                                className="mt-1.5 text-[13px] text-ink-500"
                                            >
                                                The full name, as it appears on the building.
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="hospital-location"
                                            className="block text-[13px] font-semibold text-ink-700 mb-1.5"
                                        >
                                            Location
                                        </label>
                                        <input
                                            id="hospital-location"
                                            name="location"
                                            type="text"
                                            autoComplete="off"
                                            placeholder="Duarte, CA"
                                            aria-invalid={
                                                fieldErrors.location ? 'true' : undefined
                                            }
                                            aria-describedby={
                                                fieldErrors.location
                                                    ? 'hospital-location-error'
                                                    : 'hospital-location-hint'
                                            }
                                            onChange={() => clearFieldError('location')}
                                            className={`${inputBase} ${
                                                fieldErrors.location
                                                    ? 'border-brand-500'
                                                    : 'border-ink-900/15'
                                            }`}
                                        />
                                        {fieldErrors.location ? (
                                            <p
                                                id="hospital-location-error"
                                                role="alert"
                                                className="mt-1.5 text-[13px] text-red-700"
                                            >
                                                {fieldErrors.location}
                                            </p>
                                        ) : (
                                            <p
                                                id="hospital-location-hint"
                                                className="mt-1.5 text-[13px] text-ink-500"
                                            >
                                                City, State — e.g. Duarte, CA
                                            </p>
                                        )}
                                    </div>

                                    {submitError && (
                                        <div
                                            role="alert"
                                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700"
                                        >
                                            {submitError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-cream-50 font-semibold text-[14px] py-2.5 px-6 rounded-full transition-all duration-150 active:scale-[0.97] shadow-warm-sm hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2
                                                    className="w-4 h-4 animate-spin"
                                                    aria-hidden="true"
                                                />
                                                Adding…
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" aria-hidden="true" />
                                                Add hospital
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 pt-5 border-t border-ink-900/10 text-center space-y-2">
                                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-400">
                                        Already listed? We&rsquo;ll take you straight to its page
                                        — no duplicates.
                                    </p>
                                    <Link
                                        href="/search"
                                        className="inline-flex items-center justify-center gap-2 border border-ink-900/15 hover:border-brand-500 hover:text-brand-600 text-ink-700 font-semibold text-[13px] py-2 px-5 rounded-full transition-all duration-150 active:scale-[0.97]"
                                    >
                                        Search existing hospitals
                                    </Link>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
