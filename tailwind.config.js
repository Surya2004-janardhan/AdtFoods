/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.js", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B00", // orange
          light: "#FF8A3D",
          dark: "#E65100",
        },
        secondary: {
          DEFAULT: "#000000", // black
          light: "#303030",
        },
        accent: {
          DEFAULT: "#FFFFFF", // white
          off: "#F8F8F8",
          cream: "#FFF8EE",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        display: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
