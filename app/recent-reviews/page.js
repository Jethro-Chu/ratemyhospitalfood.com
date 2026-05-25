'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { getHospitals } from '@/lib/actions';
import { Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function RecentReviews() {
    const [reviews, setReviews] = useState([]);
    
    useEffect(() => {
        async function loadReviews() {
            try {
                const data = await getHospitals() || [];
                
                // Extract all reviews and add hospital info to each
                let allReviews = [];
                data.forEach(hospital => {
                    if (hospital.reviews && hospital.reviews.length > 0) {
                        hospital.reviews.forEach(review => {
                            allReviews.push({
                                ...review,
                                hospitalId: hospital.id,
                                hospitalName: hospital.name,
                                timestamp: review.created_at ? new Date(review.created_at).getTime() : (parseInt(review.id) || 0)
                            });
                        });
                    }
                });
                
                // Sort by timestamp descending
                allReviews.sort((a, b) => b.timestamp - a.timestamp);
                setReviews(allReviews);
            } catch (err) {
                console.error("Failed to load", err);
            }
        }
        loadReviews();
    }, []);
    
    const renderStars = (rating) => {
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} 
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#FFF7ED] font-sans flex flex-col antialiased">
            <Header />
            <main className="flex-grow container mx-auto px-4 md:px-6 pt-28 pb-16 max-w-4xl fade-in-up">
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Live Feed</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-zinc-800 tracking-tight">
                      Recent Reviews
                    </h1>
                    <p className="text-zinc-500 text-base mt-2">
                      See what people are saying about hospital food right now.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-2xl border border-orange-100 shadow-[0_2px_8px_rgba(234,88,12,0.04)] p-5 md:p-6 hover:shadow-md transition-shadow duration-200">
                            {/* Top Row: Hospital & Stars */}
                            <div className="flex flex-col mb-3">
                                <Link href={`/hospital/${review.hospitalId}`} className="font-bold text-lg text-zinc-800 hover:text-orange-600 transition-colors inline-block mb-1">
                                    {review.hospitalName}
                                </Link>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-0.5">
                                        {renderStars(review.rating)}
                                    </div>
                                    <span className="text-xs font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-md border border-zinc-100">
                                        {Number(review.rating).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Main Comment */}
                            {review.comment ? (
                                <p className="text-zinc-700 text-[15px] leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                            ) : (
                                <p className="text-zinc-400 italic text-sm">No comment provided.</p>
                            )}

                            {/* Image */}
                            {review.image_url && (
                                <div className="mt-3.5">
                                    <a href={review.image_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
                                        <img
                                            src={review.image_url}
                                            alt="Food photo"
                                            className="rounded-xl border border-orange-100/50 max-h-48 max-w-[280px] sm:max-w-[320px] w-auto object-cover hover:opacity-90 transition-opacity duration-200 shadow-sm"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </a>
                                </div>
                            )}

                            {/* Bottom Row: Avatar, Name, Date */}
                            <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-2 text-sm">
                                <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 text-[11px] font-bold shrink-0 border border-orange-100">
                                    {(review.name || 'A').charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-zinc-700">{review.name || 'Anonymous'}</span>
                                <span className="text-zinc-300 mx-0.5">&middot;</span>
                                <span className="text-zinc-500 text-[13px]">{review.date}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-white rounded-2xl border border-orange-100 shadow-sm text-zinc-500">
                            No reviews have been posted yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
