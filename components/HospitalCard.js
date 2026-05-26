import Link from 'next/link';
import { Star, MapPin, ArrowRight } from 'lucide-react';

function getRatingAccent(rating) {
    if (rating >= 4.5) return 'bg-emerald-500';
    if (rating >= 4)   return 'bg-green-400';
    if (rating >= 3)   return 'bg-amber-400';
    if (rating >= 2)   return 'bg-orange-400';
    return 'bg-red-400';
}

export default function HospitalCard({ hospital }) {
    const rating = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);
    const accentClass = getRatingAccent(rating);

    const renderStars = () => {
        const stars = [];
        const rounded = Math.round(rating);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-3 h-3 ${
                        i <= rounded
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-zinc-200 fill-zinc-200'
                    }`}
                />
            );
        }
        return stars;
    };

    return (
        <Link href={`/hospital/${hospital.id}`} className="block h-full group">
            <div className="h-full bg-white rounded-2xl border border-zinc-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/80 transition-all duration-250 hover:-translate-y-1 flex flex-col overflow-hidden">

                {/* Rating progress bar */}
                {rating > 0 && (
                    <div className="h-[3px] w-full bg-zinc-100 rounded-t-2xl overflow-hidden">
                        <div
                            className={`h-full ${accentClass} transition-all duration-500`}
                            style={{ width: `${(rating / 5) * 100}%` }}
                        />
                    </div>
                )}

                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center justify-between mb-3 gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                                {renderStars()}
                            </div>
                            {rating > 0 && (
                                <span className="text-[13px] font-bold text-zinc-800 ml-0.5">
                                    {rating.toFixed(1)}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">
                            {numRatings === 0 ? 'No reviews' : `${numRatings} ${numRatings === 1 ? 'review' : 'reviews'}`}
                        </span>
                    </div>

                    <h3 className="text-[15px] font-semibold text-zinc-900 leading-snug group-hover:text-brand-600 transition-colors duration-150 mb-1.5">
                        {hospital.name}
                    </h3>

                    <p className="text-zinc-400 text-[13px] flex items-center gap-1 mb-3 flex-grow">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="line-clamp-1">{hospital.location}</span>
                    </p>

                    {hospital.reviewSnippet && (
                        <div className="mb-3 bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100/80">
                            <p className="text-zinc-500 text-xs italic line-clamp-2 leading-relaxed">
                                &ldquo;{hospital.reviewSnippet}&rdquo;
                            </p>
                        </div>
                    )}

                    {hospital.tags && hospital.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-auto pt-1">
                            {hospital.tags.slice(0, 3).map(tag => (
                                <span
                                    key={tag}
                                    className="bg-brand-50 text-brand-600 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-5 py-3 border-t border-zinc-50 bg-zinc-50/60 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <span className="text-xs font-semibold text-brand-600">View details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-500 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
            </div>
        </Link>
    );
}
