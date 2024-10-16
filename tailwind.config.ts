import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.tsx",
    "./components/**/*.tsx",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@premieroctet/next-admin/dist/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("@premieroctet/next-admin/preset")],
  theme: {
    extend: {
      backgroundImage: {
        // TODO: Change overlay gradient to a variable (switch the colors)
        "overlay-gradient":
          "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
      },
      backgroundSize: {
        hero: "200px, 100%",
      },
      colors: {
        primary: {
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
        },
        secondary: {
          100: "var(--secondary-100)",
          200: "var(--secondary-200)",
          300: "var(--secondary-300)",
          400: "var(--secondary-400)",
          500: "var(--secondary-500)",
        },
        neutral: {
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
        },
        gray: {
          400: "var(--gray-400)",
          300: "var(--gray-300)",
        },
        nextadmin: {
          brand: {
            default: "var(--primary-500)",
            emphasis: "var(--primary-400)",
            subtle: "var(--primary-500)",
          },
          menu: {
            default: "var(--primary-500)",
            emphasis: "var(--primary-400)",
            muted: "var(--neutral-500)",
          },
        },
        get "dark-nextadmin"() {
          return {
            // @ts-expect-error - this is a getter
            ...this.nextadmin,
            menu: {
              default: "var(--neutral-500)",
              emphasis: "var(--neutral-400)",
            },
          };
        },
      },
    },
  },
  plugins: [],
};
export default config;
