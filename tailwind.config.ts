import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        rose: {
          50:  '#FDF2F2',
          100: '#FCE4E4',
          200: '#F9C9CA',
          300: '#F4A4A7',
          400: '#ED7278',
          500: '#E2626E',  // 브랜드 포인트
          600: '#CC3D4A',
          700: '#AB2F3A',
          800: '#8F2932',
          900: '#78262F',
        },
      },
    },
  },
  plugins: [],
};

export default config;
