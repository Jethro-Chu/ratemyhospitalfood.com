'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Plus } from 'lucide-react';
import { getHospitals } from '@/lib/actions';
import { Shimmer } from '@/components/Skeletons';

/**
 * The homepage's big search bar. Loads the hospital list lazily on first
 * focus, filters locally for instant suggestions, and hands off to
 * /search?q=… on submit.
 */
export default function HeroSearch() {
  const router = useRouter();
  const boxRef = useRef(null);
  const [term, setTerm] = useState('');
  const [hospitals, setHospitals] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const loadRequested = useRef(false);

  function ensureData() {
    if (loadRequested.current) return;
    loadRequested.current = true;
    setStatus('loading');
    getHospitals()
      .then((rows) => {
        setHospitals(rows || []);
        setStatus('ready');
      })
      .catch(() => {
        setStatus('error');
        loadRequested.current = false;
      });
  }

  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const trimmed = term.trim().toLowerCase();
  const suggestions =
    hospitals && trimmed
      ? hospitals
          .filter(
            (h) =>
              h.name.toLowerCase().includes(trimmed) ||
              (h.location || '').toLowerCase().includes(trimmed)
          )
          .sort((a, b) => {
            const ap = a.name.toLowerCase().startsWith(trimmed) ? 0 : 1;
            const bp = b.name.toLowerCase().startsWith(trimmed) ? 0 : 1;
            return ap - bp;
          })
          .slice(0, 6)
      : [];

  function goTo(hospital) {
    setOpen(false);
    router.push(`/hospital/${hospital.id}`);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (open && highlighted >= 0 && suggestions[highlighted]) {
      goTo(suggestions[highlighted]);
      return;
    }
    const q = term.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  function onKeyDown(e) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showDropdown = open && trimmed.length > 0;

  return (
    <form onSubmit={onSubmit} role="search" className="relative w-full max-w-xl" ref={boxRef}>
      <div className="relative flex items-center h-14 sm:h-16 pl-5 pr-2 rounded-full bg-cream-50 border border-ink-900/10 shadow-warm-lg focus-within:border-brand-500/60 focus-within:shadow-glow transition-all duration-200">
        <Search className="w-5 h-5 text-ink-400 shrink-0" aria-hidden="true" />
        <input
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setHighlighted(-1);
            setOpen(true);
            ensureData();
          }}
          onFocus={() => {
            ensureData();
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="hero-suggestions"
          aria-autocomplete="list"
          aria-activedescendant={highlighted >= 0 ? `hero-option-${highlighted}` : undefined}
          aria-label="Search by hospital name or city"
          placeholder="Hospital name or city…"
          className="flex-1 min-w-0 bg-transparent px-3 text-base text-ink-900 placeholder:text-ink-400 outline-none"
        />
        <button
          type="submit"
          className="shrink-0 inline-flex items-center gap-1.5 h-10 sm:h-12 px-5 sm:px-6 rounded-full bg-brand-500 hover:bg-brand-600 text-cream-50 font-semibold text-[14px] transition-all duration-150 active:scale-[0.97]"
        >
          Search
          <ArrowRight className="w-4 h-4 hidden sm:block" aria-hidden="true" />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute top-full inset-x-0 mt-2 z-20 rounded-3xl bg-cream-50 border border-ink-900/10 shadow-warm-xl overflow-hidden text-left animate-pop">
          {status === 'loading' && (
            <div className="p-4 space-y-3">
              <Shimmer className="h-4 w-2/3" />
              <Shimmer className="h-4 w-1/2" />
              <Shimmer className="h-4 w-3/5" />
            </div>
          )}
          {status === 'error' && (
            <div className="p-4 text-[14px] text-ink-600">
              We couldn&apos;t load the hospital list.{' '}
              <button type="button" onClick={ensureData} className="font-semibold text-brand-600 hover:text-brand-700">
                Try again
              </button>
            </div>
          )}
          {status === 'ready' && (
            <ul id="hero-suggestions" role="listbox" aria-label="Hospital suggestions" className="py-1.5">
              {suggestions.map((h, i) => (
                <li key={h.id} role="option" id={`hero-option-${i}`} aria-selected={highlighted === i}>
                  <button
                    type="button"
                    onClick={() => goTo(h)}
                    onMouseEnter={() => setHighlighted(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                      highlighted === i ? 'bg-cream-100' : ''
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-[14px] text-ink-900 truncate">{h.name}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-500">
                        <MapPin className="w-3 h-3 text-brand-500 shrink-0" aria-hidden="true" />
                        <span className="truncate">{h.location}</span>
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[12px] font-bold text-ink-600 bg-cream-200 rounded-full px-2.5 py-1">
                      {Number(h.rating) > 0 ? Number(h.rating).toFixed(1) : '—'}
                    </span>
                  </button>
                </li>
              ))}
              {suggestions.length === 0 && (
                <li className="px-4 py-3 text-[14px] text-ink-500 flex items-center justify-between gap-3">
                  <span>No matches yet.</span>
                  <Link
                    href="/add"
                    className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 shrink-0"
                    onClick={() => setOpen(false)}
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add this hospital
                  </Link>
                </li>
              )}
              {suggestions.length > 0 && (
                <li className="px-4 pt-2 pb-1.5 border-t border-ink-900/5 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-400">
                  Press Enter to see all results
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
