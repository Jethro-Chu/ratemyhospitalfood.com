import { getPopularReviews } from '@/lib/actions';
import ReviewCard from '@/components/ReviewCard';
import Reveal from '@/components/Reveal';
import SectionHeader from './SectionHeader';

export default async function PopularReviewsSection() {
  const reviews = await getPopularReviews(3);
  if (!reviews || reviews.length < 3) return null;

  return (
    <section
      className="bg-cream-200/70 py-12 sm:py-16"
      aria-labelledby="popular-reviews-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          id="popular-reviews-heading"
          eyebrow="Community picks"
          title="The reviews moving the conversation."
          sub="The reports readers marked most helpful or funniest."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
