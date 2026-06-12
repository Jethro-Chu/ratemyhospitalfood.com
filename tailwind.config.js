/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-sans)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Primary action color – ember orange, tuned for dark surfaces
        brand: {
          50:  '#2A130A',
          100: '#38180B',
          200: '#571F0C',
          300: '#8A2F0E',
          400: '#C94512',
          500: '#FF5A1F',
          600: '#FF7440',
          700: '#FF9E73',
          800: '#FFC3A6',
          900: '#FFE3D4',
        },
        // "cream" is now the carbon surface scale (kept the name so every
        // page re-skins automatically): 50 = raised card, 100 = page bg
        cream: {
          50:  '#15151B',
          100: '#0B0B0F',
          200: '#1C1C24',
          300: '#2A2A36',
          400: '#3A3A49',
          500: '#4D4D60',
          600: '#6A6A80',
          700: '#8C8CA2',
          800: '#B9B9CB',
          900: '#E6E6F0',
        },
        // Honey/gold accent for stars and highlights
        honey: {
          50:  '#2B2008',
          100: '#3B2C0B',
          200: '#5A430F',
          300: '#8A6814',
          400: '#FFC53D',
          500: '#FFB527',
          600: '#E09A18',
          700: '#FFD884',
        },
        // "ink" is now the bone/ivory text scale: 900 = brightest text
        ink: {
          50:  '#1A1916',
          100: '#26241F',
          200: '#38362F',
          300: '#4F4C42',
          400: '#6B6759',
          500: '#8B8779',
          600: '#ABA79A',
          700: '#CFCBBC',
          800: '#E5E2D6',
          900: '#F4F2E9',
        },
        // Rating-chip tones, re-pitched for dark surfaces
        emerald: { 100: '#0C2B1D', 200: '#14492F', 700: '#5EEBA6' },
        green:   { 100: '#10301A', 200: '#1B4D2A', 700: '#7DE98A' },
        orange:  { 100: '#33200C', 200: '#5A3812', 700: '#FFB266' },
        red:     { 100: '#331011', 200: '#58191B', 700: '#FF8A8E' },
        cyan:    { 600: '#5EE2FF' },
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.45)',
        'warm':    '0 2px 10px -2px rgba(0, 0, 0, 0.5), 0 1px 4px -1px rgba(0, 0, 0, 0.4)',
        'warm-md': '0 8px 24px -8px rgba(0, 0, 0, 0.6), 0 2px 8px -2px rgba(0, 0, 0, 0.45)',
        'warm-lg': '0 20px 40px -12px rgba(0, 0, 0, 0.65), 0 4px 12px -4px rgba(0, 0, 0, 0.5)',
        'warm-xl': '0 30px 60px -15px rgba(0, 0, 0, 0.75), 0 8px 20px -6px rgba(0, 0, 0, 0.55)',
        'glow':       '0 0 28px rgba(255, 90, 31, 0.35)',
        'glow-honey': '0 0 28px rgba(255, 197, 61, 0.30)',
      },
      animation: {
        'fade-up':         'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-up-delay':   'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both',
        'fade-up-delay-2': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.16s both',
        'fade-up-delay-3': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.24s both',
        'float':           'float 6s ease-in-out infinite',
        'float-delay':     'float 7s ease-in-out 1s infinite',
        'wiggle':          'wiggle 0.6s ease-in-out',
        'pop':             'pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'marquee':         'marquee 28s linear infinite',
        'marquee-slow':    'marquee 44s linear infinite',
        'pulse-dot':       'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%':      { transform: 'rotate(-3deg)' },
          '75%':      { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
      },
    },
  },
  plugins: [],
}
