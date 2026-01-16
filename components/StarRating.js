'use client';
import { useState } from 'react';

export default function StarRating({ rating, setRating, hoverRating, setHoverRating, size = 24 }) {
    return (
        <div style={{ display: 'flex' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <div
                    key={star}
                    style={{
                        cursor: 'pointer',
                        color: (hoverRating || rating) >= star ? '#FFC700' : '#e0e0e0',
                        fontSize: `${size}px`,
                        transition: 'color 0.2s'
                    }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                >
                    ★
                </div>
            ))}
        </div>
    );
}
