import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin, PenLine } from 'lucide-react';
import RatingStars from './RatingStars';
import { getRatingTone } from '@/lib/ratingTone';
import { pluralize } from '@/lib/format';

export default function HospitalCard({ hospital, rank }) {
  const rating = Number(hospital.rating || 0);
  const numRatings = Number(hospital.numRatings || 0);
  const snippet = hospital.reviewSnippet ?? hospital.review_snippet ?? null;
  const photoUrl = hospital.photoUrl ?? hospital.photo_url ?? null;
  const tone = getRatingTone(rating);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-ink-900/12 bg-white shadow-warm-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-500/50 hover:shadow-warm-md">
      {photoUrl && (
        <Link href={`/hospital/${hospital.id}`} className="relative block h-40 overflow-hidden bg-cream-200">
          <Image
            src={photoUrl}
            alt={`Recent food photo from ${hospital.name}`}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-ink-900/35 to-transparent" aria-hidden="true" />
        </Link>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {rank && <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-brand-600">Rank {String(rank).padStart(2, '0')}</p>}
            <h3 className={`${rank ? 'mt-2' : ''} font-display text-[19px] font-extrabold leading-snug tracking-tight text-ink-900`}>
              <Link href={`/hospital/${hospital.id}`} className="transition-colors hover:text-brand-600">{hospital.name}</Link>
            </h3>
            <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-500" aria-hidden="true" />
              <span className="line-clamp-1">{hospital.location}</span>
            </p>
          </div>
          <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-md ${tone.chip}`}>
            <span className="font-display text-xl font-extrabold leading-none">{rating > 0 ? rating.toFixed(1) : '—'}</span>
            <span className="mt-1 font-mono text-[8px] uppercase tracking-wider">/ 5</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-y border-ink-900/8 py-3">
          <RatingStars rating={rating} size={14} />
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-400">
            {numRatings === 0 ? 'Unrated' : pluralize(numRatings, 'review')}
          </span>
          <span className={`ml-auto rounded-sm px-2 py-1 text-[10px] font-bold ${tone.chip}`}>{tone.label}</span>
        </div>

        <div className="min-h-[64px] flex-1 py-4">
          {snippet ? (
            <p className="line-clamp-3 text-[13px] leading-5 text-ink-600">“{snippet}”</p>
          ) : (
            <p className="text-[13px] leading-5 text-ink-400">No written report yet. The first tray review is still up for grabs.</p>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-ink-900/8 pt-4">
          <Link href={`/hospital/${hospital.id}`} className="action-secondary px-4 py-2.5">
            View details <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href={`/hospital/${hospital.id}?review=true`} title="Rate this hospital" aria-label={`Rate ${hospital.name}`} className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500 text-white transition-colors hover:bg-brand-600">
            <PenLine className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
