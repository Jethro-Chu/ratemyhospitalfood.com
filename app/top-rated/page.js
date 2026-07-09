import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import EmptyState from '@/components/EmptyState';
import Reveal from '@/components/Reveal';
import { getHospitals } from '@/lib/actions';

export const revalidate = 300;

export default async function TopRatedPage() {
  const hospitals = (await getHospitals()) || [];
  const rated = hospitals
    .filter((h) => Number(h.numRatings) > 0)
    .sort(
      (a, b) =>
        Number(b.rating) - Number(a.rating) ||
        Number(b.numRatings) - Number(a.numRatings)
    );

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="border-b border-white/10 bg-ink-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="animate-fade-up max-w-2xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand-300">
                Community leaderboard
              </p>
              <h1 className="mt-3 font-display font-extrabold tracking-tight text-white text-4xl sm:text-5xl leading-[1.05]">
                Hospital cafeterias, ranked.
              </h1>
              <p className="mt-4 text-cream-300 text-[15px] sm:text-base leading-relaxed max-w-xl">
                Average food scores from every published community review.
              </p>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-cream-500">
                {rated.length} of {hospitals.length} listed hospitals have ratings
              </p>
            </div>
          </div>
        </section>

        {/* Leaderboard grid */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
          {rated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rated.map((hospital, i) => (
                <Reveal key={hospital.id} delay={Math.min(i * 50, 400)} className="h-full">
                  <HospitalCard hospital={hospital} rank={i + 1} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              emoji="🏆"
              title="No rated cafeterias yet"
              message="Someone has to take the first bite."
              actionHref="/search"
              actionLabel="Find your hospital"
              className="max-w-xl mx-auto"
            />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
