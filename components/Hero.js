'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Building2, MapPin, Plus, Star, ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsapClient';
import useReducedMotion from '@/hooks/useReducedMotion';
import ScrollCue from './ScrollCue';
import Marquee from './Marquee';

const HeroScene = dynamic(() => import('./three/HeroScene'), { ssr: false });

const MARQUEE_ITEMS = [
    'Mystery meatloaf, reviewed',
    'Jello Friday intel',
    'Real reviews — real cafeterias',
    '3am vending machine wisdom',
    'The pho that shocked a cardiologist',
    'Know before you go',
];

/** Splits a string into per-character spans so GSAP can stagger them. */
function SplitChars({ text, className = '' }) {
    return (
        <span className={className} aria-hidden="true">
            {text.split('').map((ch, i) => (
                <span key={i} className="hero-char inline-block will-change-transform">
                    {ch === ' ' ? ' ' : ch}
                </span>
            ))}
        </span>
    );
}

/**
 * Full-viewport hero: Three.js molten-ember scene behind a giant
 * staggered headline. Search bar keeps full autocomplete + keyboard
 * navigation; live review cards float on the right.
 */
export default function Hero({ hospitals, heroReviews, searchTerm, setSearchTerm, onSearchSubmit }) {
    const [showSuggestions, setShowSuggestions]   = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const searchContainerRef = useRef(null);
    const rootRef = useRef(null);
    const stripRef = useRef(null);
    const router = useRouter();
    const reduced = useReducedMotion();

    // Chrome's initial snap can land the mobile review strip on card 2;
    // force it back to the first card once content is in.
    useEffect(() => {
        const t = setTimeout(() => {
            if (stripRef.current) stripRef.current.scrollLeft = 0;
        }, 80);
        return () => clearTimeout(t);
    }, [heroReviews]);

    // Entrance choreography
    useEffect(() => {
        if (reduced) return;
        const ctx = gsap.context(() => {
            gsap.timeline({ defaults: { ease: 'power4.out' } })
                .fromTo('.hero-char',
                    { yPercent: 110, opacity: 0, rotateX: -40 },
                    { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.1, stagger: 0.028 }, 0.15)
                .fromTo('.hero-line',
                    { yPercent: 110 },
                    { yPercent: 0, duration: 1.1 }, 0.5)
                .fromTo('.hero-fade',
                    { y: 28, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.9, stagger: 0.1 }, 0.55)
                .fromTo('.hero-card',
                    { y: 40, opacity: 0, rotate: (i) => (i % 2 === 0 ? -4 : 4) },
                    { y: 0, opacity: 1, rotate: (i) => (i % 2 === 0 ? -1.5 : 1.5), duration: 1, stagger: 0.12 }, 0.7);
        }, rootRef);
        return () => ctx.revert();
    }, [reduced]);

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
        <section ref={rootRef} className="relative overflow-hidden bg-cream-100">

            {/* WebGL ember scene */}
            <div className="absolute inset-0 -z-10">
                <HeroScene />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-10 sm:pt-20 min-h-[88svh] sm:min-h-[92svh] flex flex-col">

                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-10 flex-grow">

                    {/* LEFT — type + search */}
                    <div className="w-full lg:w-[60%] flex flex-col">

                        <div className="hero-fade inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-ink-600 mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-dot" />
                            Real reviews · Real cafeterias
                        </div>

                        <h1 className="font-display font-extrabold uppercase leading-[0.92] tracking-tight text-ink-900 text-[16vw] sm:text-[84px] lg:text-[128px]">
                            <span className="sr-only">Hospital food, rated.</span>
                            <span className="block overflow-hidden pb-1 whitespace-nowrap"><SplitChars text="Hospital" /></span>
                            <span className="block overflow-hidden pb-1 whitespace-nowrap"><SplitChars text="food," className="text-outline-ember" /></span>
                            {/* gradient line animates as one block — background-clip:text
                                breaks when each char carries its own transform */}
                            <span className="block overflow-hidden pb-2 whitespace-nowrap">
                                <span className="hero-line gradient-text inline-block will-change-transform" aria-hidden="true">rated.</span>
                            </span>
                        </h1>

                        <p className="hero-fade text-[15.5px] sm:text-[17px] text-ink-600 mt-6 max-w-md leading-relaxed">
                            Find out what the cafeteria is actually serving before you go.
                            Honest reviews from patients, staff, and visitors.
                        </p>

                        {/* Search */}
                        <div className="hero-fade mt-8 relative max-w-xl z-40" ref={searchContainerRef}>
                            <div className="glass-panel rounded-full flex items-center pl-5 pr-1.5 py-1.5 focus-within:border-brand-500/60 focus-within:shadow-glow transition-all duration-200">
                                <Search className="w-5 h-5 text-ink-500 shrink-0" />
                                <input
                                    type="text"
                                    id="hospital-search"
                                    placeholder="Hospital or city…"
                                    className="flex-grow bg-transparent border-none outline-none text-ink-900 placeholder:text-ink-400 text-[16px] py-3 pl-3 w-full font-medium"
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
                                    className="bg-brand-500 hover:bg-brand-600 active:bg-brand-400 text-cream-100 rounded-full px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-all active:scale-95 shrink-0 hover:shadow-glow"
                                >
                                    Search
                                </button>
                            </div>

                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl shadow-warm-xl overflow-y-auto max-h-[320px] z-50"
                                    style={{ scrollbarWidth: 'thin' }}
                                    role="listbox"
                                >
                                    {suggestions.map((hospital, index) => (
                                        <button
                                            key={hospital.id}
                                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                                                index === highlightedIndex ? 'bg-brand-50' : 'hover:bg-cream-200/60'
                                            } ${index !== suggestions.length - 1 ? 'border-b border-ink-900/5' : ''}`}
                                            onClick={() => handleSelectSuggestion(hospital)}
                                            onMouseEnter={() => setHighlightedIndex(index)}
                                            role="option"
                                            aria-selected={index === highlightedIndex}
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                                                <Building2 className="w-4 h-4 text-brand-700" />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="font-semibold text-ink-900 text-sm truncate">{hospital.name}</div>
                                                <div className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="w-3 h-3" />{hospital.location}
                                                </div>
                                            </div>
                                            {hospital.rating > 0 && (
                                                <div className="flex items-center gap-1 shrink-0 bg-honey-100 px-2 py-1 rounded-md">
                                                    <Star className="w-3 h-3 fill-honey-400 text-honey-400" />
                                                    <span className="text-xs font-bold text-honey-700">{Number(hospital.rating).toFixed(1)}</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {showSuggestions && searchTerm.trim().length > 0 && suggestions.length === 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl shadow-warm-xl p-5 text-center z-50">
                                    <p className="text-ink-600 text-sm mb-2">Couldn&rsquo;t find that hospital.</p>
                                    <Link href="/add" className="inline-flex items-center gap-1 text-brand-500 font-semibold text-sm hover:underline">
                                        Add it <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="hero-fade flex items-center gap-3 mt-5">
                            <span className="text-ink-500 text-[13px]">Hospital not listed?</span>
                            <Link href="/add" className="inline-flex items-center gap-1 text-brand-500 hover:text-brand-600 font-semibold text-[13px] transition-colors">
                                <Plus className="w-3.5 h-3.5" />Add it
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — floating live review cards */}
                    <div className="w-full lg:w-[40%] flex-col gap-4 hidden lg:flex relative">

                        <div className="absolute -top-5 right-2 z-20 inline-flex items-center gap-2 glass-panel text-ink-900 px-3.5 py-1.5 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.25em] animate-float">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-dot" />
                            Live reviews
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
                                    className={`hero-card glass-panel rounded-2xl p-5 shadow-warm-lg transition-all duration-300 hover:border-brand-500/40 hover:-translate-y-1 ${
                                        i === 0 ? 'lg:ml-2' : i === 1 ? 'lg:mr-8' : 'lg:ml-12'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3 gap-3">
                                        <div className="min-w-0">
                                            <div className="font-display font-bold text-ink-900 text-[15px] leading-tight truncate">{review.hospitalName}</div>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <div className="inline-flex items-center gap-1 bg-honey-100 px-2 py-0.5 rounded-md">
                                                    <Star className="w-3 h-3 fill-honey-400 text-honey-400" />
                                                    <span className="text-[12px] font-bold text-honey-700 font-mono">{Number(review.rating).toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`font-mono text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-[0.15em] shrink-0 ${badgeStyles[i % badgeStyles.length]}`}>
                                            {review.badge}
                                        </span>
                                    </div>
                                    <p className="text-ink-700 text-[13px] leading-relaxed line-clamp-2">
                                        &ldquo;{review.comment}&rdquo;
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-ink-900/10 flex items-center justify-between">
                                        <span className="font-mono text-[11px] text-ink-500 uppercase tracking-[0.1em]">— {review.firstName}</span>
                                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-cream-100 text-[10px] font-bold">
                                            {(review.firstName || 'A').charAt(0)}
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <Link href="/recent-reviews" className="hero-card group glass-panel rounded-2xl p-6 shadow-warm-lg hover:border-brand-500/40 transition-all">
                                <p className="font-display font-bold text-ink-900 text-lg leading-snug">Fresh takes from the tray line.</p>
                                <p className="text-ink-500 text-[13px] mt-2">Browse the latest cafeteria reviews.</p>
                                <span className="mt-4 inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-brand-500">
                                    Recent reviews <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile/tablet — swipeable live review cards */}
                {heroReviews && heroReviews.length > 0 && (
                    <div className="hero-fade lg:hidden mt-10">
                        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-ink-500 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-dot" />
                            Live reviews — swipe
                        </div>
                        <div ref={stripRef} className="-mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            {heroReviews.map((review, i) => {
                                if (!review) return null;
                                const badgeStyles = [
                                    'bg-brand-100 text-brand-700',
                                    'bg-emerald-100 text-emerald-700',
                                    'bg-honey-100 text-honey-700',
                                ];
                                return (
                                    <div
                                        key={review.id || i}
                                        className="glass-panel rounded-2xl p-4 shrink-0 w-[82%] max-w-[340px] snap-start"
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="font-display font-bold text-ink-900 text-[14px] leading-tight line-clamp-1">
                                                {review.hospitalName}
                                            </div>
                                            <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-[0.12em] shrink-0 ${badgeStyles[i % badgeStyles.length]}`}>
                                                {review.badge}
                                            </span>
                                        </div>
                                        <div className="inline-flex items-center gap-1 bg-honey-100 px-2 py-0.5 rounded-md mb-2">
                                            <Star className="w-3 h-3 fill-honey-400 text-honey-400" />
                                            <span className="text-[11px] font-bold text-honey-700 font-mono">{Number(review.rating).toFixed(1)}</span>
                                        </div>
                                        <p className="text-ink-700 text-[12.5px] leading-relaxed line-clamp-2">
                                            &ldquo;{review.comment}&rdquo;
                                        </p>
                                        <div className="mt-2.5 pt-2.5 border-t border-ink-900/10 font-mono text-[10px] text-ink-500 uppercase tracking-[0.1em]">
                                            — {review.firstName}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Scroll cue */}
                <div className="hero-fade mt-10 flex justify-center">
                    <ScrollCue />
                </div>
            </div>

            {/* Bottom ticker */}
            <div className="hero-fade relative border-t border-ink-900/10 bg-cream-100/60 backdrop-blur-sm py-3.5">
                <Marquee
                    items={MARQUEE_ITEMS}
                    className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-ink-500"
                />
            </div>
        </section>
    );
}
