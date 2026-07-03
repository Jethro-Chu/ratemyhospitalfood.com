import { getHomepageStats } from '@/lib/actions';
import { formatCount } from '@/lib/format';

export default async function HeroStats() {
  const stats = await getHomepageStats();
  if (!stats.totalReviews && !stats.totalHospitals) return null;

  const items = [
    { value: formatCount(stats.totalReviews), label: 'Food reviews' },
    { value: formatCount(stats.totalHospitals), label: 'Hospitals listed' },
    { value: stats.topScore, label: 'Top food score' },
  ];

  return (
    <dl className="mt-10 grid grid-cols-3 divide-x divide-ink-900/10 rounded-3xl bg-cream-50/80 backdrop-blur border border-ink-900/10 shadow-warm-sm w-full max-w-md py-4">
      {items.map(({ value, label }) => (
        <div key={label} className="px-3 sm:px-5 text-center">
          <dd className="font-display font-bold text-2xl text-ink-900 leading-none">{value}</dd>
          <dt className="mt-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-ink-400">
            {label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
