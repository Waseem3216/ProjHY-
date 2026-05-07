/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bayou: {
          50: '#effdf8',
          100: '#d7faef',
          200: '#aef4df',
          300: '#75e8ca',
          400: '#35d3ad',
          500: '#12b894',
          600: '#099477',
          700: '#0b7763',
          800: '#0e5f51',
          900: '#114f45',
          950: '#052f2a'
        },
        sunrise: {
          50: '#fff8ed',
          100: '#ffefd1',
          200: '#fedaa4',
          300: '#fdbd6d',
          400: '#fb9835',
          500: '#f57a12',
          600: '#d95c08',
          700: '#b5430a'
        },
        ink: {
          950: '#08111f',
          900: '#0f172a',
          800: '#1e293b'
        }
      },
      boxShadow: {
        glow: '0 28px 90px rgba(9, 148, 119, 0.24)',
        soft: '0 18px 45px rgba(15, 23, 42, 0.10)',
        card: '0 18px 55px rgba(15, 23, 42, 0.09)',
        lift: '0 24px 70px rgba(8, 17, 31, 0.14)'
      },
      backgroundImage: {
        'houston-grid': 'linear-gradient(rgba(15,118,110,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,.08) 1px, transparent 1px)',
        'hero-radial': 'radial-gradient(circle at 20% 15%, rgba(18,184,148,.28), transparent 34rem), radial-gradient(circle at 82% 18%, rgba(245,122,18,.18), transparent 30rem), linear-gradient(135deg, #f8fafc 0%, #eefcf7 46%, #fff8ed 100%)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 }
        }
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.2s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
