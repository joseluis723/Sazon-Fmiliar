/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "brasa" - inspirada en carbon, mantequilla y comal caliente
        ink: {
          DEFAULT: "#1B1815", // carbon casi negro, no negro puro
          800: "#262220",
          700: "#332E2A",
        },
        paper: {
          DEFAULT: "#F6F1E4", // hueso calido, distinto del crema generico
          dim: "#EFE7D3",
        },
        ember: {
          DEFAULT: "#D8462B", // brasa / achiote - CTA principal
          600: "#C13B22",
          700: "#A22E19",
        },
        butter: {
          DEFAULT: "#F0A93B", // mantequilla / maiz tostado - acentos, "nuevo"
          600: "#D6901F",
        },
        herb: {
          DEFAULT: "#2F5D50", // verde salsa - estados "listo"/exito
          600: "#264C42",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        card: "0.9rem",
      },
      boxShadow: {
        ticket: "0 2px 0 0 rgba(27,24,21,0.08)",
      },
    },
  },
  plugins: [],
};
