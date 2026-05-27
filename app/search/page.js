'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, ArrowRight, Plus, PenLine, Star, MapPin } from 'lucide-react';
import { getHospitals } from '@/lib/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SearchHospital() {
  const [searchTerm, setSearchTerm]             = useState('');
  const [hospitals, setHospitals]               = useState([]);
  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function loadHospitals() {
      try {
        const data = await getHospitals();
        setHospitals(data || []);
      } catch (err) {
        console.error('Failed to load hospitals:', err);
      }
    }
    loadHospitals();
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
        return (
          h.name.toLowerCase().startsWith(term) ||
          h.name.toLowerCase().includes(term)   ||
          h.location.toLowerCase().includes(term)
        );
      }).sort((a, b) => {
        const term = searchTerm.toLowerCase();
        const aStarts = a.name.toLowerCase().startsWith(term) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(term) ? 0 : 1;
        return aStarts - bStarts;
      }).slice(0, 50)
    : [];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (hospital) => {
    setSearchTerm(hospital.name);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    router.push(`/hospital/${hospital.id}?review=true`);
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

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col antialiased relative overflow-hidden">
      <Header />

      <div className="absolute top-1/4 right-0 -z-10 w-[500px] h-[500px] bg-brand-200/30 rounded-full blur-3xl translate-x-1/3" aria-hidden="true" />
      <div className="absolute bottom-1/4 left-0 -z-10 w-[400px] h-[400px] bg-honey-200/30 rounded-full blur-3xl -translate-x-1/3" aria-hidden="true" />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-16 sm:py-20">
        <div className="w-full max-w-xl animate-fade-up flex flex-col items-center text-center">

          <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 rounded-full px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest mb-5">
            <PenLine className="w-3 h-3" />
            Write a Review
          </div>

          <h1 className="font-display text-[36px] sm:text-[44px] lg:text-[52px] font-semibold tracking-tight text-ink-900 leading-[1.05] mb-3">
            Find a hospital<br />
            <span className="gradient-text">to review.</span>
          </h1>
          <p className="text-[16px] text-ink-600 mb-8 max-w-md leading-relaxed">
            Search for the cafeteria you visited and share what you ate.
          </p>

          {/* Search box */}
          <div className="w-full relative z-50 text-left" ref={searchContainerRef}>
            <div className="bg-cream-50 rounded-2xl border-2 border-cream-300 shadow-warm-md flex items-center pl-4 pr-2 py-2 focus-within:border-brand-400 focus-within:shadow-warm-lg transition-all duration-200">
              <Search className="w-5 h-5 text-ink-400 shrink-0" />
              <input
                type="text"
                placeholder="Type a hospital name or city…"
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
                autoFocus
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-cream-50 rounded-2xl shadow-warm-xl border border-cream-300 overflow-y-auto max-h-[340px] z-50"
                style={{ scrollbarWidth: 'thin' }}
                role="listbox"
              >
                {suggestions.map((hospital, index) => (
                  <button
                    key={hospital.id}
                    onClick={() => handleSelectSuggestion(hospital)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === highlightedIndex ? 'bg-brand-50' : 'hover:bg-cream-100'
                    } ${index !== suggestions.length - 1 ? 'border-b border-cream-200' : ''}`}
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
              <div className="absolute top-full left-0 right-0 mt-2 bg-cream-50 rounded-2xl shadow-warm-xl border border-cream-300 py-6 px-4 text-center z-50">
                <p className="text-ink-600 text-sm mb-2">Couldn’t find that one.</p>
                <Link
                  href="/add"
                  className="text-brand-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
                >
                  Add it now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          <div className="mt-10">
            <p className="text-ink-500 text-[13.5px] mb-3">Can&apos;t find your hospital?</p>
            <Link
              href="/add"
              className="inline-flex items-center gap-1.5 bg-cream-50 hover:bg-cream-200/70 text-ink-800 border border-cream-300 text-sm font-semibold py-2.5 px-5 rounded-xl transition-all active:scale-95 shadow-warm-sm"
            >
              <Plus className="w-4 h-4" />
              Add Hospital
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
