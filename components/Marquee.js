'use client';

/**
 * Infinite horizontal ticker. Items are rendered twice so the CSS
 * keyframe (translateX 0 → -50%) loops seamlessly.
 */
export default function Marquee({ items, className = '', slow = false, separator = '✦' }) {
    const row = [...items, ...items];
    return (
        <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-hidden="true">
            <div className={`marquee-track ${slow ? 'animate-marquee-slow' : 'animate-marquee'}`}>
                {row.map((item, i) => (
                    <span key={i} className="inline-flex items-center">
                        <span className="px-5">{item}</span>
                        <span className="text-brand-500 text-[0.7em]">{separator}</span>
                    </span>
                ))}
            </div>
        </div>
    );
}
