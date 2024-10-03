import tailwind_animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx,jsx,js}",
    "./components/**/*.{ts,tsx,jsx,js}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      screens: {
        "2xs": "360px",
        xs: "480px",
      },
    },
  },
  plugins: [
    tailwind_animate,

    // workaround for @starting-style, should be remove when tailwind v4 (stable) is released. (tailwind v4-alpha already provided this functionality)
    // source: https://github.com/tailwindlabs/tailwindcss/discussions/12039#discussioncomment-10063510
    /** @type {import('tailwindcss/types/config').PluginCreator} */
    ({ addVariant }) => {
      addVariant("starting", "@starting-style");
    },
  ],
};
