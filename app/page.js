'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import SearchHero from '@/components/SearchHero';
import HospitalCard from '@/components/HospitalCard';
import { getHospitals } from '@/lib/data';

export default function Home() {
  const [hospitals, setHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load mock data
    setHospitals(getHospitals());
  }, []);

  const filteredHospitals = hospitals.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px', backgroundColor: '#fafafa' }}>
      <Header />
      <SearchHero onSearch={setSearchTerm} />

      <main className="container">
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {searchTerm ? `Results for "${searchTerm}"` : 'Top Rated Dining Halls'}
          </h2>
          <span style={{ fontWeight: '600', color: '#666' }}>
            {filteredHospitals.length} hospitals found
          </span>
        </div>

        {filteredHospitals.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {filteredHospitals.map(hospital => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <h3>No hospitals found matching your search.</h3>
            <p>Know one? Add it!</p>
          </div>
        )}
      </main>
    </div>
  );
}
