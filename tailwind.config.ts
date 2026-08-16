import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: '#956AD6',
        pink: '#F179B8',
        lavender: '#E8DFEB',
        gold: '#F0BD74',
        teal: '#70C2B4',
        cyan: '#D7F9FA',
        sage: '#A4C3A2',
        terracotta: '#B85B56',
        bgdeep: '#130f1c',
        ink: '#f4f0fa',
        inkdim: '#b7aec9',
        inkfaint: '#8b81a1',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        lg2: '26px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;
