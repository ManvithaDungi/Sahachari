/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F7FF',
        primary: '#6D5BD0',
        secondary: '#9B8EC4',
        accent: '#B8D4BE',
        surface: 'rgba(255, 255, 255, 0.7)',
        text: {
          primary: '#1E1B2E', // Deep slate
          secondary: '#6B6580', // Muted lavender-grey
        },
        warning: '#C4956A',
        danger: '#B5756B',
        border: 'rgba(109, 91, 208, 0.12)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(109,91,208,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
