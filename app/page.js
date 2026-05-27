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

      {/* 1. HERO – cinematic search + floating cards */}
      <Hero
        hospitals={hospitals}
        heroReviews={heroReviews}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Search results grid (preserved from original behavior) */}
      {showResults && (
        <section id="search-results" className="bg-cream-50 border-y border-cream-300/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 animate-fade-up">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-[28px] sm:text-[34px] font-semibold text-ink-900 tracking-tight">Search results</h2>
                <p className="text-ink-500 text-sm mt-0.5">Results for &ldquo;{searchTerm}&rdquo;</p>
              </div>
              <span className="text-xs font-bold text-ink-600 bg-cream-100 border border-cream-300 px-3 py-1.5 rounded-full shadow-warm-sm w-fit">
                {filteredHospitals.length} found
              </span>
            </div>

            {filteredHospitals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHospitals.map((hospital, i) => (
                  <AnimatedSection key={hospital.id} delay={Math.min(i, 8) * 60} distance={16}>
                    <HospitalCard hospital={hospital} />
                  </AnimatedSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-cream-100 rounded-3xl border border-cream-300/70 shadow-warm-sm max-w-md mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-ink-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">No hospitals found</h3>
                <p className="text-ink-500 text-sm mb-5">Help the community by adding it.</p>
                <Link
                  href="/add"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all inline-flex items-center gap-2 active:scale-95 shadow-warm"
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
          {/* 2. FOOD SHOWCASE – Apple-style sticky scroll centerpiece */}
          <FoodShowcase />

          {/* 3. HOW IT WORKS – 3-step story */}
          <HowItWorks />

          {/* 4. FEATURED REVIEWS – sticky horizontal slide */}
          <FeaturedReviews reviews={heroReviews} />

          {/* 5. HOSPITAL DISCOVERY – zigzag card layout */}
          {loading ? (
            <section className="py-20 flex items-center justify-center">
              <div className="w-9 h-9 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </section>
          ) : trendingHospitals.length > 0 ? (
            <HospitalDiscovery hospitals={trendingHospitals} />
          ) : (
            <section className="bg-cream-50 border-y border-cream-300/60 py-20">
              <div className="max-w-md mx-auto px-4 text-center bg-cream-100 rounded-3xl border border-cream-300/70 py-12">
                <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-ink-400" />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">No hospitals yet</h3>
                <p className="text-ink-500 text-sm mb-5">Be the first to add one.</p>
                <Link
                  href="/add"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all inline-flex items-center gap-2 active:scale-95 shadow-warm"
                >
                  <Plus className="w-4 h-4" />
                  Add Hospital
                </Link>
              </div>
            </section>
          )}

          {/* 6. STATS – animated count-up */}
          <StatsSection stats={stats} />

          {/* 7. FINAL CTA */}
          <FinalCTA />
        </>
      )}

      <Footer />
    </div>
  );
}
