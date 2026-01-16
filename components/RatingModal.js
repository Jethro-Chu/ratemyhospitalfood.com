'use client';
import { useState } from 'react';
import StarRating from './StarRating';

export default function RatingModal({ isOpen, onClose, onSubmit, hospitalName }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert("Please select a star rating");
            return;
        }
        onSubmit(rating, comment, name);
        // Reset form
        setRating(0);
        setComment('');
        setName('');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                padding: '32px',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>

                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    border: 'none',
                    background: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer'
                }}>×</button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Rate {hospitalName}</h2>
                <p style={{ color: '#666', marginBottom: '24px' }}>Share your experience with others.</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                            <StarRating rating={rating} setRating={setRating} hoverRating={hoverRating} setHoverRating={setHoverRating} size={48} />
                        </div>
                        <div style={{ fontWeight: '600', color: rating ? '#333' : '#999' }}>
                            {rating ? `${rating} Stars` : 'Select a Rating'}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Name (Optional)</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Name"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Comment (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What was good? What was bad? How was the coffee?"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '1rem',
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}>
                        Submit Rating
                    </button>
                </form>
            </div>
        </div>
    );
}
