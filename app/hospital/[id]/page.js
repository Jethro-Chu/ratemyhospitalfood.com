'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RatingModal from '@/components/RatingModal';
import RatingStars from '@/components/RatingStars';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';
import Reveal from '@/components/Reveal';
import { Shimmer, ReviewCardSkeleton } from '@/components/Skeletons';
import { getHospitalById } from '@/lib/actions';
import { getRatingTone } from '@/lib/ratingTone';
import { pluralize, firstNameOf } from '@/lib/format';
import { MapPin, Globe, PenLine } from 'lucide-react';

const MAX_STRIP_PHOTOS = 10;

export default function HospitalDetail({ params }) {
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ?review=true opens the modal straight away, then tidies the URL.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('review') === 'true') {
                setIsModalOpen(true);
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, []);

    useEffect(() => {
        async function loadHospital() {
            try {
                const data = await getHospitalById(params.id);
                if (data) {
                    setHospital(data);
                } else {
                    setNotFound(true);
                }
            } catch (err) {
                console.error('Failed to load hospital:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        if (params.id) {
            loadHospital();
        } else {
            setNotFound(true);
            setLoading(false);
        }
    }, [params.id]);

    // Closing the modal re-fetches, so a fresh review shows up immediately.
    const handleCloseInternal = async () => {
        setIsModalOpen(false);
        const updated = await getHospitalById(params.id);
        if (updated) setHospital(updated);
    };

    const scrollToReview = (reviewId) => {
        const el = document.getElementById('review-' + reviewId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-100 flex flex-col">
                <Header />
                <main className="flex-grow">
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 w-full">
                        <div className="rounded-3xl bg-cream-50 border border-ink-900/10 shadow-warm-sm p-6 sm:p-10">
                            <Shimmer className="h-3 w-28" />
                            <Shimmer className="mt-4 h-10 sm:h-12 w-3/4 max-w-xl" />
                            <Shimmer className="mt-4 h-4 w-64 max-w-full" />
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <Shimmer className="h-16 w-24 rounded-2xl" />
                                        <div className="space-y-2.5">
                                            <Shimmer className="h-5 w-32" />
                                            <Shimmer className="h-6 w-36 rounded-full" />
                                            <Shimmer className="h-3 w-20" />
                                        </div>
                                    </div>
                                    <Shimmer className="mt-6 h-11 w-48 rounded-full" />
                                </div>
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Shimmer key={i} className="h-2.5 w-full rounded-full" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
                        <div className="max-w-2xl">
                            <Shimmer className="h-9 w-44" />
                            <div className="mt-8 space-y-5">
                                <ReviewCardSkeleton />
                                <ReviewCardSkeleton />
                                <ReviewCardSkeleton />
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        );
    }

    if (notFound || !hospital) {
        return (
            <div className="min-h-screen bg-cream-100 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-14 sm:py-20">
                    <EmptyState
                        emoji="🏥"
                        title="We couldn't find that hospital."
                        message="It may have been removed, or the link is off."
                        actionHref="/search"
                        actionLabel="Search hospitals"
                        secondaryHref="/add"
                        secondaryLabel="Add a hospital"
                        className="w-full max-w-xl"
                    />
                </main>
                <Footer />
            </div>
        );
    }

    const rating = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);
    const reviews = hospital.reviews || [];
    const tone = getRatingTone(rating);

    const distribution = [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((r) => Math.round(Number(r.rating) || 0) === star).length;
        const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
        return { star, count, pct };
    });

    const photos = reviews.filter((r) => r.image_url).slice(0, MAX_STRIP_PHOTOS);

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col">
            <Header />

            <RatingModal
                isOpen={isModalOpen}
                onClose={handleCloseInternal}
                hospitalId={hospital.id}
                hospitalName={hospital.name}
            />

            <main className="flex-grow pb-28 md:pb-0">
                {/* ── Summary hero ── */}
                <section className="relative overflow-hidden">
                    <div
                        className="absolute -top-24 right-0 w-[420px] h-[420px] bg-brand-500/10 blur-3xl rounded-full pointer-events-none"
                        aria-hidden="true"
                    />
                    <div
                        className="absolute top-40 -left-32 w-[320px] h-[320px] bg-honey-400/10 blur-3xl rounded-full pointer-events-none"
                        aria-hidden="true"
                    />

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 w-full">
                        <div className="rounded-3xl bg-cream-50 border border-ink-900/10 shadow-warm-sm p-6 sm:p-10 animate-fade-up">
                            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-500">( Hospital )</p>
                            <h1 className="mt-3 font-display font-bold tracking-tight text-ink-900 text-4xl sm:text-5xl leading-[1.05]">
                                {hospital.name}
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                                <p className="inline-flex items-center gap-1.5 text-[15px] text-ink-700">
                                    <MapPin className="w-4 h-4 shrink-0 text-ink-400" aria-hidden="true" />
                                    {hospital.location}
                                </p>
                                {hospital.website && (
                                    <a
                                        href={hospital.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                                    >
                                        <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
                                        Visit website
                                    </a>
                                )}
                            </div>

                            {/* Rating block: score on the left, distribution beside it on desktop */}
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                                <div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-display font-bold tracking-tight text-ink-900 text-6xl leading-none">
                                            {rating > 0 ? rating.toFixed(1) : '—'}
                                        </span>
                                        <div>
                                            <RatingStars rating={rating} size={20} />
                                            <span
                                                className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.chip}`}
                                            >
                                                <span aria-hidden="true">{tone.emoji}</span> {tone.label}
                                            </span>
                                            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-400">
                                                {pluralize(numRatings, 'review')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-6 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-cream-50 font-semibold text-[14px] py-2.5 px-6 rounded-full transition-all duration-150 active:scale-[0.97] shadow-warm-sm hover:shadow-glow"
                                    >
                                        <PenLine className="w-4 h-4" aria-hidden="true" />
                                        Rate this hospital
                                    </button>
                                </div>

                                <div className="space-y-2.5" aria-label="Rating distribution">
                                    {distribution.map(({ star, count, pct }) => (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="font-mono text-[11px] text-ink-500 w-7 shrink-0">
                                                {star}★
                                            </span>
                                            <div className="flex-1 h-2.5 rounded-full bg-cream-200 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-honey-400 transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="font-mono text-[11px] text-ink-400 w-7 shrink-0 text-right">
                                                {count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Photo strip ── */}
                {photos.length > 0 && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 sm:mt-12 w-full">
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-500">( Photo evidence )</p>
                        <p className="mt-1.5 text-[13px] text-ink-500">Tap a photo to jump to its review.</p>
                        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar snap-x pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                            {photos.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => scrollToReview(r.id)}
                                    className="relative w-40 h-28 shrink-0 snap-start rounded-2xl overflow-hidden border border-ink-900/10 shadow-warm-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-warm-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100"
                                    aria-label={`Jump to ${firstNameOf(r.name)}'s review`}
                                >
                                    <Image
                                        src={r.image_url}
                                        alt={`Food photo from ${firstNameOf(r.name)}'s review`}
                                        fill
                                        sizes="160px"
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Reviews ── */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20 w-full">
                    <div className="max-w-2xl">
                        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-500">( Reviews )</p>
                        <div className="mt-2 flex items-center gap-3">
                            <h2 className="font-display font-bold tracking-tight text-ink-900 text-3xl sm:text-4xl">
                                Reviews
                            </h2>
                            <span className="rounded-full bg-cream-200 text-ink-600 font-mono text-[12px] px-3 py-1">
                                {numRatings}
                            </span>
                        </div>

                        <div className="mt-8 space-y-5">
                            {reviews.length > 0 ? (
                                reviews.map((r, i) => (
                                    <div key={r.id || i} id={'review-' + r.id}>
                                        <Reveal delay={Math.min(i * 40, 300)}>
                                            <ReviewCard review={r} />
                                        </Reveal>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-ink-900/15 bg-cream-50/70 px-6 py-14 text-center">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-cream-200/70 flex items-center justify-center text-[28px] animate-float">
                                        <span aria-hidden="true">🍽️</span>
                                    </div>
                                    <h3 className="mt-5 font-display font-bold text-xl text-ink-900">No reviews yet</h3>
                                    <p className="mt-2 text-[14px] text-ink-500 max-w-sm mx-auto leading-relaxed">
                                        Be the first to rate the food here.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-6 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-cream-50 font-semibold text-[14px] py-2.5 px-6 rounded-full transition-all duration-150 active:scale-[0.97] shadow-warm-sm hover:shadow-glow"
                                    >
                                        <PenLine className="w-4 h-4" aria-hidden="true" />
                                        Rate this hospital
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* ── Mobile sticky CTA ── */}
            {!isModalOpen && (
                <div
                    className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4"
                    style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
                >
                    <div className="glass-panel rounded-full shadow-warm-xl p-2">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-400 text-cream-50 font-semibold text-[14px] py-3.5 px-6 rounded-full transition-all duration-150 active:scale-[0.98] shadow-warm-sm"
                        >
                            <PenLine className="w-4 h-4" aria-hidden="true" />
                            Rate this hospital
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
