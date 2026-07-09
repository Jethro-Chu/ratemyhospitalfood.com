import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SectionHeader({ eyebrow, title, sub, linkHref, linkLabel, id }) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-t border-ink-900/15 pt-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="section-kicker">{eyebrow}</p>
        <h2 id={id} className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[40px]">{title}</h2>
        {sub && <p className="mt-3 max-w-2xl text-[15px] leading-6 text-ink-500">{sub}</p>}
      </div>
      {linkHref && (
        <Link href={linkHref} className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand-600 transition-colors hover:text-brand-700">
          {linkLabel}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
