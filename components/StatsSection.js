'use client';

import useInView from '@/hooks/useInView';
import useCountUp from '@/hooks/useCountUp';

/**
 * Giant ledger-style numbers. Each counts up from 0 when the section
 * first enters view (hooks unchanged from the original build).
 */
export default function StatsSection({ stats }) {
    const [ref, inView] = useInView({ threshold: 0.3 });

    const totalReviews   = Number(stats?.totalReviews   ?? 0);
    const totalHospitals = Number(stats?.totalHospitals ?? 0);
    const topScoreNum    = Number(stats?.topScore       ?? 0);

    const reviewsValue   = useCountUp(totalReviews,   inView, 1500);
    const hospitalsValue = useCountUp(totalHospitals, inView, 1500);
    const topScoreValue  = useCountUp(topScoreNum,    inView, 1500, 1);

    const items = [
        { n: '01', label: 'Reviews submitted',    value: reviewsValue,   accent: 'text-brand-500'   },
        { n: '02', label: 'Hospitals listed',     value: hospitalsValue, accent: 'text-honey-400'   },
        { n: '03', label: 'Highest score so far', value: topScoreValue,  accent: 'text-emerald-700', decimals: 1 },
    ];

    return (
        <section
            ref={ref}
            className="relative bg-cream-50 overflow-hidden border-y border-ink-900/10"
            aria-labelledby="stats-title"
        >
            {/* Faint dot grid */}
            <div className="absolute inset-0 paper-grid opacity-40" aria-hidden="true" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">

                <div className="mb-14 sm:mb-20">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 mb-4">
                        ( By the numbers )
                    </p>
                    <h2 id="stats-title" className="font-display font-extrabold uppercase text-[38px] sm:text-[52px] lg:text-[64px] tracking-tight text-ink-900 leading-[0.95]">
                        Growing one<br />
                        <span className="gradient-text">tray at a time.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 border-t border-ink-900/10">
                    {items.map(({ n, label, value, accent, decimals }) => {
                        const formatted = decimals
                            ? Number(value).toFixed(decimals)
                            : Number(value).toLocaleString();
                        return (
                            <div
                                key={label}
                                className="relative py-10 sm:py-12 px-2 sm:px-8 border-b md:border-b-0 md:border-r border-ink-900/10 last:border-r-0 last:border-b-0 group"
                            >
                                <span className={`font-mono text-[11px] font-bold ${accent}`}>{n}</span>
                                <div className="font-display font-extrabold text-[64px] sm:text-[84px] lg:text-[96px] text-ink-900 leading-none tabular-nums tracking-tight mt-4">
                                    {formatted}
                                </div>
                                <div className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-ink-500 mt-5">
                                    {label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
