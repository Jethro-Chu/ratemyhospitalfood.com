'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X } from 'lucide-react';
import RatingStars from './RatingStars';
import { getRatingTone } from '@/lib/ratingTone';
import { timeAgo, firstNameOf } from '@/lib/format';
import { getReactionState, setReactionState } from '@/lib/reactions';

const LONG_COMMENT = 220;

/**
 * The one review card used everywhere (homepage, feed, hospital page).
 * Tolerates both snake_case rows and camelCase action results.
 */
export default function ReviewCard({ review, showHospital = false, className = '' }) {
  const id = review.id;
  const rating = Number(review.rating) || 0;
  const reviewer = firstNameOf(review.name ?? review.reviewerName);
  const comment = (review.comment || '').trim();
  const imageUrl = review.imageUrl ?? review.image_url ?? null;
  const createdAt = review.createdAt ?? review.created_at ?? null;
  const when = timeAgo(createdAt) ?? review.date ?? null;
  const hospitalId = review.hospitalId ?? review.hospital_id ?? null;
  const hospitalName = review.hospitalName ?? review.hospital_name ?? null;
  const tone = getRatingTone(rating);

  const [counts, setCounts] = useState(() => ({
    helpful: Number(review.helpfulCount ?? review.helpful_count ?? 0),
    funny: Number(review.funnyCount ?? review.funny_count ?? 0),
  }));
  const [mine, setMine] = useState({ helpful: false, funny: false });
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const pending = useRef({});

  // Read the per-device vote memory after mount to avoid hydration mismatch.
  useEffect(() => {
    if (id) setMine(getReactionState(id));
  }, [id]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === 'Escape' && setLightbox(false);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  async function react(type) {
    if (!id || pending.current[type]) return;
    pending.current[type] = true;
    const removing = mine[type];
    const delta = removing ? -1 : 1;

    setMine((m) => ({ ...m, [type]: !removing }));
    setCounts((c) => ({ ...c, [type]: Math.max(0, c[type] + delta) }));
    setReactionState(id, type, !removing);

    try {
      const res = await fetch('/api/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id, type, delta }),
      });
      if (!res.ok) throw new Error('reaction failed');
      const data = await res.json();
      setCounts({ helpful: data.helpfulCount, funny: data.funnyCount });
    } catch {
      setMine((m) => ({ ...m, [type]: removing }));
      setCounts((c) => ({ ...c, [type]: Math.max(0, c[type] - delta) }));
      setReactionState(id, type, removing);
    } finally {
      pending.current[type] = false;
    }
  }

  return (
    <article
      className={`flex flex-col rounded-lg bg-white border border-ink-900/10 p-5 shadow-warm-sm hover:border-brand-500/30 hover:shadow-warm-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink-900 font-display font-bold uppercase text-white"
          aria-hidden="true"
        >
          {reviewer.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-[15px] text-ink-900 leading-tight truncate">{reviewer}</p>
          <p className="text-[12px] text-ink-500 mt-0.5 truncate">
            {when}
            {showHospital && hospitalName && hospitalId && (
              <>
                {when && ' · '}
                <Link
                  href={`/hospital/${hospitalId}`}
                  className="font-medium text-ink-600 hover:text-brand-600 underline decoration-ink-300 underline-offset-2 transition-colors"
                >
                  {hospitalName}
                </Link>
              </>
            )}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-sm px-2.5 py-1 text-[10px] font-bold ${tone.chip}`}
        >
          <span aria-hidden="true">{tone.emoji}</span> {tone.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <RatingStars rating={rating} size={15} />
        <span className="font-mono text-[11px] text-ink-400">{rating.toFixed(1)}</span>
      </div>

      {comment ? (
        <div className="mt-3">
          <p className={`text-[14px] leading-relaxed text-ink-700 whitespace-pre-wrap ${expanded ? '' : 'line-clamp-5'}`}>
            {comment}
          </p>
          {comment.length > LONG_COMMENT && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[14px] italic text-ink-400">Left a rating without a note.</p>
      )}

      {imageUrl && (
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="group/photo relative mt-4 block w-full overflow-hidden rounded-md border border-ink-900/10 aspect-[16/10]"
          aria-label={`Enlarge food photo from ${reviewer}'s review`}
        >
          <Image
            src={imageUrl}
            alt={`Food photo from ${reviewer}'s review`}
            fill
            sizes="(max-width: 640px) 100vw, 420px"
            className="object-cover transition-transform duration-500 group-hover/photo:scale-[1.04]"
          />
          <span className="absolute bottom-2 right-2 rounded-sm bg-ink-900/75 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white opacity-0 transition-opacity group-hover/photo:opacity-100">
            Enlarge
          </span>
        </button>
      )}

      <div className="mt-auto pt-4 flex items-center gap-2">
        <ReactionButton
          active={mine.helpful}
          count={counts.helpful}
          onClick={() => react('helpful')}
          emoji="👍"
          label="Helpful"
        />
        <ReactionButton
          active={mine.funny}
          count={counts.funny}
          onClick={() => react('funny')}
          emoji="😄"
          label="Funny"
        />
      </div>

      {lightbox && imageUrl && (
        <div
          className="fixed inset-0 z-[100] bg-ink-900/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-pop"
          role="dialog"
          aria-modal="true"
          aria-label="Food photo"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-cream-50/10 hover:bg-cream-50/25 text-cream-50 flex items-center justify-center transition-colors"
            aria-label="Close photo"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Food photo from ${reviewer}'s review`}
            className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-warm-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </article>
  );
}

function ReactionButton({ active, count, onClick, emoji, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition-all duration-150 active:scale-95 ${
        active
          ? 'border-brand-300 bg-brand-50 text-brand-700 shadow-warm-sm'
          : 'border-ink-900/10 bg-cream-50 text-ink-600 hover:border-ink-900/25 hover:text-ink-900'
      }`}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
      {count > 0 && (
        <span className={`font-mono text-[11px] ${active ? 'text-brand-600' : 'text-ink-400'}`}>{count}</span>
      )}
    </button>
  );
}
