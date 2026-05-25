'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { getHospitalById } from '@/lib/actions';
import RatingModal from '@/components/RatingModal';
import Link from 'next/link';
import { MapPin, ArrowLeft, Star, Calendar, MessageSquare, PenLine } from 'lucide-react';

export default function HospitalDetail({ params }) {
    const [hospital, setHospital] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Auto-open review modal if coming from 'Add Review' flow
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('review') === 'true') {
                setIsModalOpen(true);
                // Clean up the URL so refreshing doesn't re-trigger it
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, []);

    // Fetch data using the Server Action
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
        }
    }, [params.id]);

    const handleCloseInternal = async () => {
       setIsModalOpen(false);
       // Refetch data to show new review immediately
       const updated = await getHospitalById(params.id);
       setHospital(updated);
    };

    // Render star row helper
    const renderStars = (ratingValue, starSize = 'w-4 h-4') => {
        const stars = [];
        const rounded = Math.round(ratingValue);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`${starSize} ${
                        i <= rounded
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-200'
                    }`}
                />
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFBFC] flex flex-col antialiased">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="text-slate-500 font-semibold text-sm">Loading dining hall details...</div>
                </div>
            </div>
        );
    }

    if (!hospital) {
        return (
            <div className="min-h-screen bg-[#FAFBFC] flex flex-col antialiased">
                <Header />
                <main className="flex-grow container mx-auto px-4 md:px-6 pt-32 pb-16 max-w-4xl fade-in-up flex flex-col justify-center items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Hospital not found</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        The hospital you&apos;re looking for may have been removed or doesn&apos;t exist.
                    </p>
                    <Link 
                        href="/" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md shadow-blue-600/10 hover:shadow-lg active:scale-95"
                    >
                        Back to Home
                    </Link>
                </main>
            </div>
        );
    }

    const rating = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);

    let ratingBg = 'bg-slate-50 text-slate-500 border-slate-200';
    let ratingLabel = 'Not yet rated';
    
    if (rating > 0) {
        if (rating >= 4) {
            ratingBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            ratingLabel = 'Excellent';
        } else if (rating >= 2.5) {
            ratingBg = 'bg-amber-50 text-amber-700 border-amber-200';
            ratingLabel = 'Average';
        } else {
            ratingBg = 'bg-rose-50 text-rose-700 border-rose-200';
            ratingLabel = 'Below Average';
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFBFC] flex flex-col antialiased">
            <Header />

            <RatingModal
                isOpen={isModalOpen}
                onClose={handleCloseInternal}
                hospitalId={hospital.id}
                hospitalName={hospital.name}
            />

            {/* 1. Detail Header Banner */}
            <div className="bg-gradient-to-b from-blue-50/60 to-white border-b border-slate-100 pt-28 pb-10 md:pt-32 md:pb-14">
                <div className="container max-w-6xl mx-auto px-4 md:px-6">
                    {/* Back navigation */}
                    <div className="mb-6">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to all hospitals
                        </Link>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                        <div className="flex-grow">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
                                {hospital.name}
                            </h1>
                            <p className="text-slate-500 text-sm md:text-base flex items-center gap-1.5 mb-4">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                                {hospital.location}
                            </p>
                            
                            {/* Tags pill badges */}
                            {hospital.tags && hospital.tags.length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                    {hospital.tags.map(tag => (
                                        <span 
                                            key={tag} 
                                            className="bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border border-blue-100"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ratings Box & Action Button */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm shrink-0 lg:max-w-sm w-full lg:w-auto">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl border ${ratingBg}`}>
                                    {rating > 0 ? rating.toFixed(1) : '—'}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-700 mb-0.5">
                                        {ratingLabel}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5">
                                            {renderStars(rating, 'w-3.5 h-3.5')}
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {numRatings} {numRatings === 1 ? 'review' : 'reviews'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setIsModalOpen(true)} 
                                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold py-3 px-5 rounded-xl text-sm shadow-md shadow-blue-600/10 hover:shadow-lg hover:shadow-blue-600/15 transition-all duration-200 inline-flex items-center justify-center gap-2"
                            >
                                <PenLine className="w-4 h-4" />
                                Write a Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Reviews Section */}
            <div className="container max-w-3xl mx-auto px-4 py-12 flex-grow">
                <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
                        Reviews & Ratings
                    </h2>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md ml-1">
                        {numRatings}
                    </span>
                </div>

                <div className="space-y-4">
                    {hospital.reviews && hospital.reviews.length > 0 ? (
                        hospital.reviews.map((review, i) => {
                            const revRating = Number(review.rating || 0);
                            let rBg = 'bg-slate-50 text-slate-600 border-slate-200';
                            let rLabel = 'Average';
                            
                            if (revRating >= 4) {
                                rBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                rLabel = 'Great';
                            } else if (revRating >= 2.5) {
                                rBg = 'bg-amber-50 text-amber-700 border-amber-200';
                                rLabel = 'Okay';
                            } else {
                                rBg = 'bg-rose-50 text-rose-700 border-rose-200';
                                rLabel = 'Poor';
                            }

                            return (
                                <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.04)] p-5 md:p-6 transition-all duration-200 hover:shadow-md">
                                    <div className="flex gap-4 items-start">
                                        {/* Score badge */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-md border shrink-0 ${rBg}`}>
                                            {revRating.toFixed(1)}
                                        </div>
                                        
                                        <div className="flex-grow min-w-0">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-800 leading-tight">
                                                        {rLabel}
                                                    </h4>
                                                    <div className="flex items-center gap-0.5">
                                                        {renderStars(revRating, 'w-3 h-3')}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{review.date}</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                {review.comment || "No comment provided."}
                                            </p>

                                            {/* Review Photo */}
                                            {review.image_url && (
                                                <div className="mt-3">
                                                    <a href={review.image_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
                                                        <img
                                                            src={review.image_url}
                                                            alt="Food photo"
                                                            className="rounded-xl border border-slate-100 max-h-52 max-w-[280px] w-auto object-cover hover:opacity-90 transition-opacity duration-200 shadow-sm"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </a>
                                                </div>
                                            )}
                                            
                                            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5 text-xs text-slate-400">
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">
                                                    {(review.name || 'A').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-500">{review.name || 'Anonymous'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-300">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">No reviews yet</h3>
                            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                                Be the first to share your experience with the food here!
                            </p>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md shadow-blue-600/10 active:scale-95 inline-flex items-center gap-2"
                            >
                                <PenLine className="w-4 h-4" />
                                Write a Review
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-white py-8 mt-auto">
                <div className="container mx-auto max-w-6xl px-4 text-center">
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} Rate My Hospital Food — Helping you find better meals, one cafeteria at a time.
                    </p>
                </div>
            </footer>
        </div>
    );
}
