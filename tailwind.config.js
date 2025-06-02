/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(79, 111, 82)',
          light: 'rgb(163, 193, 138)',
          dark: 'rgb(24, 62, 45)',
        },
        secondary: {
          DEFAULT: 'rgb(194, 125, 56)',
          light: 'rgb(225, 216, 195)',
          dark: 'rgb(75, 66, 58)',
        },
        background: 'rgb(245, 242, 231)',
        foreground: 'rgb(51, 51, 51)',
        accent: 'rgb(201, 226, 101)',
      },
      fontFamily: {
        heading: ['var(--font-playfair)'],
        body: ['var(--font-montserrat)'],
        accent: ['var(--font-poppins)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mushroom-pattern': "url('/images/mushroom-pattern.png')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
