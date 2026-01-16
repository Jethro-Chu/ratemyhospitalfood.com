'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { getHospitalById, saveRating } from '@/lib/data';
import RatingModal from '@/components/RatingModal';
import Link from 'next/link';

export default function HospitalDetail({ params }) {
    const [hospital, setHospital] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const h = getHospitalById(params.id);
        setHospital(h);
    }, [params.id]);

    const handleRate = (rating, comment, name) => {
        const updated = saveRating(hospital.id, rating, comment, name);
        if (updated) {
            setHospital(updated);
            setIsModalOpen(false);
        }
    };

    if (!hospital) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
                <Header />
                <div className="container" style={{ padding: '40px', textAlign: 'center' }}>
                    Loading...
                </div>
            </div>
        );
    }

    const ratingColor = hospital.rating >= 4 ? '#4CAF50' : hospital.rating >= 2.5 ? '#FFC107' : '#F44336';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', paddingBottom: '80px' }}>
            <Header />

            <RatingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRate}
                hospitalName={hospital.name}
            />

            <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>
                                {hospital.name}
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '16px' }}>
                                {hospital.location}
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {hospital.tags && hospital.tags.map(tag => (
                                    <span key={tag} style={{
                                        background: '#f5f5f5',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#666', letterSpacing: '1px' }}>
                                    Overall Quality
                                </div>
                                <div style={{ fontSize: '3.5rem', fontWeight: '900', color: ratingColor, lineHeight: 1 }}>
                                    {hospital.rating.toFixed(1)}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#999', marginTop: '4px' }}>
                                    based on {hospital.numRatings} ratings
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ padding: '12px 24px', fontSize: '1rem' }}>
                                Rate this Hospital
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container" style={{ marginTop: '40px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', borderBottom: '2px solid black', paddingBottom: '10px', marginBottom: '24px', display: 'inline-block' }}>
                    {hospital.numRatings} Student Ratings
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {hospital.reviews && hospital.reviews.length > 0 ? (
                        hospital.reviews.map((review, i) => (
                            <div key={i} className="card">
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        background: review.rating >= 4 ? '#4CAF50' : review.rating >= 2.5 ? '#FFC107' : '#F44336',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        flexShrink: 0
                                    }}>
                                        {review.rating.toFixed(1)}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                                            {review.rating >= 4 ? "Awesome" : review.rating >= 2 ? "Average" : "Awful"}
                                        </p>
                                        <p style={{ color: '#555', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                            {review.comment || "No comment provided."}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                                            by {review.name || 'Anonymous'} • {review.date}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#fff', borderRadius: '8px', border: '1px dashed #ccc' }}>
                            No ratings yet. Be the first to rate!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
