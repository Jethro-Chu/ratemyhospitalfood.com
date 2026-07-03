import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import EmptyState from '@/components/EmptyState';
import Reveal from '@/components/Reveal';
import { getHospitals } from '@/lib/actions';

export const revalidate = 300;

const MEDALS = ['🥇', '🥈', '🥉'];
const TILTS = ['-rotate-6', 'rotate-3', '-rotate-3'];

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
        {/* Page header */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-24 right-[-10%] w-[420px] h-[420px] bg-brand-500/10 blur-3xl rounded-full"
            aria-hidden="true"
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-10 sm:pb-12">
            <div className="animate-fade-up max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-500">
                ( The leaderboard )
              </p>
              <h1 className="mt-3 font-display font-bold tracking-tight text-ink-900 text-4xl sm:text-5xl leading-[1.05]">
                The trays worth <span className="gradient-text">traveling</span> for.
              </h1>
              <p className="mt-4 text-ink-700 text-[15px] sm:text-base leading-relaxed max-w-xl">
                Ranked by average food rating, straight from real reviews.
              </p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-400">
                {rated.length} of {hospitals.length} listed hospitals have ratings
              </p>
            </div>
          </div>
        </section>

        {/* Leaderboard grid */}
        <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-14 sm:pb-20">
          {rated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rated.map((hospital, i) => (
                <Reveal key={hospital.id} delay={Math.min(i * 50, 400)} className="h-full">
                  <div className="relative h-full">
                    {i < 3 && (
                      <div
                        className={`pointer-events-none absolute -top-2.5 -left-2 z-20 ${TILTS[i]} inline-flex items-center gap-1 rounded-full bg-cream-50 border border-ink-900/10 shadow-warm-md px-2.5 py-1`}
                      >
                        <span className="text-[14px] leading-none" aria-hidden="true">
                          {MEDALS[i]}
                        </span>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-700">
                          No. {i + 1}
                        </span>
                      </div>
                    )}
                    <HospitalCard hospital={hospital} />
                  </div>
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
