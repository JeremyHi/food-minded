/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, natural palette for women/family-focused wellness
        primary: {
          50: '#fef7f4',
          100: '#fceee8',
          200: '#f9d9cc',
          300: '#f3b89e',
          400: '#e8936b',
          500: '#D97757', // Warm terracotta - energetic but soft
          600: '#c45f3f',
          700: '#a34a2f',
          800: '#833a24',
          900: '#6b301d',
        },
        secondary: {
          50: '#f4f7f4',
          100: '#e5ebe5',
          200: '#c8d6c8',
          300: '#a3b9a3',
          400: '#7d9c7d',
          500: '#6B8E6B', // Sage green - health, nature, calm
          600: '#567256',
          700: '#435943',
          800: '#354535',
          900: '#2a382a',
        },
        cream: '#FBF8F4', // Warm cream background
        charcoal: '#3D3D3D', // Warm charcoal text
        accent: {
          50: '#fdf9f0',
          100: '#faf1d8',
          200: '#f4e2b0',
          300: '#e8cc7d',
          400: '#d4b058',
          500: '#C9A962', // Soft gold accent
          600: '#a88c4d',
          700: '#876f3c',
          800: '#6b5730',
          900: '#574727',
        },
        sage: '#87A878',
      },
      fontFamily: {
        display: ['DM Serif Display', 'Georgia', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(61, 61, 61, 0.06)',
        'medium': '0 8px 30px rgba(61, 61, 61, 0.10)',
        'warm': '0 4px 24px rgba(217, 119, 87, 0.15)',
      },
    },
  },
  plugins: [],
}
