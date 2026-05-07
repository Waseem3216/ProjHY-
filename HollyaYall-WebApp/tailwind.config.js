/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bayou: {
          50: '#ecfdf8',
          100: '#d1faef',
          200: '#a7f3de',
          300: '#6ee7c8',
          400: '#2dd4aa',
          500: '#14b894',
          600: '#0d9479',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        sunrise: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316'
        },
        space: {
          900: '#111827',
          800: '#1f2937'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 118, 110, 0.12)',
        card: '0 12px 35px rgba(17, 24, 39, 0.08)'
      },
      backgroundImage: {
        'houston-grid': 'radial-gradient(circle at 1px 1px, rgba(15,118,110,.12) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};
