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
        // Clinical green: authoritative without feeling institutional.
        brand: {
          50:  '#EAF7F2',
          100: '#D1EEE4',
          200: '#A3DDCB',
          300: '#68C5AA',
          400: '#2FA584',
          500: '#08785D',
          600: '#06644E',
          700: '#075141',
          800: '#073F34',
          900: '#052F28',
        },
        // Neutral surfaces. The legacy name keeps the existing component API stable.
        cream: {
          50:  '#FFFFFF',
          100: '#F4F7F5',
          200: '#E7ECE9',
          300: '#D5DDD8',
          400: '#B7C3BC',
          500: '#8F9D95',
          600: '#6D7A73',
          700: '#4F5A54',
          800: '#303A35',
          900: '#17201C',
        },
        // Signal yellow for ratings and editorial callouts.
        honey: {
          50:  '#FFF9DD',
          100: '#FFF1AF',
          200: '#FBE278',
          300: '#F4CC42',
          400: '#E8B522',
          500: '#C99410',
          600: '#9F700A',
          700: '#745006',
        },
        // Neutral charcoal text with a slight green cast.
        ink: {
          50:  '#F0F3F1',
          100: '#E0E5E2',
          200: '#C2CAC5',
          300: '#9BA69F',
          400: '#748078',
          500: '#59645E',
          600: '#424C47',
          700: '#303834',
          800: '#202723',
          900: '#111614',
        },
        // Rating-chip tones, pitched for light surfaces
        emerald: { 100: '#DCF5E7', 200: '#B5E8CD', 600: '#16825A', 700: '#0B7A45' },
        green:   { 100: '#DFF5DC', 200: '#BCE9B6', 700: '#1F7A1F' },
        orange:  { 100: '#FFEAD6', 200: '#FFD3A8', 700: '#A35408' },
        red:     { 50: '#FFF4F3', 100: '#FDE2E2', 200: '#F8C2C2', 700: '#B91C1C' },
        cyan:    { 600: '#0891B2' },
      },
      boxShadow: {
        'warm-sm': '0 1px 2px rgba(17, 22, 20, 0.06)',
        'warm':    '0 4px 12px rgba(17, 22, 20, 0.07)',
        'warm-md': '0 10px 26px rgba(17, 22, 20, 0.09)',
        'warm-lg': '0 18px 44px rgba(17, 22, 20, 0.12)',
        'warm-xl': '0 28px 70px rgba(17, 22, 20, 0.16)',
        'glow':       '0 8px 28px rgba(8, 120, 93, 0.22)',
        'glow-honey': '0 8px 28px rgba(232, 181, 34, 0.25)',
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
        'slide-up':        'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
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
        slideUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
