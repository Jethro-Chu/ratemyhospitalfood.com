import { Star } from 'lucide-react';

/**
 * Read-only star display with fractional fill (4.3 renders as 4.3 stars,
 * not rounded to 4). For the interactive input, use StarRating instead.
 */
export default function RatingStars({ rating = 0, size = 16, className = '' }) {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  const pct = (value / 5) * 100;

  return (
    <div
      className={`relative inline-flex shrink-0 ${className}`}
      role="img"
      aria-label={value > 0 ? `Rated ${value.toFixed(1)} out of 5 stars` : 'Not yet rated'}
    >
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={size} className="text-cream-400 fill-cream-200" strokeWidth={1.5} />
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }} aria-hidden="true">
        {/* w-max keeps this row at its natural width so the stars stay full
            size and line up exactly with the base row. Without it the row
            inherits the clipped (pct%) width and the fixed-size star SVGs
            flex-shrink to fit, drifting out of alignment and smearing the fill. */}
        <div className="flex gap-0.5 w-max">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={size} className="shrink-0 text-honey-400 fill-honey-400" strokeWidth={1.5} />
          ))}
        </div>
      </div>
    </div>
  );
}
