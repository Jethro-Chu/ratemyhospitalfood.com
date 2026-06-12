'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Building2 } from 'lucide-react';
import { getHospitals, getHeroReviews, getHomepageStats } from '@/lib/actions';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HospitalCard from '@/components/HospitalCard';
import Hero from '@/components/Hero';
import FoodShowcase from '@/components/FoodShowcase';
import HowItWorks from '@/components/HowItWorks';
import FeaturedReviews from '@/components/FeaturedReviews';
import HospitalDiscovery from '@/components/HospitalDiscovery';
import StatsSection from '@/components/StatsSection';
import FinalCTA from '@/components/FinalCTA';
import AnimatedSection from '@/components/AnimatedSection';
import MobileActionBar from '@/components/MobileActionBar';
import Link from 'next/link';

export default function Home() {
  const [hospitals, setHospitals]     = useState([]);
  const [heroReviews, setHeroReviews] = useState([]);
  const [stats, setStats]             = useState({ totalHospitals: 0, totalReviews: 0, topScore: '0.0' });
  const [loading, setLoading]         = useState(true);
  const [searchTerm, setSearchTerm]   = useState('');
  const [showResults, setShowResults] = useState(false);

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

  const trendingHospitals = hospitals && hospitals.length > 0 ? hospitals.slice(0, 6) : [];

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchSubmit = () => {
    if (searchTerm.trim().length > 0) {
      setShowResults(true);
      setTimeout(() => {
        document.getElementById('search-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  // Reset results view when user clears the search term
  useEffect(() => {
    if (searchTerm.trim().length === 0) setShowResults(false);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col antialiased">
      <Header />

      {/* 1. HERO – Three.js ember scene + giant type + search */}
      <Hero
        hospitals={hospitals}
        heroReviews={heroReviews}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Search results grid (preserved from original behavior) */}
      {showResults && (
        <section id="search-results" className="bg-cream-50 border-y border-ink-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 animate-fade-up">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 mb-3">
                  ( Results )
                </p>
                <h2 className="font-display font-bold text-[32px] sm:text-[44px] tracking-tight text-ink-900 leading-tight">
                  Search results
                </h2>
                <p className="text-ink-500 text-sm mt-2">Results for &ldquo;{searchTerm}&rdquo;</p>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-ink-600 bg-cream-100 border border-ink-900/10 px-4 py-2 rounded-full w-fit">
                {filteredHospitals.length} found
              </span>
            </div>

            {filteredHospitals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredHospitals.map((hospital, i) => (
                  <AnimatedSection key={hospital.id} delay={Math.min(i, 8) * 60} distance={16}>
                    <HospitalCard hospital={hospital} />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-cream-100 rounded-3xl border border-ink-900/10 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-ink-400" />
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-ink-900 mb-1">No hospitals found</h3>
                <p className="text-ink-500 text-sm mb-6">Help the community by adding it.</p>
                <Link
                  href="/add"
                  className="bg-brand-500 hover:bg-brand-600 text-cream-100 font-mono text-[11px] font-bold uppercase tracking-[0.14em] py-3 px-6 rounded-full transition-all inline-flex items-center gap-2 active:scale-95 hover:shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  Add Hospital
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cinematic scroll story — only when user hasn't submitted a search */}
      {!showResults && (
        <>
          {/* 2. FOOD SHOWCASE – GSAP pinned cinema section */}
          <FoodShowcase />

          {/* 3. HOW IT WORKS – editorial numbered rows */}
          <HowItWorks />

          {/* 4. FEATURED REVIEWS – GSAP horizontal scrub gallery */}
          <FeaturedReviews reviews={heroReviews} />

          {/* 5. HOSPITAL DISCOVERY – leaderboard grid */}
          {loading ? (
            <section className="py-24 flex items-center justify-center">
              <div className="w-9 h-9 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </section>
          ) : trendingHospitals.length > 0 ? (
            <HospitalDiscovery hospitals={trendingHospitals} />
          ) : (
            <section className="bg-cream-100 py-24">
              <div className="max-w-md mx-auto px-4 text-center bg-cream-50 rounded-3xl border border-ink-900/10 py-14">
                <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-ink-400" />
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-ink-900 mb-1">No hospitals yet</h3>
                <p className="text-ink-500 text-sm mb-6">Be the first to add one.</p>
                <Link
                  href="/add"
                  className="bg-brand-500 hover:bg-brand-600 text-cream-100 font-mono text-[11px] font-bold uppercase tracking-[0.14em] py-3 px-6 rounded-full transition-all inline-flex items-center gap-2 active:scale-95 hover:shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  Add Hospital
                </Link>
              </div>
            </section>
          )}

          {/* 6. STATS – ledger count-up */}
          <StatsSection stats={stats} />

          {/* 7. FINAL CTA */}
          <FinalCTA />
        </>
      )}

      <Footer />
      <MobileActionBar />
    </div>
  );
}
