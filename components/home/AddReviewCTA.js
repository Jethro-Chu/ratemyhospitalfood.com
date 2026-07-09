import Link from 'next/link';
import { ArrowRight, PenLine, Plus } from 'lucide-react';

export default function AddReviewCTA() {
  return (
    <section className="border-t border-ink-900/10 bg-honey-300" aria-labelledby="add-review-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-12 md:py-16">
        <div className="md:col-span-8">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-ink-700">Your tray, your call</p>
          <h2 id="add-review-heading" className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-[42px]">
            Had hospital food lately? Put it on the record.
          </h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:flex-col md:items-stretch lg:flex-row">
          <Link href="/search?intent=review" className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-ink-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-ink-800">
            <PenLine className="h-4 w-4" /> Rate a hospital <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/add" aria-label="Add a hospital" className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-900/25 px-5 py-3 text-sm font-bold text-ink-900 transition-colors hover:bg-white/30">
            <Plus className="h-4 w-4" /> Add hospital
          </Link>
        </div>
      </div>
    </section>
  );
}
