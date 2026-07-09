import { getHomepageStats } from '@/lib/actions';
import { formatCount } from '@/lib/format';

export default async function HeroStats() {
  const stats = await getHomepageStats();
  const items = [
    { value: formatCount(stats.totalReviews || 0), label: 'Reviews' },
    { value: formatCount(stats.totalHospitals || 0), label: 'Hospitals' },
    { value: stats.topScore || '0.0', label: 'Best score' },
  ];

  return (
    <dl className="mt-6 grid grid-cols-3 gap-3">
      {items.map(({ value, label }) => (
        <div key={label}>
          <dd className="font-display text-xl font-bold text-white">{value}</dd>
          <dt className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-cream-500">{label}</dt>
        </div>
      ))}
    </dl>
  );
}
