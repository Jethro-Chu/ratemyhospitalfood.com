import Link from 'next/link';

/**
 * Friendly empty state used across list pages and search results.
 */
export default function EmptyState({
  emoji = '🍽️',
  title,
  message,
  actionHref,
  actionLabel,
  secondaryHref,
  secondaryLabel,
  className = '',
}) {
  return (
    <div
      className={`rounded-3xl border border-dashed border-ink-900/15 bg-cream-50/70 px-6 py-14 text-center ${className}`}
    >
      <div className="mx-auto w-16 h-16 rounded-full bg-cream-200/70 flex items-center justify-center text-[28px] animate-float">
        <span aria-hidden="true">{emoji}</span>
      </div>
      <h3 className="mt-5 font-display font-bold text-xl text-ink-900">{title}</h3>
      {message && <p className="mt-2 text-[14px] text-ink-500 max-w-sm mx-auto leading-relaxed">{message}</p>}
      {(actionHref || secondaryHref) && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-cream-50 font-semibold text-[14px] py-2.5 px-6 rounded-full transition-all duration-150 active:scale-[0.97] shadow-warm-sm hover:shadow-glow"
            >
              {actionLabel}
            </Link>
          )}
          {secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center gap-2 border border-ink-900/15 hover:border-brand-500 hover:text-brand-600 text-ink-700 font-semibold text-[14px] py-2.5 px-6 rounded-full transition-all duration-150 active:scale-[0.97]"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
