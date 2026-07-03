import Link from 'next/link';
import Marquee from '@/components/Marquee';

const MARQUEE_ITEMS = [
  'Rate the jello',
  'Defend the meatloaf',
  'Praise the soup',
  'Snap a tray pic',
  'Help a hungry visitor',
  'No login needed',
];

export default function AddReviewCTA() {
  return (
    <section className="py-14 sm:py-20" aria-labelledby="add-review-heading">
      <Marquee
        items={MARQUEE_ITEMS}
        slow
        className="mb-10 font-display font-bold text-2xl sm:text-3xl text-ink-900/10"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-brand-600 text-cream-50 shadow-warm-xl">
          <div
            className="absolute -top-20 -right-20 w-72 h-72 bg-cream-50/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-16 w-80 h-80 bg-ink-900/10 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative px-6 sm:px-16 py-14 sm:py-20 text-center flex flex-col items-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cream-100/80">( Your turn )</p>
            <h2
              id="add-review-heading"
              className="mt-4 font-display font-bold tracking-tight text-3xl sm:text-5xl leading-tight max-w-2xl"
            >
              Eaten hospital food lately?
            </h2>
            <p className="mt-4 text-cream-100/90 text-[15px] sm:text-base max-w-lg leading-relaxed">
              Thirty seconds of your opinion helps the next person choose between the cafeteria
              and the vending machine.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/search?intent=review"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cream-50 hover:bg-cream-100 text-brand-600 font-semibold text-[14px] py-3 px-7 rounded-full transition-all duration-150 active:scale-[0.97] shadow-warm-md"
              >
                Rate a hospital
              </Link>
              <Link
                href="/add"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-cream-50/40 hover:border-cream-50 text-cream-50 font-semibold text-[14px] py-3 px-7 rounded-full transition-all duration-150 active:scale-[0.97]"
              >
                Add a hospital
              </Link>
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-cream-100/70">
              Free · No login · Under a minute
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
