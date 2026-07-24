import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Blue accent
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#2563eb',
        },
        // Purple accent
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Cyan accent
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // Emerald accent
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Amber accent
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Rose for errors
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Sidebar
        sidebar: {
          bg:      '#0f172a',
          hover:   '#1e293b',
          active:  '#1d2d50',
          border:  '#1e293b',
          text:    '#94a3b8',
          textActive: '#f8fafc',
        },
        // Surfaces
        surface: {
          bg:      '#f8fafc',
          card:    '#ffffff',
          border:  '#e2e8f0',
          hover:   '#f1f5f9',
        },
        // Dark mode surfaces
        dark: {
          bg:     '#0f172a',
          card:   '#1e293b',
          border: '#334155',
          hover:  '#2d3f57',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      boxShadow: {
        'card':     '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'card-md':  '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
        'card-lg':  '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
        'glow-primary': '0 0 20px rgba(79,70,229,0.25)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.25)',
        'glow-rose':    '0 0 20px rgba(244,63,94,0.20)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-cyan':    'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-amber':   'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'gradient-surface': 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
