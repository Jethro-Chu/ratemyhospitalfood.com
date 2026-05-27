'use client';

import { MessageSquare, Building2, Star, TrendingUp } from 'lucide-react';
import useInView from '@/hooks/useInView';
import useCountUp from '@/hooks/useCountUp';

/**
 * Pinned big-number stats. When the section first enters view,
 * each number counts up from 0 to its real value over ~1.4s.
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
        { label: 'Reviews submitted',    value: reviewsValue,   raw: totalReviews,   icon: MessageSquare, tone: 'bg-brand-100 text-brand-700'     },
        { label: 'Hospitals listed',     value: hospitalsValue, raw: totalHospitals, icon: Building2,     tone: 'bg-honey-100 text-honey-700'     },
        { label: 'Highest score so far', value: topScoreValue,  raw: topScoreNum,    icon: Star,          tone: 'bg-emerald-100 text-emerald-700', decimals: 1 },
    ];

    return (
        <section
            ref={ref}
            className="relative bg-cream-100 overflow-hidden border-y border-cream-300/60"
            aria-labelledby="stats-title"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-0 w-[600px] h-[600px] bg-brand-200/20 rounded-full blur-3xl" aria-hidden="true" />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">

                <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
                    <div className="inline-flex items-center gap-1.5 bg-cream-50 border border-honey-200/80 text-honey-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-3">
                        <TrendingUp className="w-3 h-3" />
                        By the numbers
                    </div>
                    <h2 id="stats-title" className="font-display text-[34px] sm:text-[44px] lg:text-[54px] font-semibold tracking-tight text-ink-900 leading-[1.05]">
                        Growing one tray at a time.
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {items.map(({ label, value, raw, icon: Icon, tone, decimals }) => {
                        const formatted = decimals
                            ? Number(value).toFixed(decimals)
                            : Number(value).toLocaleString();
                        return (
                            <div
                                key={label}
                                className="bg-cream-50 border border-cream-300/70 rounded-3xl p-7 sm:p-8 shadow-warm-sm hover:shadow-warm-md transition-shadow"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${tone} flex items-center justify-center mb-5`}>
                                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                                </div>

                                <div className="font-display text-[56px] sm:text-[72px] font-semibold text-ink-900 leading-none tabular-nums tracking-tight">
                                    {formatted}
                                </div>

                                <div className="text-[12.5px] font-bold uppercase tracking-widest text-ink-500 mt-3">
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
