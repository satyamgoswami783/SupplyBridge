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
        // High-end primary palette
        primary: {
          50:  '#f0f3ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b',
          950: '#0f0e26',
        },
        // Aurora Violet
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Cyber Cyan
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        // Vibrant Emerald
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Warm Amber
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Coral Rose
        rose: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Dark Obsidian Sidebar
        sidebar: {
          bg:         '#090d16',
          surface:    '#111827',
          hover:      '#1f2937',
          active:     '#4f46e5',
          border:     '#1e293b',
          text:       '#94a3b8',
          textActive: '#ffffff',
        },
        // Modern SaaS Surfaces
        surface: {
          bg:      '#f6f8fd',
          card:    '#ffffff',
          border:  '#e2e8f0',
          hover:   '#f1f5f9',
        },
        dark: {
          bg:     '#090d16',
          card:   '#111827',
          border: '#1f2937',
          hover:  '#374151',
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
        'card':       '0 2px 10px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.02)',
        'card-md':    '0 8px 24px -4px rgba(79, 70, 229, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'card-lg':    '0 20px 35px -8px rgba(79, 70, 229, 0.14), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
        'glow-primary': '0 0 25px rgba(99, 102, 241, 0.35)',
        'glow-cyan':    '0 0 25px rgba(6, 182, 212, 0.35)',
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.35)',
        'glow-rose':    '0 0 25px rgba(244, 63, 94, 0.30)',
      },
      backgroundImage: {
        'gradient-aurora':  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-cyan':    'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-amber':   'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #0e1424 0%, #070a12 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 3s linear infinite',
        'fade-in':    'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
