import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      
      colors: {
        forest: "#1D4228",
        leaf: "#A3C18A",
        parchment: "#F5F2E7",
        beige: "#EDE6DB",
        brown: "#C27D38",
      },
      fontFamily: {
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
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
