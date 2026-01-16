'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { saveHospital, getHospitals } from '@/lib/data';

export default function AddHospital() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        location: ''
    });
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.name || !formData.location) return;

        // Check for duplicates
        const existingHospitals = getHospitals();
        const isDuplicate = existingHospitals.some(hospital =>
            hospital.name.toLowerCase() === formData.name.toLowerCase().trim() &&
            hospital.location.toLowerCase() === formData.location.toLowerCase().trim()
        );

        if (isDuplicate) {
            setError('This hospital already exists!');
            return;
        }



        saveHospital({
            name: formData.name,
            location: formData.location
        });

        // Go back home or to the new page
        router.push('/');
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <Header />
            <div className="container" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '32px', textAlign: 'center' }}>
                    Add a Hospital
                </h1>

                <div className="card" style={{ padding: '32px' }}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                textAlign: 'center',
                                fontWeight: '500'
                            }}>
                                {error}
                            </div>
                        )}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Hospital / Dining Hall Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. St. Jude Cafeteria"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Location (City, State)</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Memphis, TN"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ccc',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: '1.1rem',
                                cursor: 'pointer'
                            }}
                        >
                            Add Hospital
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
