'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getHospitalById } from '@/lib/actions';
import RatingModal from '@/components/RatingModal';
import Link from 'next/link';
import { MapPin, ArrowLeft, Star, MessageSquare, PenLine, Utensils, Loader2 } from 'lucide-react';

export default function HospitalDetail({ params }) {
    const [hospital, setHospital]     = useState(null);
    const [loading, setLoading]       = useState(true);
    const [notFound, setNotFound]     = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleCloseInternal = async () => {
        setIsModalOpen(false);
        const updated = await getHospitalById(params.id);
        setHospital(updated);
    };

    const renderStars = (ratingValue, size = 'w-3.5 h-3.5') => {
        const stars = [];
        const rounded = Math.round(ratingValue);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`${size} ${
                        i <= rounded ? 'text-honey-400 fill-honey-400' : 'text-cream-300 fill-cream-300'
                    }`}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-9 h-9 text-brand-500 animate-spin mb-3" />
                    <div className="text-ink-500 text-sm font-medium">Loading…</div>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center px-4 py-20">
                    <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mb-4">
                        <MapPin className="w-6 h-6 text-ink-400" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-ink-900 mb-1">Hospital not found</h3>
                    <p className="text-ink-500 text-sm mb-5">It may have been removed.</p>
                    <Link
                        href="/"
                        className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all active:scale-95 shadow-warm"
                    >
                        Back to home
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const rating = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);

    let ratingLabel = 'Not yet rated';
    let ratingTone  = 'bg-cream-200 text-ink-500 ring-cream-300';
    if (rating > 0) {
        if      (rating >= 4.5) { ratingLabel = 'Shockingly good';  ratingTone = 'bg-emerald-100 text-emerald-700 ring-emerald-200'; }
        else if (rating >= 3.5) { ratingLabel = 'Would eat again';  ratingTone = 'bg-green-100 text-green-700 ring-green-200';       }
        else if (rating >= 2.5) { ratingLabel = 'It did the job';   ratingTone = 'bg-honey-100 text-honey-700 ring-honey-200';       }
        else if (rating >= 1.5) { ratingLabel = 'Pack snacks';      ratingTone = 'bg-orange-100 text-orange-700 ring-orange-200';    }
        else                    { ratingLabel = 'Pray before eating'; ratingTone = 'bg-red-100 text-red-700 ring-red-200';           }
    }

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />

            <RatingModal
                isOpen={isModalOpen}
                onClose={handleCloseInternal}
                hospitalId={hospital.id}
                hospitalName={hospital.name}
            />

            {/* ── HERO BANNER ── */}
            <div className="relative overflow-hidden bg-gradient-to-b from-cream-200/50 to-cream-100 border-b border-cream-300/60">
                <div className="absolute top-0 right-0 -z-10 w-[400px] h-[400px] bg-brand-200/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" aria-hidden="true" />

                <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="animate-fade-up max-w-2xl">
                            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink-900 tracking-tight leading-[1.05] mb-3">
                                {hospital.name}
                            </h1>
                            <p className="text-ink-600 text-[15px] flex items-center gap-1.5 mb-4">
                                <MapPin className="w-4 h-4 shrink-0 text-ink-400" />
                                {hospital.location}
                            </p>
                            {hospital.tags && hospital.tags.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {hospital.tags.map(tag => (
                                        <span key={tag} className="bg-brand-50 border border-brand-100 text-brand-700 text-[10.5px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Rating card */}
                        <div className="bg-cream-50 border border-cream-300/80 rounded-3xl p-5 shrink-0 lg:max-w-xs w-full lg:w-auto shadow-warm-md animate-fade-up-delay">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-display font-semibold text-2xl ring-1 ${ratingTone}`}>
                                    {rating > 0 ? rating.toFixed(1) : '—'}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[13.5px] font-bold text-ink-900">{ratingLabel}</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="flex items-center gap-0.5">
                                            {renderStars(rating, 'w-3 h-3')}
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-ink-500 mt-1">
                                        {numRatings} {numRatings === 1 ? 'review' : 'reviews'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2 shadow-warm hover:shadow-warm-md"
                            >
                                <PenLine className="w-4 h-4" />
                                Write a Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── REVIEWS ── */}
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 flex-grow">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-cream-300/60">
                    <MessageSquare className="w-4 h-4 text-brand-500" />
                    <h2 className="font-display text-xl font-semibold text-ink-900">Reviews</h2>
                    <span className="text-[11px] font-bold text-ink-600 bg-cream-200/70 px-2 py-0.5 rounded-md ml-1">
                        {numRatings}
                    </span>
                </div>

                <div className="space-y-3 animate-fade-up-delay">
                    {hospital.reviews && hospital.reviews.length > 0 ? (
                        hospital.reviews.map((review, i) => {
                            const revRating = Number(review.rating || 0);
                            let rLabel = '';
                            let badge  = '';
                            let badgeTone = 'text-brand-700 bg-brand-50';
                            if      (revRating === 5) { rLabel = 'Shockingly good';   badge = 'Hidden Gem';        badgeTone = 'text-emerald-700 bg-emerald-50'; }
                            else if (revRating >= 4)  { rLabel = 'Would eat again';   badge = 'Solid Pick';        badgeTone = 'text-green-700 bg-green-50';     }
                            else if (revRating >= 3)  { rLabel = 'It did the job';    badge = 'Cafeteria Classic'; badgeTone = 'text-honey-700 bg-honey-50';     }
                            else if (revRating >= 2)  { rLabel = 'Pack snacks';       badge = 'BYO Sauce';         badgeTone = 'text-orange-700 bg-orange-50';   }
                            else if (revRating >= 1)  { rLabel = 'Pray before eating';badge = 'Needs Salt';        badgeTone = 'text-red-700 bg-red-50';         }

                            return (
                                <div key={review.id || i} className="bg-cream-50 rounded-2xl border border-cream-300/70 p-5 hover:border-brand-200 hover:shadow-warm-sm transition-all duration-200">
                                    <div className="flex gap-4 items-start">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-semibold text-base ring-1 shrink-0 ${
                                            revRating >= 4 ? 'bg-emerald-100 text-emerald-700 ring-emerald-200' :
                                            revRating >= 3 ? 'bg-honey-100 text-honey-700 ring-honey-200' :
                                            revRating > 0  ? 'bg-orange-100 text-orange-700 ring-orange-200' :
                                                             'bg-cream-200 text-ink-500 ring-cream-300'
                                        }`}>
                                            {revRating.toFixed(1)}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <div className="flex items-center gap-0.5">
                                                    {renderStars(revRating, 'w-3 h-3')}
                                                </div>
                                                {rLabel && <span className="text-[10.5px] font-bold text-ink-500 uppercase tracking-wider">{rLabel}</span>}
                                                {badge && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto ${badgeTone}`}>{badge}</span>}
                                            </div>

                                            <p className="text-ink-800 text-[14px] leading-relaxed whitespace-pre-wrap">
                                                {review.comment || <span className="text-ink-300 italic">No comment provided.</span>}
                                            </p>

                                            {review.image_url && (
                                                <div className="mt-3">
                                                    <a href={review.image_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
                                                        <img
                                                            src={review.image_url}
                                                            alt="Food photo from review"
                                                            className="rounded-xl border border-cream-300 max-h-52 max-w-[300px] w-auto object-cover hover:opacity-90 transition-opacity"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </a>
                                                </div>
                                            )}

                                            <div className="mt-3 pt-3 border-t border-cream-200 flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                                                    {(review.name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-ink-800 text-[13.5px]">{review.name || 'Anonymous'}</span>
                                                <span className="text-ink-300">·</span>
                                                <span className="text-ink-500 text-[12.5px]">{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 bg-cream-50 rounded-3xl border border-cream-300/70 shadow-warm-sm">
                            <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-3">
                                <Utensils className="w-6 h-6 text-ink-400" />
                            </div>
                            <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">No reviews yet</h3>
                            <p className="text-ink-500 text-sm mb-5">Someone has to take the first bite.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all active:scale-95 inline-flex items-center gap-2 shadow-warm hover:shadow-warm-md"
                            >
                                <PenLine className="w-4 h-4" />
                                Write a Review
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}
