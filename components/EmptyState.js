import Link from 'next/link';

export default function EmptyState({ emoji = '🍽️', title, message, actionHref, actionLabel, secondaryHref, secondaryLabel, className = '' }) {
  return (
    <div className={`rounded-lg border border-dashed border-ink-900/20 bg-white px-6 py-12 text-center ${className}`}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-cream-200 text-2xl" aria-hidden="true">{emoji}</div>
      <h3 className="mt-5 font-display text-xl font-extrabold text-ink-900">{title}</h3>
      {message && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-ink-500">{message}</p>}
      {(actionHref || secondaryHref) && (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {actionHref && <Link href={actionHref} className="action-primary">{actionLabel}</Link>}
          {secondaryHref && <Link href={secondaryHref} className="action-secondary">{secondaryLabel}</Link>}
        </div>
      )}
    </div>
  );
}
