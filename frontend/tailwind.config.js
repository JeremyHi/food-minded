/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Health/Wellness theme colors
        primary: {
          50: '#f0f7f1',
          100: '#d8ead9',
          200: '#b3d6b6',
          300: '#87a878',
          400: '#5d8a60',
          500: '#2d5a3d',
          600: '#244a32',
          700: '#1c3a27',
          800: '#142a1c',
          900: '#0c1a11',
        },
        secondary: {
          50: '#fdf6f3',
          100: '#fae9e2',
          200: '#f4d0c2',
          300: '#e8a98e',
          400: '#c67b5c',
          500: '#a85a3a',
          600: '#8a4730',
          700: '#6c3726',
          800: '#4e281c',
          900: '#301912',
        },
        cream: '#F8F5F0',
        charcoal: '#2C2C2C',
        sage: '#87A878',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
