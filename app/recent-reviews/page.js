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
        <section className="border-b border-white/10 bg-ink-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="animate-fade-up max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-300">
                Live review feed
              </p>
              <h1 className="mt-3 font-display font-extrabold tracking-tight text-white text-4xl sm:text-5xl leading-[1.05]">
                The newest tray reports.
              </h1>
              <p className="mt-4 text-cream-300 text-[15px] sm:text-base leading-relaxed max-w-xl">
                All {pluralize(total, 'review')}, newest first — straight from patients,
                staff, and visitors.
              </p>
            </div>
          </div>
        </section>

        {/* Feed */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
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
