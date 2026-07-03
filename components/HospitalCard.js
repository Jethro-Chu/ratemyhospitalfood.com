import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import RatingStars from './RatingStars';
import { getRatingTone } from '@/lib/ratingTone';
import { pluralize } from '@/lib/format';

/**
 * Hospital summary card. Whole card links to the hospital page via a
 * stretched link; the two footer buttons sit above it on their own layer.
 */
export default function HospitalCard({ hospital }) {
  const rating = Number(hospital.rating || 0);
  const numRatings = Number(hospital.numRatings || 0);
  const snippet = hospital.reviewSnippet ?? hospital.review_snippet ?? null;
  const photoUrl = hospital.photoUrl ?? hospital.photo_url ?? null;
  const tone = getRatingTone(rating);

  return (
    <article className="group relative h-full flex flex-col bg-cream-50 rounded-3xl border border-ink-900/10 hover:border-brand-500/40 shadow-warm-sm hover:shadow-warm-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/50 focus-within:ring-offset-2 focus-within:ring-offset-cream-100">
      {photoUrl && (
        <div className="relative h-36 shrink-0 overflow-hidden bg-cream-200">
          <Image
            src={photoUrl}
            alt={`Recent food photo from a review of ${hospital.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ink-900/20 to-transparent"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="flex flex-col flex-grow p-5 sm:p-6">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex items-center justify-center w-14 h-14 shrink-0 rounded-2xl ${tone.chip} font-mono font-bold text-xl leading-none`}
            aria-label={rating > 0 ? `Average rating ${rating.toFixed(1)} out of 5` : 'Not yet rated'}
          >
            {rating > 0 ? rating.toFixed(1) : '—'}
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="font-display text-[18px] font-bold tracking-tight text-ink-900 leading-snug group-hover:text-brand-600 transition-colors">
              <Link
                href={`/hospital/${hospital.id}`}
                className="focus:outline-none after:absolute after:inset-0 after:content-['']"
              >
                {hospital.name}
              </Link>
            </h3>
            <p className="mt-1 text-ink-500 text-[13px] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              <span className="line-clamp-1">{hospital.location}</span>
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <RatingStars rating={rating} size={14} />
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-400">
            {numRatings === 0 ? 'No reviews yet' : pluralize(numRatings, 'review')}
          </span>
        </div>

        <div className="flex-grow">
          {snippet && (
            <div className="mt-3.5 bg-cream-100 rounded-2xl px-4 py-3 border border-ink-900/5">
              <p className="text-ink-600 text-[13px] line-clamp-2 leading-relaxed">&ldquo;{snippet}&rdquo;</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone.chip}`}>
            <span aria-hidden="true">{tone.emoji}</span> {tone.label}
          </span>
        </div>

        <div className="relative z-10 mt-4 pt-4 border-t border-ink-900/5 grid grid-cols-2 gap-2">
          <Link
            href={`/hospital/${hospital.id}`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-ink-900/15 hover:border-brand-500 hover:text-brand-600 text-ink-700 text-[13px] font-semibold py-2 px-3 transition-all duration-150 active:scale-[0.97]"
          >
            View reviews
          </Link>
          <Link
            href={`/hospital/${hospital.id}?review=true`}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-brand-500 hover:bg-brand-600 text-cream-50 text-[13px] font-semibold py-2 px-3 transition-all duration-150 active:scale-[0.97] shadow-warm-sm"
          >
            Rate this hospital
          </Link>
        </div>
      </div>
    </article>
  );
}
