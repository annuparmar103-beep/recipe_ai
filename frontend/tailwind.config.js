/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4D7C0F', // Avocado Green
          dark: '#3F6212',    // Darker Avocado Green
        },
        secondary: '#3F6212',
        accent: '#F97316',    // Warm Tangerine
        background: '#F8FAFC', // Crisp Slate (replaced #F9F9F6)
        card: '#FFFFFF',
        // Redirect green classes to Avocado Green shades
        green: {
          50: '#F7FEE7',   // Lime 50
          100: '#ECFCCB',  // Lime 100
          150: '#D9F99D',  // Lime 150 (Lime 200 equivalent)
          200: '#D9F99D',
          500: '#4D7C0F',  // Avocado Green
          600: '#4D7C0F',
          700: '#3F6212',  // Dark Avocado Green
        },
        // Override default text and slate values with Charcoal Dark Slate
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1A2421',  // Charcoal Dark Slate
          850: '#1A2421',
          900: '#0F172A',
        }
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 8px -1px rgba(0, 0, 0, 0.03)',
        premium: '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.01)',
      }
    },
  },
  plugins: [],
}
