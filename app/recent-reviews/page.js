'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getRecentReviews } from '@/lib/actions';
import { Star, MessageSquare, Clock, Loader2, Utensils } from 'lucide-react';
import Link from 'next/link';

export default function RecentReviews() {
    const [reviews, setReviews]   = useState([]);
    const [isAllTime, setIsAllTime] = useState(false);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const result = await getRecentReviews();
                setReviews(result.reviews || []);
                setIsAllTime(result.isAllTime || false);
            } catch (err) {
                console.error('Failed to load', err);
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
                    className={`w-3.5 h-3.5 ${i < rating ? 'fill-honey-400 text-honey-400' : 'fill-cream-300 text-cream-300'}`}
                />
            ))}
        </div>
    );

    const getBadge = (rating) => {
        const r = Number(rating || 0);
        if (r === 5) return { label: 'Hidden Gem',         color: 'bg-emerald-100 text-emerald-700' };
        if (r >= 4)  return { label: 'Solid Pick',         color: 'bg-green-100 text-green-700'     };
        if (r >= 3)  return { label: 'Cafeteria Classic',  color: 'bg-honey-100 text-honey-700'     };
        if (r >= 2)  return { label: 'Pack Snacks',        color: 'bg-orange-100 text-orange-700'   };
        return         { label: 'Needs Salt',         color: 'bg-red-100 text-red-700'         };
    };

    const getAvatarTone = (r) => {
        if (r >= 4) return 'from-emerald-400 to-emerald-600';
        if (r >= 3) return 'from-honey-400 to-honey-600';
        if (r >= 2) return 'from-orange-400 to-orange-600';
        if (r >= 1) return 'from-red-400 to-red-600';
        return 'from-brand-400 to-brand-600';
    };

    return (
        <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
            <Header />

            <div className="relative overflow-hidden border-b border-cream-300/60 bg-gradient-to-b from-cream-200/40 to-cream-100">
                <div className="absolute top-0 right-0 -z-10 w-[420px] h-[420px] bg-brand-200/30 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4" aria-hidden="true" />
                <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-10">
                    <div className="animate-fade-up">
                        <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-3">
                            <MessageSquare className="w-3 h-3" />
                            {isAllTime ? 'All Reviews' : 'Live Feed'}
                        </div>
                        <h1 className="font-display text-[36px] sm:text-[44px] font-semibold text-ink-900 tracking-tight leading-tight">
                            Recent reviews
                        </h1>
                        <div className="flex items-center gap-1.5 mt-2 text-ink-600">
                            <Clock className="w-3.5 h-3.5 text-ink-400" />
                            <p className="text-[14px]">
                                {loading ? 'Loading…' : isAllTime
                                    ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''} all-time`
                                    : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} in the past 30 days`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-9 h-9 text-brand-500 animate-spin mb-3" />
                        <div className="text-ink-500 text-sm font-medium">Loading reviews…</div>
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="flex flex-col gap-3 animate-fade-up-delay">
                        {reviews.map(review => {
                            const badge = getBadge(review.rating);
                            return (
                                <article
                                    key={review.id}
                                    className="bg-cream-50 rounded-2xl border border-cream-300/70 p-5 transition-all duration-200 hover:shadow-warm-md hover:border-brand-200"
                                >
                                    <div className="flex flex-col mb-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <Link
                                                href={`/hospital/${review.hospital_id}`}
                                                className="font-display text-[17px] font-semibold text-ink-900 hover:text-brand-700 transition-colors leading-snug"
                                            >
                                                {review.hospital_name}
                                            </Link>
                                            {review.date && (
                                                <span className="text-[11px] text-ink-400 font-medium whitespace-nowrap shrink-0 mt-1">{review.date}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            {renderStars(review.rating)}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge.color}`}>
                                                {badge.label}
                                            </span>
                                        </div>
                                    </div>

                                    {review.comment ? (
                                        <p className="text-ink-800 text-[14px] leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                    ) : (
                                        <p className="text-ink-300 italic text-sm">No comment provided.</p>
                                    )}

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
                                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${getAvatarTone(review.rating)} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                                            {(review.name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-ink-800 text-[13.5px]">{review.name || 'Anonymous'}</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-cream-50 rounded-3xl border border-cream-300/70 shadow-warm-sm animate-fade-up-delay">
                        <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-3">
                            <Utensils className="w-6 h-6 text-ink-400" />
                        </div>
                        <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">No reviews yet</h3>
                        <p className="text-ink-500 text-sm mb-5">Someone has to take the first bite.</p>
                        <Link
                            href="/search"
                            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all inline-flex items-center gap-2 active:scale-95 shadow-warm"
                        >
                            Be the first
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
