import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EmptyState from '@/components/EmptyState';
import ReviewFeed from './ReviewFeed';
import { getReviewsFeed } from '@/lib/actions';
import { pluralize } from '@/lib/format';

export const revalidate = 120;

export default async function RecentReviewsPage() {
  const { reviews, total, hasMore } = await getReviewsFeed({ limit: 12 });

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Page header */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-24 right-[-10%] w-[420px] h-[420px] bg-brand-500/10 blur-3xl rounded-full"
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-12">
            <div className="animate-fade-up max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-500">
                ( Fresh takes )
              </p>
              <h1 className="mt-3 font-display font-bold tracking-tight text-ink-900 text-4xl sm:text-5xl leading-[1.05]">
                Hot off the <span className="gradient-text">tray line</span>.
              </h1>
              <p className="mt-4 text-ink-700 text-[15px] sm:text-base leading-relaxed max-w-xl">
                All {pluralize(total, 'review')}, newest first — straight from patients,
                staff, and visitors.
              </p>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-14 sm:pb-20">
          {total === 0 ? (
            <EmptyState
              emoji="📝"
              title="No reviews yet"
              message="Someone has to take the first bite."
              actionHref="/search"
              actionLabel="Find your hospital"
              className="max-w-xl mx-auto"
            />
          ) : (
            <ReviewFeed initialReviews={reviews} total={total} initialHasMore={hasMore} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
