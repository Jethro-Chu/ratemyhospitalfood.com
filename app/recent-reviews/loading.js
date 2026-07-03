import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shimmer, ReviewListSkeleton } from '@/components/Skeletons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-12">
          <Shimmer className="h-3.5 w-32" />
          <Shimmer className="mt-4 h-11 w-80 max-w-full" />
          <Shimmer className="mt-4 h-4 w-96 max-w-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
          <ReviewListSkeleton count={6} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
