/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#FF6B35', dark: '#E85C2A', light: '#FF8C5A' },
        sidebar: '#1A202C',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 40px -5px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}
