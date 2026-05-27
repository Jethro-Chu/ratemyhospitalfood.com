'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, Sparkles, Plus, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ScrollCue from './ScrollCue';

/**
 * Cinematic hero with sticky-feeling background video and parallax
 * decorative blurs. Search bar is fully functional (autocomplete +
 * keyboard nav preserved from previous implementation).
 */
export default function Hero({ hospitals, heroReviews, searchTerm, setSearchTerm, onSearchSubmit }) {
    const [showSuggestions, setShowSuggestions]     = useState(false);
    const [highlightedIndex, setHighlightedIndex]   = useState(-1);
    const searchContainerRef = useRef(null);
    const router = useRouter();

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
        if (typeof onSearchSubmit === 'function') {
            onSearchSubmit();
        } else if (suggestions.length > 0) {
            handleSelectSuggestion(suggestions[0]);
        }
    };

    return (
        <section className="relative overflow-hidden">

            {/* Background: subtle Pexels food video, very low opacity, no audio */}
            <div className="absolute inset-0 -z-20" aria-hidden="true">
                <video
                    className="w-full h-full object-cover opacity-[0.18]"
                    autoPlay loop muted playsInline preload="metadata"
                >
                    <source
                        src="https://videos.pexels.com/video-files/30141959/12925634_1920_1080_24fps.mp4"
                        type="video/mp4"
                    />
                </video>
                {/* Warm gradient overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-cream-100 via-cream-100/85 to-cream-100" />
            </div>

            {/* Decorative warm blurs */}
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-brand-200/40 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-honey-200/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/4" aria-hidden="true" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20 sm:pt-16 sm:pb-24 min-h-[88vh] flex flex-col">

                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 flex-grow">

                    {/* LEFT — copy + search */}
                    <div className="w-full lg:w-[58%] flex flex-col">

                        <div className="inline-flex items-center gap-1.5 bg-cream-50 border border-brand-200/60 text-brand-700 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider w-fit mb-6 shadow-warm-sm animate-fade-up">
                            <Sparkles className="w-3 h-3" />
                            Real reviews · Real cafeterias
                        </div>

                        <h1 className="font-display text-[44px] sm:text-[58px] lg:text-[72px] font-semibold leading-[1.0] tracking-tight text-ink-900 animate-fade-up-delay">
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
                                    onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); setHighlightedIndex(-1); }}
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
                                    <p className="text-ink-600 text-sm mb-2">Couldn&rsquo;t find that hospital.</p>
                                    <Link href="/add" className="inline-flex items-center gap-1 text-brand-600 font-semibold text-sm hover:underline">
                                        Add it <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 mt-4 animate-fade-up-delay-2">
                            <span className="text-ink-500 text-[13px]">Hospital not listed?</span>
                            <Link href="/add" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold text-[13px] transition-colors">
                                <Plus className="w-3.5 h-3.5" />Add it
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — floating review cards */}
                    <div className="w-full lg:w-[42%] flex-col gap-4 hidden lg:flex relative">

                        <div className="absolute -top-4 -right-2 z-20 bg-honey-400 text-ink-900 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-warm-md animate-float">
                            Live Reviews
                        </div>

                        {heroReviews && heroReviews.length > 0 ? heroReviews.map((review, i) => {
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
                                            <div className="font-display font-semibold text-ink-900 text-[15px] leading-tight truncate">{review.hospitalName}</div>
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
                                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-[10px] font-bold">
                                            {(review.firstName || 'A').charAt(0)}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : null}
                    </div>
                </div>

                {/* Scroll cue */}
                <div className="mt-12 flex justify-center">
                    <ScrollCue />
                </div>
            </div>
        </section>
    );
}
