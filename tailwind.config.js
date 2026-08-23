/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surface: "#F7F7FC",
        brand: {
          50: "#F1F1FF",
          100: "#E4E4FF",
          200: "#CACBFF",
          500: "#6C6EF5",
          600: "#5A5CEB",
          700: "#494BD1",
          800: "#3D3EAD",
          900: "#34358A",
        },
        danger: {
          50: "#FEF2F2",
          200: "#FECACA",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
        },
        warning: {
          50: "#FFFBEB",
          200: "#FDE68A",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
        },
      },
    },
  },
  plugins: [],
};
