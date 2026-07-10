import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Milarex brand tokens
        navy: {
          DEFAULT: '#00284D',
          900: '#021526',
          800: '#03203B',
          700: '#063457',
        },
        ink: '#02060D', // deep space background
        sea: '#2EC5C5', // morski accent
        green: '#34D399', // operational green
        gold: '#D6BF91', // premium Milarex gold
        mist: '#9DB4CC', // muted label blue-grey
        paper: '#F2F7FC', // off-white
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'slide-kicker': ['clamp(0.8125rem, 0.75rem + 0.35vw, 1rem)', { lineHeight: '1.4' }],
        'slide-body': ['clamp(1.125rem, 1rem + 0.55vw, 1.375rem)', { lineHeight: '1.55' }],
        'slide-title': ['clamp(1.625rem, 1.4rem + 0.9vw, 2rem)', { lineHeight: '1.25' }],
        'slide-display': ['clamp(2.5rem, 2rem + 2vw, 3.5rem)', { lineHeight: '1.1' }],
        'slide-takeaway': ['clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)', { lineHeight: '1.45' }],
        'slide-caption': ['clamp(0.8125rem, 0.75rem + 0.3vw, 1rem)', { lineHeight: '1.4' }],
      },
      letterSpacing: {
        eyebrow: '0.34em',
      },
      boxShadow: {
        panel: '0 24px 80px -24px rgba(0,0,0,0.75)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
