/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        graham: {
          blue: "#0A6EB0",
          accent: "#FF9F1C",
          green: "#10B981",
          dark: "#1F2937",
          light: "#F9FAFB",
          muted: "#6B7280",
        },
      },
    },
  },
  plugins: [],
};
