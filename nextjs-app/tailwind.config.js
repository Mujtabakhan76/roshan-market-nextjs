/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: "#f2faf6",
          100: "#e2f5ea",
          500: "#3fa373",
          600: "#2f8a60",
          700: "#256e4d",
        },
        blue: {
          500: "#2f6fb0",
          600: "#25588c",
        },
        ink: "#173226",
        inksoft: "#4d6b5c",
        paper: "#f6faf8",
        border2: "rgba(23,50,38,0.10)",
        red2: "#c0392b",
        redbg: "#fdecea",
        greenbg: "#e6f6ec",
      },
      fontFamily: {
        nastaliq: ["var(--font-nastaliq)", "serif"],
        naskh: ["var(--font-naskh)", "sans-serif"],
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
};
