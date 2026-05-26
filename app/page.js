'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Star, TrendingUp, Building2, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { getHospitals, getHeroReviews, getHomepageStats } from '@/lib/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [heroReviews, setHeroReviews] = useState([]);
  const [stats, setStats] = useState({ totalHospitals: 0, totalReviews: 0, topScore: "0.0" });
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [data, reviewsData, statsData] = await Promise.all([
          getHospitals(),
          getHeroReviews(),
          getHomepageStats()
        ]);
        setHospitals(data || []);
        setHeroReviews(reviewsData || []);
        setStats(statsData || { totalHospitals: 0, totalReviews: 0, topScore: "0.0" });
      } catch (err) {
        console.error("Failed to load data:", err);
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
    ? hospitals.filter(h => {
        const term = searchTerm.toLowerCase();
        return h.name.toLowerCase().startsWith(term) ||
               h.name.toLowerCase().includes(term) ||
               h.location.toLowerCase().includes(term);
      }).sort((a, b) => {
        const term = searchTerm.toLowerCase();
        const aStarts = a.name.toLowerCase().startsWith(term) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(term) ? 0 : 1;
        return aStarts - bStarts;
      }).slice(0, 50)
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
    <div className="min-h-screen bg-white font-sans flex flex-col antialiased">
      <Header />

      {/* ── Hero ── */}
      <section className="relative flex flex-col overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* Video background */}
        <video
          autoPlay loop muted playsInline aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/30141959/12925634_1920_1080_24fps.mp4" type="video/mp4" />
        </video>

        {/* Blue overlay — matches header transparent color for seamless blend */}
        <div className="absolute inset-0 bg-blue-950/60" />
        {/* Fade to white at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white" />

        {/* Hero content */}
        <div className="relative z-10 flex-grow flex items-center max-w-6xl mx-auto w-full px-4 sm:px-6 py-20">
          <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left: headline + search */}
            <div className="w-full lg:w-[56%] flex flex-col">

              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 text-blue-100 rounded-full px-4 py-1.5 text-[11px] font-semibold w-fit mb-6 animate-fade-up">
                <Sparkles className="w-3 h-3" />
                Real reviews from real patients &amp; staff
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04] text-white animate-fade-up-delay">
                Rate your<br className="hidden sm:block" />
                <span className="text-blue-300">hospital food.</span>
              </h1>

              <p className="text-[17px] text-blue-100/75 mt-5 max-w-md leading-relaxed animate-fade-up-delay-2">
                Find out what the cafeteria is actually serving. Read reviews, check ratings, and avoid the mystery meat.
              </p>

              {/* Search bar */}
              <div className="mt-9 relative max-w-xl animate-fade-up-delay-2 z-50" ref={searchContainerRef}>
                <div className="bg-white rounded-2xl flex items-center px-4 shadow-2xl shadow-blue-950/40 ring-1 ring-white/10">
                  <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    id="hospital-search"
                    placeholder="Search hospitals by name or city..."
                    className="flex-grow bg-transparent border-none outline-none text-zinc-800 placeholder:text-zinc-400 text-[15px] py-4 pl-3 w-full"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (searchTerm.trim().length > 0) setShowSuggestions(true); }}
                    autoComplete="off"
                    role="combobox"
                    aria-expanded={showSuggestions && suggestions.length > 0}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                  />
                  <button
                    onClick={handleSearchSubmit}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all active:scale-95 ml-2 shrink-0"
                  >
                    Search
                  </button>
                </div>

                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl shadow-blue-950/20 border border-zinc-100 overflow-y-auto max-h-[300px] z-50"
                    style={{ scrollbarWidth: 'thin' }}
                    role="listbox"
                  >
                    {suggestions.map((hospital, index) => (
                      <button
                        key={hospital.id}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                          index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-zinc-50'
                        } ${index !== suggestions.length - 1 ? 'border-b border-zinc-50' : ''}`}
                        onClick={() => handleSelectSuggestion(hospital)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        role="option"
                        aria-selected={index === highlightedIndex}
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-medium text-zinc-800 text-sm truncate">{hospital.name}</div>
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />{hospital.location}
                          </div>
                        </div>
                        {hospital.rating > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-semibold text-zinc-600">{hospital.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showSuggestions && searchTerm.trim().length > 0 && suggestions.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-zinc-100 p-5 text-center z-50">
                    <p className="text-zinc-500 text-sm">No hospital found. The cafeteria might be hiding.</p>
                  </div>
                )}
              </div>

              {/* Can't find yours nudge */}
              <div className="flex items-center gap-3 mt-4 animate-fade-up-delay-2">
                <span className="text-blue-200/55 text-sm">Hospital not listed?</span>
                <Link href="/add" className="inline-flex items-center gap-1 text-blue-300 hover:text-white font-semibold text-sm transition-colors">
                  <Plus className="w-3.5 h-3.5" />Add it
                </Link>
              </div>

              {/* Stats strip */}
              <div className="flex flex-wrap gap-6 mt-12 animate-fade-up-delay-2 pt-6 border-t border-white/10">
                {[
                  { label: stats.totalReviews === 1 ? 'Review' : 'Reviews', value: stats.totalReviews, icon: Star },
                  { label: stats.totalHospitals === 1 ? 'Hospital' : 'Hospitals', value: stats.totalHospitals, icon: Building2 },
                  { label: 'Top Score', value: stats.topScore, icon: TrendingUp },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                      <Icon className="w-4 h-4 text-blue-300" />
                    </div>
                    <div>
                      <div className="text-[22px] font-bold text-white leading-none">{value}</div>
                      <div className="text-[10px] text-blue-200/55 font-semibold uppercase tracking-widest mt-0.5">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: floating review cards */}
            <div className="w-full lg:w-[44%] flex-col gap-4 hidden lg:flex">
              {heroReviews.map((review, i) => {
                if (!review) return null;
                const badgeStyles = [
                  'bg-blue-100 text-blue-700',
                  'bg-emerald-100 text-emerald-700',
                  'bg-violet-100 text-violet-700',
                ];
                return (
                  <div
                    key={review.id || i}
                    className={`bg-white/92 backdrop-blur-xl rounded-2xl border border-white/50 p-5 shadow-2xl shadow-blue-950/25 transition-all duration-300 ${
                      i === 0 ? 'animate-fade-up lg:ml-6' :
                      i === 1 ? 'animate-fade-up-delay lg:mr-6' :
                                'animate-fade-up-delay-2 lg:ml-10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-zinc-900 text-sm">{review.hospitalName}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-zinc-700">{Number(review.rating).toFixed(1)}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${badgeStyles[i % badgeStyles.length]}`}>
                        {review.badge}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[13px] italic leading-relaxed line-clamp-2">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">— {review.firstName}</span>
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-[10px] font-bold">
                        {(review.firstName || 'A').charAt(0)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main id="search-results" className="flex-grow bg-zinc-50/40">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-16">
          {searchTerm ? (
            <div className="animate-fade-up">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Search Results</h2>
                  <p className="text-zinc-400 text-sm mt-0.5">Showing results for &ldquo;{searchTerm}&rdquo;</p>
                </div>
                <span className="text-xs font-semibold text-zinc-500 bg-white border border-zinc-100 px-3 py-1.5 rounded-lg shadow-sm">
                  {filteredHospitals.length} found
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <div className="text-zinc-400 text-sm">Loading...</div>
                </div>
              ) : filteredHospitals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHospitals.map(hospital => (
                    <HospitalCard hospital={hospital} key={hospital.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-6 bg-white rounded-2xl border border-zinc-100 shadow-sm max-w-md mx-auto">
                  <Search className="w-8 h-8 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-zinc-800 mb-1">No hospitals found</h3>
                  <p className="text-zinc-400 text-sm mb-5">Help the community by adding it.</p>
                  <Link href="/add" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all inline-flex items-center gap-2 text-sm active:scale-95">
                    <Plus className="w-4 h-4" />Add Hospital
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-up">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Trending</span>
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Most Trusted Cafeterias</h2>
                  <p className="text-zinc-400 text-sm mt-0.5">Top hospitals by review activity and ratings</p>
                </div>
                <Link
                  href="/top-rated"
                  className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  See all top rated <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <div className="text-zinc-400 text-sm">Loading hospitals...</div>
                </div>
              ) : trendingHospitals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingHospitals.map((hospital) => (
                    <HospitalCard hospital={hospital} key={hospital.id} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-6 bg-white rounded-2xl border border-zinc-100 shadow-sm max-w-md mx-auto">
                  <Building2 className="w-8 h-8 text-zinc-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-zinc-800 mb-1">No hospitals yet</h3>
                  <p className="text-zinc-400 text-sm mb-5">Be the first to add one to the map.</p>
                  <Link href="/add" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all inline-flex items-center gap-2 text-sm active:scale-95">
                    <Plus className="w-4 h-4" />Add Hospital
                  </Link>
                </div>
              )}

              {/* Add review CTA strip */}
              {trendingHospitals.length > 0 && (
                <div className="mt-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-200/60">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-white">Ate at a hospital recently?</h3>
                    <p className="text-blue-100/80 text-sm mt-1">Share your experience and help others make better choices.</p>
                  </div>
                  <Link
                    href="/search"
                    className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold py-2.5 px-5 rounded-xl text-sm hover:bg-blue-50 transition-all active:scale-[0.97] shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Write a Review
                  </Link>
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
