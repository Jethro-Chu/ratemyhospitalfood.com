import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';

export default function HospitalCard({ hospital }) {
    const rating = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);

    const renderStars = () => {
        const stars = [];
        const rounded = Math.round(rating);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
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
            <div className="h-full bg-white rounded-2xl border border-zinc-100 hover:border-zinc-200 hover:shadow-lg hover:shadow-zinc-100/80 transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden">
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex items-center gap-0.5">
                            {renderStars()}
                        </div>
                        {rating > 0 && (
                            <span className="text-sm font-bold text-zinc-700 ml-0.5">
                                {rating.toFixed(1)}
                            </span>
                        )}
                        <span className="text-[11px] text-zinc-400 font-medium ml-auto">
                            {numRatings} {numRatings === 1 ? 'review' : 'reviews'}
                        </span>
                    </div>

                    <h3 className="text-base font-semibold text-zinc-900 leading-snug group-hover:text-brand-600 transition-colors mb-1">
                        {hospital.name}
                    </h3>

                    <p className="text-zinc-400 text-[13px] flex items-center gap-1 mb-3 flex-grow">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="line-clamp-1">{hospital.location}</span>
                    </p>

                    {hospital.reviewSnippet && (
                        <div className="mb-3 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
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

                <div className="px-5 py-2.5 border-t border-zinc-50 bg-zinc-50/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-brand-600">View details</span>
                    <svg className="w-3.5 h-3.5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </div>
            </div>
        </Link>
    );
}
