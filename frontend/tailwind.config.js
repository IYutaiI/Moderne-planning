/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lol-blue': {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0073e6',
          600: '#005bb3',
          700: '#004280',
          800: '#002a4d',
          900: '#00111a',
        },
        'lol-gold': {
          50: '#fff9e6',
          100: '#ffecb3',
          200: '#ffdf80',
          300: '#ffd24d',
          400: '#ffc61a',
          500: '#e6ac00',
          600: '#b38600',
          700: '#806000',
          800: '#4d3a00',
          900: '#1a1300',
        },
        'lol-dark': {
          50: '#f2f2f3',
          100: '#d9d9db',
          200: '#bfbfc2',
          300: '#a6a6aa',
          400: '#8c8c91',
          500: '#737378',
          600: '#59595e',
          700: '#404044',
          800: '#26262a',
          900: '#0d0d10',
          950: '#010a13',
        }
      },
      fontFamily: {
        'gaming': ['Beaufort for LOL', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'lol-gradient': 'linear-gradient(135deg, #010a13 0%, #0a1628 50%, #091428 100%)',
      }
    },
  },
  plugins: [],
}
