// The single rating-tone vocabulary for the whole site.
// Fun but kind — never mean about the food or the people making it.

const TONES = [
  {
    min: 4.5,
    label: "Chef's kiss",
    emoji: '🤌',
    chip: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-700',
  },
  {
    min: 3.5,
    label: 'Would eat again',
    emoji: '😋',
    chip: 'bg-green-100 text-green-700',
    text: 'text-green-700',
  },
  {
    min: 2.5,
    label: 'Perfectly decent',
    emoji: '🙂',
    chip: 'bg-honey-100 text-honey-700',
    text: 'text-honey-700',
  },
  {
    min: 1.5,
    label: 'Hit or miss',
    emoji: '🎲',
    chip: 'bg-orange-100 text-orange-700',
    text: 'text-orange-700',
  },
  {
    min: 0.0001,
    label: 'Pack snacks',
    emoji: '🥨',
    chip: 'bg-red-100 text-red-700',
    text: 'text-red-700',
  },
];

const UNRATED = {
  min: 0,
  label: 'Not yet rated',
  emoji: '🍽️',
  chip: 'bg-cream-200 text-ink-500',
  text: 'text-ink-500',
};

export function getRatingTone(rating) {
  const value = Number(rating) || 0;
  return TONES.find((tone) => value >= tone.min) || UNRATED;
}

// Star-by-star labels for the rating input (1–5).
export const STAR_LABELS = {
  1: 'Pack snacks',
  2: 'Hit or miss',
  3: 'Perfectly decent',
  4: 'Would eat again',
  5: "Chef's kiss",
};
