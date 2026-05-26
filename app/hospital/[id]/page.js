'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getHospitalById } from '@/lib/actions';
import RatingModal from '@/components/RatingModal';
import Link from 'next/link';
import { MapPin, ArrowLeft, Star, MessageSquare, PenLine } from 'lucide-react';

export default function HospitalDetail({ params }) {
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
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
                console.error("Failed to load hospital:", err);
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
                        i <= rounded ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'
                    }`}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col antialiased">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                    <div className="text-zinc-400 text-sm font-medium">Loading...</div>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-white flex flex-col antialiased">
                <Header />
                <main className="flex-grow flex flex-col items-center justify-center px-4 py-20">
                    <MapPin className="w-8 h-8 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-800 mb-1">Hospital not found</h3>
                    <p className="text-zinc-400 text-sm mb-5">It may have been removed.</p>
                    <Link
                        href="/"
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all active:scale-95"
                    >
                        Back to Home
                    </Link>
                </main>
            </div>
        );
    }

    const rating = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);

    let ratingLabel = 'Not yet rated';
    let ratingColor = 'bg-zinc-50 text-zinc-500 border-zinc-200';
    if (rating > 0) {
        if (rating >= 4.5) { ratingLabel = 'Shockingly good'; ratingColor = 'bg-emerald-50 text-emerald-700 border-emerald-200'; }
        else if (rating >= 3.5) { ratingLabel = 'Would eat again'; ratingColor = 'bg-emerald-50 text-emerald-600 border-emerald-200'; }
        else if (rating >= 2.5) { ratingLabel = 'It did the job'; ratingColor = 'bg-amber-50 text-amber-700 border-amber-200'; }
        else if (rating >= 1.5) { ratingLabel = 'Pack snacks'; ratingColor = 'bg-orange-50 text-orange-700 border-orange-200'; }
        else { ratingLabel = 'Pray before eating'; ratingColor = 'bg-red-50 text-red-700 border-red-200'; }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col antialiased">
            <Header />

            <RatingModal
                isOpen={isModalOpen}
                onClose={handleCloseInternal}
                hospitalId={hospital.id}
                hospitalName={hospital.name}
            />

            {/* Header banner */}
            <div className="bg-zinc-50 border-b border-zinc-100 pt-24 pb-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-700 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-2">
                                {hospital.name}
                            </h1>
                            <p className="text-zinc-400 text-sm flex items-center gap-1.5 mb-3">
                                <MapPin className="w-4 h-4 shrink-0" />
                                {hospital.location}
                            </p>
                            {hospital.tags && hospital.tags.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {hospital.tags.map(tag => (
                                        <span key={tag} className="bg-brand-50 text-brand-600 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shrink-0 lg:max-w-xs w-full lg:w-auto">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl border ${ratingColor}`}>
                                    {rating > 0 ? rating.toFixed(1) : '—'}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-zinc-700">{ratingLabel}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="flex items-center gap-0.5">
                                            {renderStars(rating, 'w-3 h-3')}
                                        </div>
                                        <span className="text-xs text-zinc-400">
                                            {numRatings} {numRatings === 1 ? 'review' : 'reviews'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
                            >
                                <PenLine className="w-4 h-4" />
                                Write a Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews */}
            <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 flex-grow">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
                    <MessageSquare className="w-4 h-4 text-zinc-400" />
                    <h2 className="text-lg font-bold text-zinc-900">Reviews</h2>
                    <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md ml-1">
                        {numRatings}
                    </span>
                </div>

                <div className="space-y-3">
                    {hospital.reviews && hospital.reviews.length > 0 ? (
                        hospital.reviews.map((review, i) => {
                            const revRating = Number(review.rating || 0);
                            let rLabel = '';
                            let badge = '';
                            if (revRating === 5) { rLabel = 'Shockingly good'; badge = 'Hidden Gem'; }
                            else if (revRating >= 4) { rLabel = 'Would eat again'; badge = 'Solid Pick'; }
                            else if (revRating >= 3) { rLabel = 'It did the job'; badge = 'Cafeteria Classic'; }
                            else if (revRating >= 2) { rLabel = 'Pack snacks'; badge = 'Bring Your Own Sauce'; }
                            else if (revRating >= 1) { rLabel = 'Pray before eating'; badge = 'Needs Salt'; }

                            return (
                                <div key={i} className="bg-white rounded-xl border border-zinc-100 p-5 hover:border-zinc-200 transition-all duration-200">
                                    <div className="flex gap-3.5 items-start">
                                        <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base border shrink-0 ${
                                            revRating >= 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            revRating >= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-zinc-50 text-zinc-600 border-zinc-200'
                                        }`}>
                                            {revRating.toFixed(1)}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <div className="flex items-center gap-0.5">
                                                    {renderStars(revRating, 'w-3 h-3')}
                                                </div>
                                                {rLabel && <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">{rLabel}</span>}
                                                {badge && <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded ml-auto">{badge}</span>}
                                            </div>

                                            <p className="text-zinc-700 text-[14px] leading-relaxed whitespace-pre-wrap">
                                                {review.comment || "No comment provided."}
                                            </p>

                                            {review.image_url && (
                                                <div className="mt-3">
                                                    <a href={review.image_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
                                                        <img
                                                            src={review.image_url}
                                                            alt="Food photo"
                                                            className="rounded-lg border border-zinc-100 max-h-48 max-w-[280px] w-auto object-cover hover:opacity-90 transition-opacity"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </a>
                                                </div>
                                            )}

                                            <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center gap-2 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-[11px] font-bold shrink-0">
                                                    {(review.name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-zinc-700">{review.name || 'Anonymous'}</span>
                                                <span className="text-zinc-200">&middot;</span>
                                                <span className="text-zinc-400 text-[13px]">{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-zinc-700 mb-1">No reviews yet</h3>
                            <p className="text-zinc-400 text-sm mb-5">Someone has to take the first bite.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5 px-5 rounded-lg text-sm transition-all active:scale-95 inline-flex items-center gap-2"
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
