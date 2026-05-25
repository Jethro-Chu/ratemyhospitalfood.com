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
                        <div key={review.id} className="bg-white rounded-2xl border border-orange-200/50 p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <Link href={`/hospital/${review.hospitalId}`} className="font-bold text-lg text-zinc-800 hover:text-orange-500 transition-colors">
                                        {review.hospitalName}
                                    </Link>
                                    <div className="flex items-center gap-2 mt-1">
                                        {renderStars(review.rating)}
                                        <span className="text-xs font-semibold text-zinc-400">• {review.date}</span>
                                    </div>
                                </div>
                                {review.name && (
                                    <div className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">
                                        {review.name}
                                    </div>
                                )}
                            </div>
                            {review.comment ? (
                                <p className="text-zinc-600 leading-relaxed">{review.comment}</p>
                            ) : (
                                <p className="text-zinc-400 italic">No comment provided.</p>
                            )}
                            {review.image_url && (
                                <div className="mt-3">
                                    <a href={review.image_url} target="_blank" rel="noopener noreferrer" className="block w-fit">
                                        <img
                                            src={review.image_url}
                                            alt="Food photo"
                                            className="rounded-xl border border-orange-100 max-h-48 max-w-[280px] w-auto object-cover hover:opacity-90 transition-opacity duration-200 shadow-sm"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </a>
                                </div>
                            )}
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
