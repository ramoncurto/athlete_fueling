const preset = {
  darkMode: "class" as const,
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        accent: {
          500: "#f97316",
          600: "#ea580c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui"],
      },
      boxShadow: {
        focus: "0 0 0 4px rgba(14, 165, 233, 0.35)",
      },
    },
  },
  plugins: [],
};

export default preset;
