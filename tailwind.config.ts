import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080b14',
        surface: '#0f1629',
        card: '#0f1629',
        accent: '#4f8ef7',
        purple: '#a855f7',
        'text-primary': '#f0f4ff',
        muted: '#6b7a9e',
        border: '#1e2d4a',
        success: '#22c55e',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(79,142,247,0.15)',
        'glow-purple': '0 0 40px rgba(168,85,247,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
