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
        // Primary action color – ember orange, tuned for light surfaces
        brand: {
          50:  '#FFF1E9',
          100: '#FFE3D4',
          200: '#FFC6AB',
          300: '#FF9D71',
          400: '#FF6A2E',
          500: '#F04A0A',
          600: '#D43E06',
          700: '#9A3008',
          800: '#7A2606',
          900: '#5A1C04',
        },
        // "cream" is the paper surface scale (name kept so every page
        // re-skins automatically): 50 = raised card, 100 = page bg
        cream: {
          50:  '#FFFEFB',
          100: '#FAF6EF',
          200: '#F1EAE0',
          300: '#E3D9C9',
          400: '#D0C2AC',
          500: '#B5A48A',
          600: '#94836B',
          700: '#6F614E',
          800: '#4A4034',
          900: '#2A241D',
        },
        // Honey/gold accent for stars and highlights
        honey: {
          50:  '#FFF8E6',
          100: '#FFEFC4',
          200: '#FFE194',
          300: '#F4C44E',
          400: '#E9A60E',
          500: '#D18F06',
          600: '#A86F04',
          700: '#7C5203',
        },
        // "ink" is the warm near-black text scale: 900 = darkest text
        ink: {
          50:  '#F4F0E9',
          100: '#E8E2D6',
          200: '#D3CABA',
          300: '#B0A58F',
          400: '#8C8068',
          500: '#6F6450',
          600: '#574E3D',
          700: '#423A2D',
          800: '#2B261D',
          900: '#17130D',
        },
        // Rating-chip tones, pitched for light surfaces
        emerald: { 100: '#DCF5E7', 200: '#B5E8CD', 700: '#0B7A45' },
        green:   { 100: '#DFF5DC', 200: '#BCE9B6', 700: '#1F7A1F' },
        orange:  { 100: '#FFEAD6', 200: '#FFD3A8', 700: '#A35408' },
        red:     { 100: '#FDE2E2', 200: '#F8C2C2', 700: '#B91C1C' },
        cyan:    { 600: '#0891B2' },
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(74, 52, 24, 0.05)',
        'warm':    '0 2px 8px -2px rgba(74, 52, 24, 0.09), 0 1px 4px -1px rgba(74, 52, 24, 0.05)',
        'warm-md': '0 8px 24px -8px rgba(74, 52, 24, 0.13), 0 2px 8px -2px rgba(74, 52, 24, 0.07)',
        'warm-lg': '0 20px 40px -12px rgba(74, 52, 24, 0.17), 0 4px 12px -4px rgba(74, 52, 24, 0.08)',
        'warm-xl': '0 30px 60px -15px rgba(74, 52, 24, 0.22), 0 8px 20px -6px rgba(74, 52, 24, 0.10)',
        'glow':       '0 0 28px rgba(240, 74, 10, 0.28)',
        'glow-honey': '0 0 28px rgba(233, 166, 14, 0.30)',
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
