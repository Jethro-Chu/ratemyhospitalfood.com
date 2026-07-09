import { getHospitals } from '@/lib/actions';
import HospitalCard from '@/components/HospitalCard';
import EmptyState from '@/components/EmptyState';
import Reveal from '@/components/Reveal';
import SectionHeader from './SectionHeader';

export default async function TopRatedSection() {
  const hospitals = await getHospitals();
  const top = (hospitals || [])
    .filter((h) => Number(h.numRatings) > 0)
    .sort((a, b) => b.rating - a.rating || b.numRatings - a.numRatings)
    .slice(0, 6);

  return (
    <section className="py-12 sm:py-16" aria-labelledby="top-rated-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          id="top-rated-heading"
          eyebrow="Live ranking"
          title="The cafeterias leading the board."
          sub="Average scores from every published community rating."
          linkHref="/top-rated"
          linkLabel="See the full leaderboard"
        />
        {top.length === 0 ? (
          <EmptyState
            emoji="🏆"
            title="No rated cafeterias yet"
            message="Someone has to take the first bite — it might as well be you."
            actionHref="/search"
            actionLabel="Find your hospital"
            secondaryHref="/add"
            secondaryLabel="Add a hospital"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {top.map((hospital, i) => (
              <Reveal key={hospital.id} delay={Math.min(i * 60, 300)}>
                <HospitalCard hospital={hospital} rank={i + 1} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
