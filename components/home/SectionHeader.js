import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SectionHeader({ eyebrow, title, sub, linkHref, linkLabel, id }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-500">{eyebrow}</p>
        <h2 id={id} className="mt-3 font-display font-bold tracking-tight text-ink-900 text-3xl sm:text-4xl leading-tight">
          {title}
        </h2>
        {sub && <p className="mt-3 text-ink-500 text-[15px] leading-relaxed">{sub}</p>}
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="group inline-flex items-center gap-1.5 shrink-0 font-semibold text-[14px] text-brand-600 hover:text-brand-700 transition-colors"
        >
          {linkLabel}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
