'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search, Star, TrendingUp, Building2, MapPin, Sparkles,
  ArrowRight, PenLine, Plus, Utensils, MessageSquare
} from 'lucide-react';
import { getHospitals, getHeroReviews, getHomepageStats } from '@/lib/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchTerm, setSearchTerm]               = useState('');
  const [hospitals, setHospitals]                 = useState([]);
  const [heroReviews, setHeroReviews]             = useState([]);
  const [stats, setStats]                         = useState({ totalHospitals: 0, totalReviews: 0, topScore: '0.0' });
  const [loading, setLoading]                     = useState(true);
  const [showSuggestions, setShowSuggestions]     = useState(false);
  const [highlightedIndex, setHighlightedIndex]   = useState(-1);
  const searchContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [data, reviewsData, statsData] = await Promise.all([
          getHospitals(),
          getHeroReviews(),
          getHomepageStats(),
        ]);
        setHospitals(data || []);
        setHeroReviews(reviewsData || []);
        setStats(statsData || { totalHospitals: 0, totalReviews: 0, topScore: '0.0' });
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const suggestions = searchTerm.trim().length > 0
    ? hospitals
        .filter(h => {
          const term = searchTerm.toLowerCase();
          return (
            h.name.toLowerCase().startsWith(term) ||
            h.name.toLowerCase().includes(term)   ||
            h.location.toLowerCase().includes(term)
          );
        })
        .sort((a, b) => {
          const term = searchTerm.toLowerCase();
          const aStarts = a.name.toLowerCase().startsWith(term) ? 0 : 1;
          const bStarts = b.name.toLowerCase().startsWith(term) ? 0 : 1;
          return aStarts - bStarts;
        })
        .slice(0, 50)
    : [];

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (hospital) => {
    setSearchTerm(hospital.name);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    router.push(`/hospital/${hospital.id}`);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSearchSubmit = () => {
    setShowSuggestions(false);
    if (searchTerm.trim()) {
      document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const trendingHospitals = hospitals && hospitals.length > 0 ? hospitals.slice(0, 6) : [];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
      <Header />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">

        {/* Decorative warm radial */}
        <div className="absolute inset-0 -z-10 paper-grid opacity-50" aria-hidden="true" />
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-honey-200/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" aria-hidden="true" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 sm:pt-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left – copy + search */}
            <div className="w-full lg:w-[58%] flex flex-col">

              <div className="inline-flex items-center gap-1.5 bg-cream-50 border border-brand-200/60 text-brand-700 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider w-fit mb-6 shadow-warm-sm animate-fade-up">
                <Sparkles className="w-3 h-3" />
                Real reviews · Real cafeterias
              </div>

              <h1 className="font-display text-[44px] sm:text-[58px] lg:text-[68px] font-semibold leading-[1.02] tracking-tight text-ink-900 animate-fade-up-delay">
                Rate your<br className="hidden sm:block" />
                <span className="gradient-text">hospital food.</span>
              </h1>

              <p className="text-[17px] text-ink-600 mt-5 max-w-md leading-relaxed animate-fade-up-delay-2">
                Find out what the cafeteria is actually serving before you go.
                Honest reviews from patients, staff, and visitors.
              </p>

              {/* Search */}
              <div className="mt-9 relative max-w-xl z-40 animate-fade-up-delay-2" ref={searchContainerRef}>
                <div className="bg-cream-50 rounded-2xl flex items-center pl-4 pr-2 py-2 border-2 border-cream-300 shadow-warm-md focus-within:border-brand-400 focus-within:shadow-warm-lg transition-all duration-200">
                  <Search className="w-5 h-5 text-ink-400 shrink-0" />
                  <input
                    type="text"
                    id="hospital-search"
                    placeholder="Search by hospital or city…"
                    className="flex-grow bg-transparent border-none outline-none text-ink-900 placeholder:text-ink-400 text-[15px] py-2.5 pl-3 w-full font-medium"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (searchTerm.trim().length > 0) setShowSuggestions(true); }}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    aria-label="Search hospitals"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 shrink-0 shadow-warm"
                  >
                    Search
                  </button>
                </div>

                {/* Autocomplete */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-cream-50 rounded-2xl shadow-warm-xl border border-cream-300 overflow-y-auto max-h-[320px] z-50"
                    style={{ scrollbarWidth: 'thin' }}
                    role="listbox"
                  >
                    {suggestions.map((hospital, index) => (
                      <button
                        key={hospital.id}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          index === highlightedIndex ? 'bg-brand-50' : 'hover:bg-cream-100'
                        } ${index !== suggestions.length - 1 ? 'border-b border-cream-200' : ''}`}
                        onClick={() => handleSelectSuggestion(hospital)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        role="option"
                        aria-selected={index === highlightedIndex}
                      >
                        <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-brand-600" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-semibold text-ink-900 text-sm truncate">{hospital.name}</div>
                          <div className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{hospital.location}
                          </div>
                        </div>
                        {hospital.rating > 0 && (
                          <div className="flex items-center gap-1 shrink-0 bg-honey-50 px-2 py-1 rounded-md">
                            <Star className="w-3 h-3 fill-honey-400 text-honey-400" />
                            <span className="text-xs font-bold text-ink-700">{Number(hospital.rating).toFixed(1)}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && searchTerm.trim().length > 0 && suggestions.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-cream-50 rounded-2xl shadow-warm-xl border border-cream-300 p-5 text-center z-50">
                    <p className="text-ink-600 text-sm mb-2">Couldn’t find that hospital.</p>
                    <Link href="/add" className="inline-flex items-center gap-1 text-brand-600 font-semibold text-sm hover:underline">
                      Add it <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Add nudge */}
              <div className="flex items-center gap-3 mt-4 animate-fade-up-delay-2">
                <span className="text-ink-500 text-[13px]">Hospital not listed?</span>
                <Link
                  href="/add"
                  className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-[13px] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />Add it
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-10 max-w-md animate-fade-up-delay-3">
                {[
                  { label: stats.totalReviews   === 1 ? 'Review'   : 'Reviews',   value: stats.totalReviews,   icon: MessageSquare, tone: 'bg-brand-100 text-brand-600'   },
                  { label: stats.totalHospitals === 1 ? 'Hospital' : 'Hospitals', value: stats.totalHospitals, icon: Building2,     tone: 'bg-honey-100 text-honey-600'   },
                  { label: 'Top Score',                                            value: stats.topScore,       icon: Star,          tone: 'bg-emerald-100 text-emerald-700' },
                ].map(({ label, value, icon: Icon, tone }) => (
                  <div key={label} className="bg-cream-50 border border-cream-300/80 rounded-2xl p-3.5 shadow-warm-sm">
                    <div className={`w-9 h-9 rounded-xl ${tone} flex items-center justify-center mb-2.5`}>
                      <Icon className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    <div className="font-display text-[26px] font-semibold text-ink-900 leading-none">{value}</div>
                    <div className="text-[10.5px] text-ink-500 font-bold uppercase tracking-wider mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – floating review cards */}
            <div className="w-full lg:w-[42%] flex-col gap-4 hidden lg:flex relative">

              {/* Decorative utensil emoji-ish badge */}
              <div className="absolute -top-4 -right-2 z-20 bg-honey-400 text-ink-900 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-warm-md animate-float">
                Live Reviews
              </div>

              {heroReviews.length > 0 ? heroReviews.map((review, i) => {
                if (!review) return null;
                const badgeStyles = [
                  'bg-brand-100 text-brand-700',
                  'bg-emerald-100 text-emerald-700',
                  'bg-honey-100 text-honey-700',
                ];
                return (
                  <div
                    key={review.id || i}
                    className={`bg-cream-50 rounded-2xl border border-cream-300/80 p-5 shadow-warm-md transition-all duration-300 hover:shadow-warm-lg hover:-translate-y-0.5 ${
                      i === 0 ? 'animate-fade-up         lg:ml-4'  :
                      i === 1 ? 'animate-fade-up-delay   lg:mr-6'  :
                                'animate-fade-up-delay-2 lg:ml-10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="min-w-0">
                        <div className="font-display font-semibold text-ink-900 text-[15px] leading-tight truncate">
                          {review.hospitalName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <div className="inline-flex items-center gap-1 bg-honey-50 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-honey-400 text-honey-400" />
                            <span className="text-[12px] font-bold text-ink-800">{Number(review.rating).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shrink-0 ${badgeStyles[i % badgeStyles.length]}`}>
                        {review.badge}
                      </span>
                    </div>
                    <p className="text-ink-600 text-[13px] italic leading-relaxed line-clamp-2">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <div className="mt-3 pt-3 border-t border-cream-200 flex items-center justify-between">
                      <span className="text-[12px] text-ink-500 font-medium">— {review.firstName}</span>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {(review.firstName || 'A').charAt(0)}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="bg-cream-50 rounded-2xl border border-cream-300/80 p-8 text-center shadow-warm-sm">
                  <Utensils className="w-8 h-8 text-ink-300 mx-auto mb-3" />
                  <p className="text-ink-500 text-sm">Loading recent reviews…</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main id="search-results" className="flex-grow bg-cream-50 border-t border-cream-300/60">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-16">

          {searchTerm ? (
            <div className="animate-fade-up">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-[28px] font-semibold text-ink-900 tracking-tight">Search Results</h2>
                  <p className="text-ink-500 text-sm mt-0.5">Results for &ldquo;{searchTerm}&rdquo;</p>
                </div>
                <span className="text-xs font-bold text-ink-600 bg-cream-100 border border-cream-300 px-3 py-1.5 rounded-full shadow-warm-sm w-fit">
                  {filteredHospitals.length} found
                </span>
              </div>

              {loading ? (
                <LoadingState />
              ) : filteredHospitals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHospitals.map(hospital => (
                    <HospitalCard hospital={hospital} key={hospital.id} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Search}
                  title="No hospitals found"
                  copy="Help the community by adding it."
                  ctaHref="/add"
                  ctaLabel="Add Hospital"
                  ctaIcon={Plus}
                />
              )}
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 mb-2 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-[10.5px] font-bold uppercase tracking-widest text-brand-700">Trending</span>
                  </div>
                  <h2 className="font-display text-[28px] sm:text-[32px] font-semibold text-ink-900 tracking-tight">
                    Most-loved cafeterias
                  </h2>
                  <p className="text-ink-500 text-[14px] mt-1">Top hospitals by reviews and ratings.</p>
                </div>
                <Link
                  href="/top-rated"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-600 hover:text-brand-700 transition-colors group"
                >
                  See all top rated
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              {loading ? (
                <LoadingState />
              ) : trendingHospitals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingHospitals.map((hospital) => (
                    <HospitalCard hospital={hospital} key={hospital.id} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Building2}
                  title="No hospitals yet"
                  copy="Be the first to add one."
                  ctaHref="/add"
                  ctaLabel="Add Hospital"
                  ctaIcon={Plus}
                />
              )}

              {/* Write a review CTA */}
              {trendingHospitals.length > 0 && (
                <div className="mt-14 relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-3xl p-8 sm:p-10 shadow-warm-lg">
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-honey-300/30 rounded-full blur-2xl" aria-hidden="true" />
                  <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-brand-300/20 rounded-full blur-2xl" aria-hidden="true" />
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="max-w-md">
                      <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-[10.5px] font-bold text-white uppercase tracking-widest mb-3">
                        <PenLine className="w-3 h-3" />Your turn
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-semibold text-white leading-tight">
                        Ate at a hospital recently?
                      </h3>
                      <p className="text-cream-100/90 text-[14px] mt-2 leading-relaxed">
                        Share your experience in under a minute. Help patients and staff find better meals.
                      </p>
                    </div>
                    <Link
                      href="/search"
                      className="inline-flex items-center gap-2 bg-cream-50 text-brand-700 font-semibold py-3 px-6 rounded-xl text-sm hover:bg-cream-100 transition-all active:scale-[0.97] shrink-0 shadow-warm-md"
                    >
                      <PenLine className="w-4 h-4" />
                      Write a Review
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-9 h-9 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
      <div className="text-ink-500 text-sm font-medium">Loading…</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, copy, ctaHref, ctaLabel, ctaIcon: CtaIcon }) {
  return (
    <div className="text-center py-16 px-6 bg-cream-100 rounded-3xl border border-cream-300/80 shadow-warm-sm max-w-md mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-ink-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-ink-500 text-sm mb-5">{copy}</p>
      <Link
        href={ctaHref}
        className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all inline-flex items-center gap-2 active:scale-95 shadow-warm hover:shadow-warm-md"
      >
        <CtaIcon className="w-4 h-4" />
        {ctaLabel}
      </Link>
    </div>
  );
}
