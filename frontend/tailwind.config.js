/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FinTrust Brand Colors
        primary: {
          50: '#f0f4f7',
          100: '#e1eaef',
          200: '#c2d5df',
          300: '#a4c0cf',
          400: '#8a70ff', // Vivid Lavender
          500: '#7c65e8',
          600: '#6d5ac2',
          700: '#5e4f9c',
          800: '#4f4476',
          900: '#403950',
        },
        dark: {
          50: '#f5f6f7',
          100: '#ebecef',
          200: '#d7dae2',
          300: '#c3c8d6',
          400: '#8a9aad',
          500: '#556b84',
          600: '#3d4d5c',
          700: '#2b3643',
          800: '#1b2b33', // Deep Petrol
          900: '#0d1317', // Obsidian Slate
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        alert: '#E87A5D', // Modern Terracotta
        neutral: '#F9F7F2', // Digital Beige
      },
      fontFamily: {
        display: ['Satoshi', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', '16px'],
        'sm': ['14px', '20px'],
        'base': ['16px', '24px'],
        'lg': ['18px', '28px'],
        'xl': ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '36px'],
        '4xl': ['36px', '43px'],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(27, 43, 51, 0.1)',
      },
    },
  },
  plugins: [],
}
