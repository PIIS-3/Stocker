/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef8f6',
          100: '#d5ede8',
          200: '#aedbd4',
          300: '#7fc4b7',
          400: '#5BA095',
          500: '#4a8a80',
          600: '#3b6f67',
          700: '#335a53',
          800: '#2c4944',
          900: '#273d3a',
          DEFAULT: '#5BA095',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
