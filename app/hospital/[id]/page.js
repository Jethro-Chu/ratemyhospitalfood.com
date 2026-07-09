'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RatingModal from '@/components/RatingModal';
import RatingStars from '@/components/RatingStars';
import ReviewCard from '@/components/ReviewCard';
import EmptyState from '@/components/EmptyState';
import Reveal from '@/components/Reveal';
import { Shimmer, ReviewCardSkeleton } from '@/components/Skeletons';
import { getHospitalById } from '@/lib/actions';
import { getRatingTone } from '@/lib/ratingTone';
import { pluralize, firstNameOf } from '@/lib/format';
import { ArrowLeft, Globe, MapPin, PenLine } from 'lucide-react';

const MAX_STRIP_PHOTOS = 10;

export default function HospitalDetail({ params }) {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('review') === 'true') {
      setIsModalOpen(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    async function loadHospital() {
      try {
        const data = await getHospitalById(params.id);
        if (data) setHospital(data);
        else setNotFound(true);
      } catch (error) {
        console.error('Failed to load hospital:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadHospital();
    else { setNotFound(true); setLoading(false); }
  }, [params.id]);

  async function handleCloseInternal() {
    setIsModalOpen(false);
    const updated = await getHospitalById(params.id);
    if (updated) setHospital(updated);
  }

  function scrollToReview(reviewId) {
    document.getElementById(`review-${reviewId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (loading) return <LoadingState />;

  if (notFound || !hospital) {
    return (
      <div className="flex min-h-screen flex-col bg-cream-100">
        <Header />
        <main className="flex flex-grow items-center justify-center px-4 py-16">
          <EmptyState emoji="🏥" title="Hospital not found" message="The listing may have moved or the link is incorrect." actionHref="/search" actionLabel="Search hospitals" secondaryHref="/add" secondaryLabel="Add a hospital" className="w-full max-w-xl" />
        </main>
        <Footer />
      </div>
    );
  }

  const rating = Number(hospital.rating || 0);
  const numRatings = Number(hospital.numRatings || 0);
  const reviews = hospital.reviews || [];
  const tone = getRatingTone(rating);
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => Math.round(Number(review.rating) || 0) === star).length;
    return { star, count, pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });
  const photos = reviews.filter((review) => review.image_url).slice(0, MAX_STRIP_PHOTOS);

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Header />
      <RatingModal isOpen={isModalOpen} onClose={handleCloseInternal} hospitalId={hospital.id} hospitalName={hospital.name} />

      <main className="flex-grow pb-24 md:pb-0">
        <section className="border-b border-white/10 bg-ink-900 text-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
            <Link href="/search" className="inline-flex items-center gap-2 text-xs font-semibold text-cream-400 transition-colors hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5" /> Hospital directory
            </Link>
            <div className="mt-7 grid gap-8 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-300">Hospital cafeteria</p>
                <h1 className="mt-3 max-w-4xl font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl">{hospital.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-cream-300">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-honey-300" />{hospital.location}</span>
                  {hospital.website && <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-brand-300 hover:text-brand-200"><Globe className="h-4 w-4" />Visit website</a>}
                </div>
              </div>

              <div className="border-t border-white/15 pt-6 md:col-span-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex items-end gap-4">
                  <span className="font-display text-6xl font-extrabold leading-none text-white">{rating > 0 ? rating.toFixed(1) : '—'}</span>
                  <div className="pb-1">
                    <RatingStars rating={rating} size={18} />
                    <span className={`mt-2 inline-flex rounded-sm px-2 py-1 text-[10px] font-bold ${tone.chip}`}>{tone.emoji} {tone.label}</span>
                  </div>
                </div>
                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.16em] text-cream-500">{pluralize(numRatings, 'published review')}</p>
              </div>
            </div>
          </div>
        </section>

        {photos.length > 0 && (
          <section className="border-b border-ink-900/10 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
              <div className="flex items-end justify-between gap-4">
                <div><p className="section-kicker">Photo evidence</p><h2 className="mt-2 font-display text-xl font-extrabold text-ink-900">From recent trays</h2></div>
                <p className="hidden text-xs text-ink-400 sm:block">Select a photo to open its review</p>
              </div>
              <div className="no-scrollbar -mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                {photos.map((review) => (
                  <button key={review.id} type="button" onClick={() => scrollToReview(review.id)} className="relative h-28 w-40 shrink-0 snap-start overflow-hidden rounded-md border border-ink-900/10 transition-opacity hover:opacity-85" aria-label={`Jump to ${firstNameOf(review.name)}'s review`}>
                    <Image src={review.image_url} alt={`Food photo from ${firstNameOf(review.name)}'s review`} fill sizes="160px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <div className="flex items-end justify-between border-t border-ink-900/15 pt-4">
              <div><p className="section-kicker">Community reports</p><h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900">Reviews <span className="text-ink-300">{numRatings}</span></h2></div>
            </div>
            <div className="mt-7 space-y-4">
              {reviews.length ? reviews.map((review, index) => (
                <div key={review.id || index} id={`review-${review.id}`}>
                  <Reveal delay={Math.min(index * 35, 240)}><ReviewCard review={review} /></Reveal>
                </div>
              )) : (
                <EmptyState emoji="🍽️" title="No tray reports yet" message="This cafeteria is waiting for its first community rating." actionHref={`/hospital/${hospital.id}?review=true`} actionLabel="Write the first review" />
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-lg border border-ink-900/12 bg-white p-5 shadow-warm-sm lg:sticky lg:top-24">
              <p className="section-kicker">Score distribution</p>
              <div className="mt-5 space-y-3" aria-label="Rating distribution">
                {distribution.map(({ star, count, pct }) => (
                  <div key={star} className="grid grid-cols-[28px_1fr_24px] items-center gap-3">
                    <span className="font-mono text-[10px] text-ink-500">{star}★</span>
                    <div className="h-2 overflow-hidden bg-cream-200"><div className="h-full bg-honey-400 transition-all" style={{ width: `${pct}%` }} /></div>
                    <span className="text-right font-mono text-[10px] text-ink-400">{count}</span>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setIsModalOpen(true)} className="action-primary mt-6 w-full"><PenLine className="h-4 w-4" /> Rate this hospital</button>
              <p className="mt-3 text-center text-[11px] text-ink-400">No account required</p>
            </div>
          </aside>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-900/10 bg-white/95 p-3 backdrop-blur-xl md:hidden" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
        <button type="button" onClick={() => setIsModalOpen(true)} className="action-primary w-full"><PenLine className="h-4 w-4" /> Rate this hospital</button>
      </div>
      <Footer />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Header />
      <main className="flex-grow">
        <section className="bg-ink-900"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6"><Shimmer className="h-3 w-32" /><Shimmer className="mt-5 h-12 w-3/4 max-w-2xl" /><Shimmer className="mt-4 h-4 w-64" /></div></section>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12"><div className="space-y-4 lg:col-span-8"><ReviewCardSkeleton /><ReviewCardSkeleton /></div><div className="lg:col-span-4"><Shimmer className="h-64 w-full rounded-lg" /></div></section>
      </main>
      <Footer />
    </div>
  );
}
