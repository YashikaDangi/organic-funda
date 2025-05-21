import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        pacifico: ['var(--font-pacifico)', 'cursive'],
      },
      colors: {
        forest: '#264A33',
        accent: '#BFD88F', // underline color
      },
    },
  },
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
}
export default config
