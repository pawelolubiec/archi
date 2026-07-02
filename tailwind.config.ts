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
