import Link from 'next/link';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';

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
                            : 'text-cream-400 fill-cream-400'
                    }`}
                />
            );
        }
        return stars;
    };

    return (
        <Link
            href={`/hospital/${hospital.id}`}
            className="block h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 rounded-3xl"
        >
            <article className="relative h-full bg-cream-50 rounded-3xl border border-ink-900/10 group-hover:border-brand-500/50 shadow-warm-sm group-hover:shadow-glow transition-all duration-300 group-hover:-translate-y-1 flex flex-col overflow-hidden">

                {/* Ember sheen on hover */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse 80% 60% at 80% 0%, rgba(255,90,31,0.10) 0%, rgba(255,90,31,0) 60%)' }}
                    aria-hidden="true"
                />

                <div className="relative p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between gap-3 mb-5">
                        <div className={`inline-flex items-center justify-center min-w-[56px] h-14 px-3 py-2 rounded-2xl ring-1 ${tone.chip} font-mono font-bold text-2xl leading-none`}>
                            {rating > 0 ? rating.toFixed(1) : '—'}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-0.5" aria-label={`${rating} stars`}>
                                {renderStars()}
                            </div>
                            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-400">
                                {numRatings === 0 ? 'No reviews yet' : `${numRatings} ${numRatings === 1 ? 'review' : 'reviews'}`}
                            </span>
                        </div>
                    </div>

                    <h3 className="font-display text-[19px] font-bold tracking-tight text-ink-900 leading-snug group-hover:text-brand-600 transition-colors mb-2">
                        {hospital.name}
                    </h3>

                    <p className="text-ink-500 text-[13px] flex items-center gap-1.5 mb-4">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-500" />
                        <span className="line-clamp-1">{hospital.location}</span>
                    </p>

                    {hospital.reviewSnippet && (
                        <div className="mb-4 bg-cream-100 rounded-2xl px-4 py-3 border border-ink-900/5 flex-grow">
                            <p className="text-ink-600 text-[13px] line-clamp-2 leading-relaxed">
                                &ldquo;{hospital.reviewSnippet}&rdquo;
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2">
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${rating > 0 ? 'text-brand-500' : 'text-ink-400'}`}>
                            {tone.label}
                        </span>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-ink-900/15 text-ink-500 group-hover:bg-brand-500 group-hover:text-cream-100 group-hover:border-brand-500 transition-all">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
