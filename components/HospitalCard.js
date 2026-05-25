import Link from 'next/link';
import { Star, MapPin, ArrowRight } from 'lucide-react';

export default function HospitalCard({ hospital }) {
    const rating = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);

    // Rating label & colors
    let ratingLabel = 'New';
    let ratingBg = 'bg-slate-50 text-slate-500 border-slate-200';
    
    if (rating > 0) {
        if (rating >= 4) {
            ratingLabel = 'Excellent';
            ratingBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        } else if (rating >= 2.5) {
            ratingLabel = 'Average';
            ratingBg = 'bg-amber-50 text-amber-700 border-amber-200';
        } else {
            ratingLabel = 'Poor';
            ratingBg = 'bg-rose-50 text-rose-700 border-rose-200';
        }
    }

    // Render star row
    const renderStars = () => {
        const stars = [];
        const roundedRating = Math.round(rating);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-4 h-4 ${
                        i <= roundedRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-200'
                    }`}
                />
            );
        }
        return stars;
    };

    return (
        <Link href={`/hospital/${hospital.id}`} className="block h-full group">
            <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-[0_1px_4px_rgba(15,23,42,0.05)] card-hover flex flex-col overflow-hidden">
                {/* Card content */}
                <div className="p-5 md:p-6 flex flex-col flex-grow">
                    {/* Stars + Rating number row */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">
                            {renderStars()}
                        </div>
                        {rating > 0 && (
                            <span className="text-sm font-bold text-slate-700">
                                {rating.toFixed(1)}
                            </span>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">
                            {numRatings} {numRatings === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>

                    {/* Hospital name */}
                    <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors duration-200 mb-1.5">
                        {hospital.name}
                    </h3>
                    
                    {/* Location */}
                    <p className="text-slate-500 text-sm flex items-center gap-1.5 mb-4 flex-grow">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{hospital.location}</span>
                    </p>

                    {/* Review snippet */}
                    {hospital.reviewSnippet && (
                        <div className="mb-4 pl-3 border-l-2 border-amber-300 bg-amber-50/40 rounded-r-lg py-2 pr-3">
                            <p className="text-slate-600 text-xs italic line-clamp-2 leading-relaxed">
                                {hospital.reviewSnippet}
                            </p>
                        </div>
                    )}

                    {/* Tags */}
                    {hospital.tags && hospital.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-auto pt-1">
                            {hospital.tags.slice(0, 3).map(tag => (
                                <span 
                                    key={tag} 
                                    className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-100"
                                >
                                    {tag}
                                </span>
                            ))}
                            {hospital.tags.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400 px-1 py-0.5">
                                    +{hospital.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom hover bar */}
                <div className="px-5 md:px-6 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-xs font-semibold text-blue-600">View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                </div>
            </div>
        </Link>
    );
}