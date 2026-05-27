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
        sans:    ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-fraunces)', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        // Primary action color – warm tomato/coral
        brand: {
          50:  '#FFF4EE',
          100: '#FFE3D4',
          200: '#FFC3A8',
          300: '#FF9F76',
          400: '#FF7A4A',
          500: '#F25D2C',
          600: '#DD4A1B',
          700: '#B53914',
          800: '#8B2B0F',
          900: '#65200B',
        },
        // Cream surface palette – warm off-whites
        cream: {
          50:  '#FFFCF7',
          100: '#FFF7EC',
          200: '#FCEFDB',
          300: '#F5E3C0',
          400: '#EBD2A0',
          500: '#D9B879',
          600: '#B79454',
          700: '#8C6E3D',
          800: '#604B29',
          900: '#3D2F1A',
        },
        // Honey/saffron accent for highlights and stars
        honey: {
          50:  '#FFFAEB',
          100: '#FFF1C7',
          200: '#FFE08C',
          300: '#FFCB52',
          400: '#FFB527',
          500: '#EA9C0E',
          600: '#BC7806',
          700: '#8E5A04',
        },
        // Warm ink for typography (slightly browner than zinc)
        ink: {
          50:  '#F6F3EF',
          100: '#E6DED4',
          200: '#C2B6A5',
          300: '#998976',
          400: '#6F6152',
          500: '#4E4334',
          600: '#3A3127',
          700: '#2B221B',
          800: '#1E1612',
          900: '#13100B',
        },
      },
      boxShadow: {
        'warm-sm': '0 1px 2px 0 rgba(101, 32, 11, 0.04)',
        'warm':    '0 2px 8px -2px rgba(101, 32, 11, 0.08), 0 1px 4px -1px rgba(101, 32, 11, 0.04)',
        'warm-md': '0 8px 24px -8px rgba(101, 32, 11, 0.12), 0 2px 8px -2px rgba(101, 32, 11, 0.06)',
        'warm-lg': '0 20px 40px -12px rgba(101, 32, 11, 0.16), 0 4px 12px -4px rgba(101, 32, 11, 0.08)',
        'warm-xl': '0 30px 60px -15px rgba(101, 32, 11, 0.22), 0 8px 20px -6px rgba(101, 32, 11, 0.10)',
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
      },
    },
  },
  plugins: [],
}
