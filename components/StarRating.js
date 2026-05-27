'use client';
import { Star } from 'lucide-react';

export default function StarRating({ rating, setRating, hoverRating, setHoverRating, size = 24 }) {
    return (
        <div className="flex gap-1.5 justify-center" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                    <button
                        key={star}
                        type="button"
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        aria-checked={rating === star}
                        role="radio"
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100 rounded-md p-0.5 transition-all duration-150 hover:scale-110 active:scale-95"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        <Star
                            size={size}
                            className={`transition-all duration-200 ${
                                isActive
                                    ? 'text-honey-400 fill-honey-400 drop-shadow-[0_2px_4px_rgba(255,181,39,0.45)]'
                                    : 'text-cream-300 fill-cream-200 hover:text-cream-400'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
