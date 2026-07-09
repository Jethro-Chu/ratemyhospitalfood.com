import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileActionBar from '@/components/MobileActionBar';
import HomeHero from '@/components/home/HomeHero';
import TopRatedSection from '@/components/home/TopRatedSection';
import RecentReviewsSection from '@/components/home/RecentReviewsSection';
import PopularReviewsSection from '@/components/home/PopularReviewsSection';
import AddReviewCTA from '@/components/home/AddReviewCTA';
import { Shimmer, HospitalGridSkeleton, ReviewListSkeleton } from '@/components/Skeletons';

export const revalidate = 300;

function SectionSkeleton({ kind }) {
  return (
    <section className="py-14 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Shimmer className="h-3.5 w-32" />
        <Shimmer className="mt-4 h-9 w-72 max-w-full" />
        <Shimmer className="mt-4 h-4 w-96 max-w-full mb-10" />
        {kind === 'reviews' ? <ReviewListSkeleton count={3} /> : <HospitalGridSkeleton count={3} />}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <HomeHero />
        <Suspense fallback={<SectionSkeleton kind="hospitals" />}>
          <TopRatedSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton kind="reviews" />}>
          <RecentReviewsSection />
        </Suspense>
        <Suspense fallback={null}>
          <PopularReviewsSection />
        </Suspense>
        <AddReviewCTA />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
}
