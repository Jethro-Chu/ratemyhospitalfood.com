import { getPopularReviews } from '@/lib/actions';
import ReviewCard from '@/components/ReviewCard';
import Reveal from '@/components/Reveal';
import SectionHeader from './SectionHeader';

export default async function PopularReviewsSection() {
  const reviews = await getPopularReviews(3);
  if (!reviews || reviews.length < 3) return null;

  return (
    <section
      className="py-14 sm:py-20 bg-cream-200/40 border-y border-ink-900/5"
      aria-labelledby="popular-reviews-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          id="popular-reviews-heading"
          eyebrow="( Crowd favorites )"
          title={
            <>
              Reviews people keep <span className="gradient-text">talking about</span>.
            </>
          }
          sub="The takes readers found the most helpful — or the funniest."
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
