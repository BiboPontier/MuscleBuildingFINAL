import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#08090b',
          900: '#0d0f12',
          850: '#121418',
          800: '#191c21',
          700: '#24272e',
          600: '#33373f',
          500: '#4b505a',
          400: '#71767f',
          300: '#9aa0aa',
          200: '#c4c8cf',
          100: '#e6e8ec',
        },
        electric: {
          600: '#1d4ed8',
          500: '#2563ff',
          400: '#4d7bff',
          300: '#7d9fff',
          glow: '#3b6bff',
        },
        success: '#22c55e',
        warning: '#f5a524',
        danger: '#f5455c',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)',
        glow: '0 0 0 1px rgba(37,99,255,0.4), 0 0 24px rgba(37,99,255,0.25)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
