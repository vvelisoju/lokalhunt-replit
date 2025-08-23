/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // LokalHunt brand colors extracted from logo
        primary: {
          50: "#eff8ff",
          100: "#daeeff",
          200: "#bee3ff",
          300: "#91d3ff",
          400: "#5db9ff",
          500: "#369dff",
          600: "#1976d2", // Primary blue from logo
          700: "#1565c0",
          800: "#1e5799",
          900: "#1e3a8a",
        },
        secondary: {
          50: "#fff8ed",
          100: "#ffeed4",
          200: "#ffdaa8",
          300: "#ffc071",
          400: "#ff9c38",
          500: "#ff7b12", // Primary orange from logo
          600: "#f05a08",
          700: "#c73e09",
          800: "#9e3610",
          900: "#7f2e10",
        },
        accent: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Accent blue
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Keep existing gray scale but add brand-specific grays
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #1976d2 0%, #ff7b12 100%)",
        "gradient-brand-light":
          "linear-gradient(135deg, #369dff 0%, #ff9c38 100%)",
        "gradient-brand-subtle":
          "linear-gradient(135deg, #eff8ff 0%, #fff8ed 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
