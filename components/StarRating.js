'use client';
import { Star } from 'lucide-react';

export default function StarRating({ rating, setRating, hoverRating, setHoverRating, size = 24 }) {
    return (
        <div className="flex gap-1.5 justify-center">
            {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                    <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-all duration-150 hover:scale-110 active:scale-95"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        <Star
                            size={size}
                            className={`transition-all duration-200 ${
                                isActive 
                                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_4px_rgba(245,158,11,0.35)]' 
                                    : 'text-slate-200 fill-transparent hover:text-slate-300'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
