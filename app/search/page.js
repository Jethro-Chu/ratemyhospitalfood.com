'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, ArrowRight, Plus } from 'lucide-react';
import { getHospitals } from '@/lib/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SearchHospital() {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function loadHospitals() {
      try {
        const data = await getHospitals();
        setHospitals(data || []);
      } catch (err) {
        console.error("Failed to load hospitals:", err);
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
    <div className="min-h-screen bg-white font-sans flex flex-col antialiased">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-xl animate-fade-up flex flex-col items-center text-center">

          <div className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center mb-6">
            <Search className="w-7 h-7 text-brand-500" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-3">
            Find a hospital to review
          </h1>
          <p className="text-base text-zinc-400 mb-8 max-w-md">
            Search for the facility you visited and share your dining experience.
          </p>

          <div className="w-full relative z-50 text-left" ref={searchContainerRef}>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex items-center px-4 focus-within:border-brand-300 focus-within:shadow-md focus-within:shadow-brand-100/30 transition-all duration-200">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Type a hospital name or city..."
                className="flex-grow bg-transparent border-none outline-none text-zinc-800 placeholder:text-zinc-400 text-[15px] py-3.5 pl-3 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (searchTerm.trim().length > 0) setShowSuggestions(true); }}
                autoComplete="off"
                role="combobox"
                aria-expanded={showSuggestions && suggestions.length > 0}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                autoFocus
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-y-auto max-h-[300px] z-50"
                style={{ scrollbarWidth: 'thin' }}
              >
                {suggestions.map((hospital, index) => (
                  <button
                    key={hospital.id}
                    onClick={() => handleSelectSuggestion(hospital)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === highlightedIndex ? 'bg-brand-50' : 'hover:bg-zinc-50'
                    } ${index !== suggestions.length - 1 ? 'border-b border-zinc-50' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-800 text-sm">{hospital.name}</div>
                      <div className="text-xs text-zinc-400">{hospital.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showSuggestions && searchTerm.trim().length > 0 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl shadow-zinc-200/50 border border-zinc-100 py-6 text-center z-50">
                <p className="text-zinc-400 text-sm mb-2">No hospital found.</p>
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
            <p className="text-zinc-300 text-sm mb-2.5">Can&apos;t find your hospital?</p>
            <Link
              href="/add"
              className="inline-flex items-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 text-sm font-medium py-2.5 px-5 rounded-lg transition-all active:scale-95"
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
