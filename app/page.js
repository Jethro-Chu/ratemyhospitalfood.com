'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Utensils, Users, MessageSquare, Star, TrendingUp, Building2, AlertTriangle, UtensilsCrossed, MapPin } from 'lucide-react';
import { getHospitals, getHeroReviews, getHomepageStats } from '@/lib/actions';
import Header from '@/components/Header';
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

  // Autocomplete suggestions: prefix match on name, then includes match on name/location
  const suggestions = searchTerm.trim().length > 0
    ? hospitals.filter(h => {
        const term = searchTerm.toLowerCase();
        return h.name.toLowerCase().startsWith(term) ||
               h.name.toLowerCase().includes(term) ||
               h.location.toLowerCase().includes(term);
      }).sort((a, b) => {
        // Prioritize startsWith matches over includes matches
        const term = searchTerm.toLowerCase();
        const aStarts = a.name.toLowerCase().startsWith(term) ? 0 : 1;
        const bStarts = b.name.toLowerCase().startsWith(term) ? 0 : 1;
        return aStarts - bStarts;
      }).slice(0, 8) // Limit to 8 suggestions
    : [];

  // Filter for the results grid below (uses includes for broader matching)
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
    // Navigate to hospital detail page
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

  // Dynamically take the top 3 highest-rated hospitals from the database
  const trendingHospitals = hospitals && hospitals.length > 0 
    ? hospitals.slice(0, 3) 
    : [];

  return (
    <div className="min-h-screen bg-[#FFF7ED] font-sans flex flex-col antialiased">
      <Header />

      {/* Hero Wrapper with Video */}
      <div className="relative flex flex-col overflow-hidden bg-[#FFF7ED]" style={{minHeight: 'calc(100vh - 64px)'}}>
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          aria-hidden="true" 
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/30141959/12925634_1920_1080_24fps.mp4" type="video/mp4" />
        </video>
        {/* Warm Overlay */}
        <div className="absolute inset-0 bg-[#fff7ed]/85"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FFF7ED]"></div>

        {/* Hero Content */}
        <div className="relative z-10 flex-grow flex items-center max-w-7xl mx-auto w-full px-4 md:px-6 py-16">
          <div className="w-full flex flex-col lg:flex-row items-center gap-12">
            
            {/* Left Side: Copy & Search */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <div className="inline-flex items-center gap-2 bg-white/70 border border-orange-200/70 text-[#C5612B] rounded-full px-4 py-2 text-sm font-semibold shadow-sm animate-fade-rise self-start">
                <UtensilsCrossed className="w-4 h-4" /> Real hospital food reviews
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.92] text-zinc-900 mt-6 animate-fade-rise-delay">
                Find your <br className="hidden sm:block" />
                <span className="text-[#E8733A]">hospital food.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-zinc-600 mt-6 max-w-xl leading-relaxed animate-fade-rise-delay-2">
                Read reviews, check ratings, and avoid the mystery meat.
              </p>

              {/* Search Bar with Autocomplete */}
              <div className="mt-10 relative max-w-xl animate-fade-rise-delay-2 z-50" ref={searchContainerRef}>
                <div className="warm-glass rounded-3xl p-2 flex items-center shadow-xl shadow-orange-100/70">
                  <div className="pl-4 pr-2">
                    <Search className="w-6 h-6 text-orange-400" />
                  </div>
                  <input 
                    type="text" 
                    id="hospital-search"
                    placeholder="Search for a hospital..." 
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
                  />
                  <button 
                    onClick={handleSearchSubmit}
                    className="bg-[#E8733A] hover:bg-[#D4622A] text-white rounded-2xl px-5 md:px-6 py-3 font-semibold shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap ml-2"
                  >
                    Search
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-orange-200/30 border border-orange-100 overflow-hidden z-50"
                    role="listbox"
                    id="search-suggestions"
                  >
                    {suggestions.map((hospital, index) => (
                      <button
                        key={hospital.id}
                        className={`w-full text-left px-5 py-3.5 flex items-center gap-4 transition-colors cursor-pointer ${
                          index === highlightedIndex 
                            ? 'bg-orange-50' 
                            : 'hover:bg-orange-50/60'
                        } ${index !== suggestions.length - 1 ? 'border-b border-orange-50' : ''}`}
                        onClick={() => handleSelectSuggestion(hospital)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        role="option"
                        aria-selected={index === highlightedIndex}
                      >
                        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-orange-500" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-semibold text-zinc-800 text-sm truncate">{hospital.name}</div>
                          <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {hospital.location}
                          </div>
                        </div>
                        {hospital.rating > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-zinc-600">{hospital.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subtle add hospital link */}
              <div className="flex items-center gap-2 mt-5 animate-fade-rise-delay-2">
                <Link
                  href="/add"
                  className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-[#E8733A] font-medium transition-colors duration-200 group"
                >
                  <Plus className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  Add a hospital
                </Link>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-3 mt-12 animate-fade-rise-delay-2">
                <div className="warm-glass rounded-2xl px-4 py-2 flex items-center gap-3">
                  <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600"><Star className="w-4 h-4 fill-orange-500" /></div>
                  <div><div className="font-bold text-zinc-800">{stats.totalReviews}</div><div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{stats.totalReviews === 1 ? 'Review' : 'Reviews'}</div></div>
                </div>
                <div className="warm-glass rounded-2xl px-4 py-2 flex items-center gap-3">
                  <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600"><Building2 className="w-4 h-4" /></div>
                  <div><div className="font-bold text-zinc-800">{stats.totalHospitals}</div><div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{stats.totalHospitals === 1 ? 'Hospital' : 'Hospitals'}</div></div>
                </div>
                <div className="warm-glass rounded-2xl px-4 py-2 flex items-center gap-3">
                  <div className="bg-orange-100 p-1.5 rounded-lg text-orange-600"><TrendingUp className="w-4 h-4" /></div>
                  <div><div className="font-bold text-zinc-800">{stats.topScore}</div><div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Top Score</div></div>
                </div>
              </div>

            </div>

            {/* Right Side: Floating Cards */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center gap-5 sm:gap-6 mt-12 lg:mt-0 relative">
                 
                 {heroReviews.length > 0 && heroReviews[0] && (
                   <div className="warm-glass rounded-2xl p-5 w-full max-w-[380px] self-end lg:mr-8 xl:mr-12 float-soft shadow-xl border border-orange-200/50">
                     <div className="flex justify-between items-start mb-3">
                       <div>
                         <div className="font-bold text-zinc-800 text-[15px] line-clamp-1">{heroReviews[0].hospitalName}</div>
                         <div className="flex items-center gap-1 mt-1"><Star className="w-4 h-4 fill-amber-500 text-amber-500"/><span className="text-sm font-bold text-zinc-700">{Number(heroReviews[0].rating).toFixed(1)}</span></div>
                       </div>
                       <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${heroReviews[0].type === 'positive' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                         {heroReviews[0].badge}
                       </span>
                     </div>
                     <p className="text-zinc-700 text-sm italic leading-relaxed line-clamp-3">&ldquo;{heroReviews[0].comment}&rdquo;</p>
                     <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-end">
                       <span className="text-xs text-zinc-500 font-medium">— {heroReviews[0].firstName}</span>
                     </div>
                   </div>
                 )}

                 {heroReviews.length > 1 && heroReviews[1] && (
                   <div className="warm-glass rounded-2xl p-5 w-full max-w-[380px] self-start lg:ml-4 xl:ml-8 float-soft-delay shadow-xl border border-orange-200/50 hidden sm:block">
                     <div className="flex justify-between items-start mb-3">
                       <div>
                         <div className="font-bold text-zinc-800 text-[15px] line-clamp-1">{heroReviews[1].hospitalName}</div>
                         <div className="flex items-center gap-1 mt-1"><Star className="w-4 h-4 fill-amber-500 text-amber-500"/><span className="text-sm font-bold text-zinc-700">{Number(heroReviews[1].rating).toFixed(1)}</span></div>
                       </div>
                       <span className="shrink-0 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                         {heroReviews[1].badge}
                       </span>
                     </div>
                     <p className="text-zinc-700 text-sm italic leading-relaxed line-clamp-3">&ldquo;{heroReviews[1].comment}&rdquo;</p>
                     <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-end">
                       <span className="text-xs text-zinc-500 font-medium">— {heroReviews[1].firstName}</span>
                     </div>
                   </div>
                 )}

                 {heroReviews.length > 2 && heroReviews[2] && (
                   <div className={`warm-glass rounded-2xl p-5 w-full max-w-[340px] self-end float-soft shadow-xl border hidden md:block ${heroReviews[2].type === 'warning' ? 'border-amber-300' : 'border-orange-200/50'}`}>
                     <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2">
                         {heroReviews[2].type === 'warning' && (
                           <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><AlertTriangle className="w-4 h-4 text-amber-600"/></div>
                         )}
                         <div>
                           <div className="font-bold text-zinc-800 text-[15px] line-clamp-1">{heroReviews[2].hospitalName}</div>
                           <div className="flex items-center gap-1 mt-0.5"><Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500"/><span className="text-xs font-bold text-zinc-700">{Number(heroReviews[2].rating).toFixed(1)}</span></div>
                         </div>
                       </div>
                     </div>
                     <p className="text-zinc-700 text-sm leading-relaxed line-clamp-3">&ldquo;{heroReviews[2].comment}&rdquo;</p>
                     <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-end">
                       <span className="text-xs text-zinc-500 font-medium">— {heroReviews[2].firstName}</span>
                     </div>
                   </div>
                 )}

            </div>

          </div>
        </div>
      </div>

      {/* 4. Main Content Area */}
      <main id="search-results" className="flex-grow container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-6xl relative z-20">
        {searchTerm ? (
          <div className="fade-in-up">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Search Results
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Showing results matching &ldquo;{searchTerm}&rdquo;
                </p>
              </div>
              <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100">
                {filteredHospitals.length} {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'} found
              </span>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-slate-500 font-semibold text-sm">Loading hospitals...</div>
              </div>
            ) : filteredHospitals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHospitals.map(hospital => (
                  <HospitalCard hospital={hospital} key={hospital.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-slate-300">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No hospitals found</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Know a hospital cafeteria we missed? Help the community by adding it.
                </p>
                <Link 
                  href="/add" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 inline-flex items-center gap-2 shadow-md shadow-blue-600/10 hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add New Hospital
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="fade-in-up">
            {/* Trending section header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Popular Picks</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Most Trusted Cafeterias
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Highly rated hospital cafeterias with the most review activity
                </p>
              </div>
              <Link 
                href="/add"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add a hospital
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingHospitals.map((hospital) => (
                <HospitalCard hospital={hospital} key={hospital.id} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-slate-100 bg-white py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Rate My Hospital Food — Helping you find better meals, one cafeteria at a time.
          </p>
        </div>
      </footer>
    </div>
  );
}
