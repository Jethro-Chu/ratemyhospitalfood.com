import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shimmer, HospitalGridSkeleton } from '@/components/Skeletons';

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-12">
          <div className="max-w-2xl">
            <Shimmer className="h-3 w-40" />
            <Shimmer className="mt-4 h-10 sm:h-12 w-4/5" />
            <Shimmer className="mt-4 h-4 w-2/3" />
            <Shimmer className="mt-3 h-3 w-56" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-14 sm:pb-20">
          <HospitalGridSkeleton count={6} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
