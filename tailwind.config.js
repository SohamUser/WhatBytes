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
        paper: {
          50: "#FFFDF7",
          100: "#F8F1DE",
          200: "#EADDBB",
          300: "#D8C6A7",
          500: "#8A6B2C",
        },
        cork: {
          100: "#E8D8BB",
          300: "#D8C6A7",
          500: "#A77C45",
          700: "#76552F",
        },
        ink: {
          500: "#78716C",
          700: "#57534E",
          900: "#292524",
        },
        accent: {
          50: "#FFF2EC",
          100: "#FBDDD0",
          500: "#C65D3B",
          600: "#AE4D30",
          700: "#8D3D27",
        },
        olive: {
          50: "#F3F5E9",
          200: "#DDE3BE",
          600: "#68723A",
          700: "#535D2E",
        },
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
