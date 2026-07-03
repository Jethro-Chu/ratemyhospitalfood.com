'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';
import Reveal from '@/components/Reveal';
import { getReviewsFeed } from '@/lib/actions';

const PAGE_SIZE = 12;

export default function ReviewFeed({ initialReviews, total, initialHasMore }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [hasMore, setHasMore] = useState(!!initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState(false);

  async function loadMore() {
    if (loadingMore) return;
    setLoadingMore(true);
    setLoadError(false);
    try {
      const next = await getReviewsFeed({ limit: PAGE_SIZE, offset: reviews.length });
      setReviews((prev) => [...prev, ...(next.reviews || [])]);
      setHasMore(!!next.hasMore);
    } catch (err) {
      console.error('Failed to load more reviews:', err);
      setLoadError(true);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((review, i) => (
          <Reveal key={review.id} delay={i < PAGE_SIZE ? Math.min(i * 40, 300) : 0} className="h-full">
            <ReviewCard review={review} showHospital className="h-full" />
          </Reveal>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        {loadError && (
          <p role="alert" className="text-[13px] text-red-700">
            Couldn&apos;t load more — try again.
          </p>
        )}
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center justify-center gap-2 border border-ink-900/15 hover:border-brand-500 hover:text-brand-600 text-ink-700 font-semibold text-[14px] py-2.5 px-7 rounded-full transition-all duration-150 active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              <>Load more reviews ({total - reviews.length} left)</>
            )}
          </button>
        ) : (
          total > PAGE_SIZE && (
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400 inline-flex items-center gap-2">
              That&apos;s every review. Write the next one
              <Link
                href="/search?intent=review"
                className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold transition-colors"
              >
                here <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </p>
          )
        )}
      </div>
    </div>
  );
}
