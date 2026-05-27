import Link from 'next/link';
import { Star, MapPin, ArrowRight } from 'lucide-react';

function getRatingTone(rating) {
    if (rating >= 4.5) return { chip: 'bg-emerald-100 text-emerald-700 ring-emerald-200', label: 'Shockingly good' };
    if (rating >= 4)   return { chip: 'bg-green-100 text-green-700 ring-green-200',       label: 'Would eat again' };
    if (rating >= 3)   return { chip: 'bg-honey-100 text-honey-700 ring-honey-200',       label: 'Did the job'     };
    if (rating >= 2)   return { chip: 'bg-orange-100 text-orange-700 ring-orange-200',    label: 'Pack snacks'     };
    if (rating > 0)    return { chip: 'bg-red-100 text-red-700 ring-red-200',             label: 'Pray first'      };
    return                    { chip: 'bg-cream-200 text-ink-500 ring-cream-300',         label: 'Not yet rated'   };
}

export default function HospitalCard({ hospital }) {
    const rating     = Number(hospital.rating || 0);
    const numRatings = Number(hospital.numRatings || 0);
    const tone       = getRatingTone(rating);

    const renderStars = () => {
        const stars = [];
        const rounded = Math.round(rating);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                        i <= rounded
                            ? 'text-honey-400 fill-honey-400'
                            : 'text-cream-300 fill-cream-300'
                    }`}
                />
            );
        }
        return stars;
    };

    return (
        <Link
            href={`/hospital/${hospital.id}`}
            className="block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 rounded-2xl"
        >
            <article className="h-full bg-cream-50 rounded-2xl border border-cream-300/70 hover:border-brand-200 shadow-warm-sm hover:shadow-warm-md transition-all duration-200 hover:-translate-y-1 flex flex-col overflow-hidden">

                {/* Top row – big rating chip + meta */}
                <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div className={`inline-flex items-center justify-center min-w-[52px] h-13 px-3 py-2 rounded-xl ring-1 ${tone.chip} font-display font-semibold text-2xl leading-none`}>
                            {rating > 0 ? rating.toFixed(1) : '—'}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
                                {renderStars()}
                            </div>
                            <span className="text-[11px] text-ink-400 font-medium">
                                {numRatings === 0 ? 'No reviews yet' : `${numRatings} ${numRatings === 1 ? 'review' : 'reviews'}`}
                            </span>
                        </div>
                    </div>

                    <h3 className="font-display text-[18px] font-semibold text-ink-900 leading-snug group-hover:text-brand-700 transition-colors mb-1.5">
                        {hospital.name}
                    </h3>

                    <p className="text-ink-500 text-[13px] flex items-center gap-1.5 mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-ink-400" />
                        <span className="line-clamp-1">{hospital.location}</span>
                    </p>

                    {hospital.reviewSnippet && (
                        <div className="mb-3 bg-cream-100 rounded-xl px-3.5 py-2.5 border border-cream-300/70 flex-grow">
                            <p className="text-ink-600 text-[13px] italic line-clamp-2 leading-relaxed">
                                &ldquo;{hospital.reviewSnippet}&rdquo;
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${rating > 0 ? 'text-brand-600' : 'text-ink-400'}`}>
                            {tone.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ink-500 group-hover:text-brand-600 group-hover:gap-2 transition-all">
                            View
                            <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
