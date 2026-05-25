'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, UtensilsCrossed, ArrowRight, Plus } from 'lucide-react';
import { getHospitals } from '@/lib/actions';
import Header from '@/components/Header';
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete suggestions
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
      }).slice(0, 8) // Limit to 8 suggestions
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
    // Navigate to hospital detail page with review param to open modal directly
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
    <div className="min-h-screen bg-[#FFF7ED] font-sans flex flex-col antialiased">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="w-full max-w-2xl fade-in-up flex flex-col items-center text-center">
          
          <div className="w-16 h-16 bg-white border border-orange-200/60 shadow-sm rounded-2xl flex items-center justify-center mb-8 text-[#E8733A]">
            <UtensilsCrossed className="w-8 h-8" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 mb-4">
            Search for a hospital to review...
          </h1>
          <p className="text-lg text-zinc-600 mb-10 max-w-lg">
            Find the facility you visited and share your dining experience.
          </p>

          {/* Search Bar */}
          <div className="w-full relative z-50 text-left" ref={searchContainerRef}>
            <div className="bg-white rounded-2xl p-2.5 flex items-center shadow-lg shadow-orange-100/50 border border-orange-100/80 focus-within:ring-4 focus-within:ring-orange-100 transition-all duration-200">
              <div className="pl-4 pr-3">
                <Search className="w-6 h-6 text-orange-400" />
              </div>
              <input 
                type="text" 
                placeholder="Type a hospital name or city..." 
                className="flex-grow bg-transparent border-none outline-none text-zinc-800 placeholder:text-zinc-400 text-lg py-3 w-full"
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

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md border border-orange-100 shadow-xl shadow-orange-100/50 rounded-2xl overflow-hidden py-2 animate-fade-in origin-top">
                {suggestions.map((hospital, index) => (
                  <button
                    key={hospital.id}
                    onClick={() => handleSelectSuggestion(hospital)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors duration-150 ${
                      index === highlightedIndex ? 'bg-orange-50/80' : 'hover:bg-orange-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100/50 flex items-center justify-center shrink-0 border border-orange-200/30">
                      <Building2 className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="font-bold text-zinc-800 text-base">{hospital.name}</div>
                      <div className="text-sm text-zinc-500">{hospital.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {showSuggestions && searchTerm.trim().length > 0 && suggestions.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-orange-100 shadow-xl shadow-orange-100/50 rounded-2xl overflow-hidden py-8 text-center animate-fade-in origin-top">
                <p className="text-zinc-500 mb-2">No hospitals found matching &quot;{searchTerm}&quot;</p>
                <Link 
                  href="/add" 
                  className="text-[#E8733A] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  Add it now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Secondary Option: Add Hospital */}
          <div className="mt-12">
            <p className="text-zinc-500 text-sm mb-3">Can&apos;t find your hospital?</p>
            <Link 
              href="/add" 
              className="inline-flex items-center gap-2 bg-white hover:bg-orange-50 text-[#E8733A] border border-orange-200 text-sm font-bold py-3 px-6 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Hospital
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
