'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, MapPin, RefreshCw, Search, X } from 'lucide-react';
import { getHospitals } from '@/lib/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import EmptyState from '@/components/EmptyState';
import Reveal from '@/components/Reveal';
import { HospitalGridSkeleton } from '@/components/Skeletons';
import { getRatingTone } from '@/lib/ratingTone';
import { pluralize } from '@/lib/format';

const GRID_CAP = 24;
const MAX_SUGGESTIONS = 8;
const LISTBOX_ID = 'hospital-search-listbox';

/* ---------------------------------------------------------------- */
/* Shell + shared pieces                                             */
/* ---------------------------------------------------------------- */

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function SearchShellInput() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink-900/15 bg-white py-2 pl-5 pr-3 shadow-warm-md">
      <Search className="w-5 h-5 text-ink-400 shrink-0" aria-hidden="true" />
      <input
        type="text"
        readOnly
        placeholder="Search by hospital name or city…"
        aria-label="Search hospitals"
        className="flex-grow min-w-0 bg-transparent border-none outline-none text-[16px] text-ink-900 placeholder:text-ink-400 py-2.5"
      />
    </div>
  );
}

function SearchFallback() {
  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="section-kicker">Hospital directory</p>
          <h1 className="mt-4 font-display font-bold tracking-tight text-ink-900 text-4xl sm:text-5xl">
            Find a hospital cafeteria.
          </h1>
          <p className="mt-4 text-ink-700 text-[16px] leading-relaxed">
            Search by name or city. Ratings, reviews, and photos await.
          </p>
        </div>
        <div className="max-w-2xl mx-auto mt-8">
          <SearchShellInput />
        </div>
        <div className="mt-10 sm:mt-14">
          <HospitalGridSkeleton count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" />
        </div>
      </section>
    </PageShell>
  );
}

/* ---------------------------------------------------------------- */
/* The actual search surface (needs useSearchParams → under Suspense) */
/* ---------------------------------------------------------------- */

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isReviewMode = searchParams.get('intent') === 'review';

  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [hospitals, setHospitals] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'error' | 'loaded'
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const loadHospitals = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getHospitals();
      setHospitals(Array.isArray(data) ? data : []);
      setStatus('loaded');
    } catch (err) {
      console.error('Failed to load hospitals:', err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  // Close the dropdown when clicking anywhere outside the search box.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const term = searchTerm.trim().toLowerCase();

  const matchesTerm = useCallback(
    (hospital) => {
      const name = (hospital.name || '').toLowerCase();
      const location = (hospital.location || '').toLowerCase();
      return name.includes(term) || location.includes(term);
    },
    [term]
  );

  // Grid results: everything when the box is empty, filtered otherwise.
  const results = useMemo(() => {
    if (!term) return hospitals;
    return hospitals.filter(matchesTerm);
  }, [hospitals, term, matchesTerm]);

  // Dropdown suggestions: name prefix first, then name includes, then location.
  const suggestions = useMemo(() => {
    if (!term) return [];
    const rank = (hospital) => {
      const name = (hospital.name || '').toLowerCase();
      if (name.startsWith(term)) return 0;
      if (name.includes(term)) return 1;
      return 2; // matched on location
    };
    return hospitals
      .filter(matchesTerm)
      .map((hospital, index) => ({ hospital, index }))
      .sort((a, b) => rank(a.hospital) - rank(b.hospital) || a.index - b.index)
      .slice(0, MAX_SUGGESTIONS)
      .map((entry) => entry.hospital);
  }, [hospitals, term, matchesTerm]);

  const dropdownOpen = showSuggestions && term.length > 0 && status === 'loaded';

  const handleSelect = (hospital) => {
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    router.push(isReviewMode ? `/hospital/${hospital.id}?review=true` : `/hospital/${hospital.id}`);
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!showSuggestions) {
        setShowSuggestions(true);
        setHighlightedIndex(suggestions.length > 0 ? 0 : -1);
        return;
      }
      if (suggestions.length === 0) return;
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!dropdownOpen || suggestions.length === 0) return;
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }
    if (e.key === 'Enter' && dropdownOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    }
  };

  const capped = results.length > GRID_CAP;
  const visibleResults = capped ? results.slice(0, GRID_CAP) : results;
  const activeOptionId =
    dropdownOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]
      ? `hospital-option-${suggestions[highlightedIndex].id}`
      : undefined;

  return (
    <PageShell>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Heading */}
        <div className="max-w-3xl animate-fade-up">
          <p className="section-kicker">
            {isReviewMode ? 'Choose a hospital' : 'Hospital directory'}
          </p>
          <h1 className="mt-4 font-display font-bold tracking-tight text-ink-900 text-4xl sm:text-5xl leading-[1.08]">
            {isReviewMode ? (
              'Which hospital are you reviewing?'
            ) : (
              <>
                Find a hospital cafeteria.
              </>
            )}
          </h1>
          <p className="mt-4 text-ink-700 text-[16px] leading-relaxed">
            {isReviewMode
              ? 'Find the hospital first — then tell us about the tray.'
              : 'Search by name or city. Ratings, reviews, and photos await.'}
          </p>
        </div>

        {/* Search box + suggestions */}
        <div className="relative z-30 mt-8 max-w-3xl" ref={boxRef}>
          <div className="flex items-center gap-3 rounded-lg border border-ink-900/15 bg-white py-2 pl-5 pr-3 shadow-warm-md transition-colors duration-200 focus-within:border-brand-500">
            <Search className="w-5 h-5 text-ink-400 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (searchTerm.trim().length > 0) setShowSuggestions(true);
              }}
              placeholder="Search by hospital name or city…"
              className="flex-grow min-w-0 bg-transparent border-none outline-none text-[16px] text-ink-900 placeholder:text-ink-400 py-2.5"
              autoComplete="off"
              autoFocus
              role="combobox"
              aria-expanded={dropdownOpen}
              aria-controls={LISTBOX_ID}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-activedescendant={activeOptionId}
              aria-label="Search hospitals by name or city"
            />
            {searchTerm.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-400 transition-colors duration-150 hover:bg-cream-200/70 hover:text-ink-700"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-lg border border-ink-900/10 bg-white shadow-warm-lg">
              {suggestions.length > 0 ? (
                <ul
                  id={LISTBOX_ID}
                  role="listbox"
                  aria-label="Hospital suggestions"
                  className="max-h-[336px] overflow-y-auto"
                  style={{ scrollbarWidth: 'thin' }}
                >
                  {suggestions.map((hospital, index) => {
                    const rating = Number(hospital.rating || 0);
                    const tone = getRatingTone(rating);
                    const highlighted = index === highlightedIndex;
                    return (
                      <li
                        key={hospital.id}
                        id={`hospital-option-${hospital.id}`}
                        role="option"
                        aria-selected={highlighted}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(hospital)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors duration-100 ${
                          highlighted ? 'bg-brand-50' : ''
                        } ${index !== suggestions.length - 1 ? 'border-b border-ink-900/5' : ''}`}
                      >
                        <div className="min-w-0 flex-grow">
                          <p className="font-semibold text-ink-900 text-[14px] truncate">{hospital.name}</p>
                          <p className="mt-0.5 text-[12px] text-ink-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0 text-brand-500" aria-hidden="true" />
                            <span className="truncate">{hospital.location}</span>
                          </p>
                        </div>
                        <span
                          className={`inline-flex shrink-0 items-center rounded-sm px-2.5 py-1 font-mono text-[11px] font-bold ${tone.chip}`}
                          aria-label={rating > 0 ? `Rated ${rating.toFixed(1)} out of 5` : 'Not yet rated'}
                        >
                          {rating > 0 ? rating.toFixed(1) : '—'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-5 py-4 text-[13px] text-ink-500">No matches here yet.</p>
              )}
              <div className="border-t border-ink-900/5 bg-cream-100/70">
                <Link
                  href="/add"
                  className="flex items-center justify-between gap-2 px-5 py-3 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors duration-150"
                >
                  <span>Can&apos;t find it? Add it now</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-10 sm:mt-14">
          {status === 'loading' && (
            <HospitalGridSkeleton count={6} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" />
          )}

          {status === 'error' && (
            <div
              role="alert"
              className="mx-auto max-w-xl rounded-lg border border-ink-900/10 bg-white px-6 py-12 text-center shadow-warm-sm"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-cream-200/70 flex items-center justify-center text-[28px]">
                <span aria-hidden="true">🫖</span>
              </div>
              <h2 className="mt-5 font-display font-bold text-xl text-ink-900">We dropped the tray.</h2>
              <p className="mt-2 text-[14px] text-ink-500 max-w-sm mx-auto leading-relaxed">
                The hospital list didn&apos;t load — that&apos;s on us, not your search. Give it another go.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={loadHospitals}
                  className="action-primary"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Try again
                </button>
                <Link
                  href="/add"
                  className="action-secondary"
                >
                  Add a hospital instead
                </Link>
              </div>
            </div>
          )}

          {status === 'loaded' && (
            <>
              {results.length > 0 ? (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                      {term ? pluralize(results.length, 'match', 'matches') : 'Browse every cafeteria'}
                    </p>
                    {!term && (
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                        {pluralize(hospitals.length, 'hospital')}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visibleResults.map((hospital, i) => (
                      <Reveal key={hospital.id} delay={Math.min(i * 40, 300)} className="h-full">
                        <HospitalCard hospital={hospital} />
                      </Reveal>
                    ))}
                  </div>
                  {capped && (
                    <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-ink-400">
                      Showing {GRID_CAP} of {results.length} — keep typing to narrow it down
                    </p>
                  )}
                </>
              ) : term ? (
                <div className="max-w-xl mx-auto">
                  <EmptyState
                    emoji="🔍"
                    title={`No matches for “${searchTerm.trim()}”`}
                    message="Not on the menu yet. Add it yourself — it takes about 20 seconds, and the next hungry visitor will thank you."
                    actionHref="/add"
                    actionLabel="Add this hospital"
                  />
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="text-[13px] font-semibold text-ink-500 hover:text-brand-600 underline underline-offset-4 transition-colors duration-150"
                    >
                      Clear search
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-xl mx-auto">
                  <EmptyState
                    emoji="🍽️"
                    title="No cafeterias listed yet"
                    message="Someone has to take the first bite. Add a hospital and get the list started."
                    actionHref="/add"
                    actionLabel="Add a hospital"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

/* ---------------------------------------------------------------- */
/* Default export: Suspense boundary around useSearchParams          */
/* ---------------------------------------------------------------- */

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchContent />
    </Suspense>
  );
}
