'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRecentReviews } from '@/lib/actions';
import { Star, MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';

export default function RecentReviews() {
    const [reviews, setReviews] = useState([]);
    const [isAllTime, setIsAllTime] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const result = await getRecentReviews();
                setReviews(result.reviews || []);
                setIsAllTime(result.isAllTime || false);
            } catch (err) {
                console.error("Failed to load", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const renderStars = (rating) => (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 text-zinc-200'}`}
                />
            ))}
        </div>
    );

    const getBadge = (rating) => {
        const r = Number(rating || 0);
        if (r === 5) return { label: 'Hidden Gem',      color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
        if (r >= 4) return { label: 'Solid Pick',       color: 'bg-blue-50 text-blue-700 border-blue-100'         };
        if (r >= 3) return { label: 'Cafeteria Classic',color: 'bg-amber-50 text-amber-700 border-amber-100'       };
        if (r >= 2) return { label: 'Pack Snacks',      color: 'bg-orange-50 text-orange-700 border-orange-100'    };
        return           { label: 'Needs Salt',         color: 'bg-red-50 text-red-700 border-red-100'             };
    };

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col antialiased">
            <Header />
            <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 pt-14 pb-16">

                {/* Page header */}
                <div className="mb-8 animate-fade-up">
                    <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare className="w-4 h-4 text-brand-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-brand-500">
                            {isAllTime ? 'All Reviews' : 'Live Feed'}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                        Recent Reviews
                    </h1>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <p className="text-zinc-400 text-sm">
                            {loading ? 'Loading…' : isAllTime
                                ? `Showing all ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                                : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} from the past 30 days`
                            }
                        </p>
                    </div>
                </div>

                {/* Review list */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <div className="text-zinc-400 text-sm">Loading reviews…</div>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="flex flex-col gap-3 animate-fade-up-delay">
                        {reviews.map(review => {
                            const badge = getBadge(review.rating);
                            return (
                                <div key={review.id} className="bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 p-5 transition-all duration-200 hover:shadow-md hover:shadow-zinc-100/80">
                                    <div className="flex flex-col mb-2.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <Link
                                                href={`/hospital/${review.hospital_id}`}
                                                className="font-semibold text-[15px] text-zinc-900 hover:text-brand-600 transition-colors leading-snug"
                                            >
                                                {review.hospital_name}
                                            </Link>
                                            {review.date && (
                                                <span className="text-[11px] text-zinc-400 whitespace-nowrap shrink-0 mt-0.5">{review.date}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            {renderStars(review.rating)}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>

                                    {review.comment ? (
                                        <p className="text-zinc-600 text-[14px] leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                    ) : (
                                        <p className="text-zinc-300 italic text-sm">No comment provided.</p>
                                    )}

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

                                    <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-[11px] font-bold shrink-0">
                                            {(review.name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-zinc-700 text-sm">{review.name || 'Anonymous'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-zinc-100 animate-fade-up-delay">
                        <MessageSquare className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                        <p className="text-zinc-500 font-medium">No reviews yet.</p>
                        <p className="text-zinc-400 text-sm mt-1">Someone has to take the first bite.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
