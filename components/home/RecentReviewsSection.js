import { getReviewsFeed } from '@/lib/actions';
import ReviewCard from '@/components/ReviewCard';
import Reveal from '@/components/Reveal';
import SectionHeader from './SectionHeader';

export default async function RecentReviewsSection() {
  const { reviews } = await getReviewsFeed({ limit: 6 });
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="border-y border-ink-900/10 bg-white py-12 sm:py-16" aria-labelledby="recent-reviews-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          id="recent-reviews-heading"
          eyebrow="Latest reports"
          title="What people are eating right now."
          sub="The newest ratings, photos, and notes from hospital dining rooms."
          linkHref="/recent-reviews"
          linkLabel="See all reviews"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={Math.min(i * 60, 300)}>
              <ReviewCard review={review} showHospital className="h-full" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
