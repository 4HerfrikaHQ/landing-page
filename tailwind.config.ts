import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./app/**/*.tsx",
		"./components/**/*.tsx",
		"./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
		"./node_modules/@premieroctet/next-admin/dist/**/*.{js,ts,jsx,tsx}",
		"./slices/**/*.{js,ts,jsx,tsx,mdx}",
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
			keyframes: {
				marquee: {
					"0%": { transform: "translateX(0%)" },
					"100%": { transform: "translateX(-100%)" },
				},
				marquee2: {
					"0%": { transform: "translateX(100%)" },
					"100%": { transform: "translateX(0%)" },
				},
			},
			maxWidth: {
				"9xl": "72rem",
			},
			animation: {
				marquee: "marquee var(--animation-duration, 25s) linear infinite",
				marquee2: "marquee2 var(--animation-duration, 25s) linear infinite",
			},
			colors: {
				primary: {
					100: "rgb(var(--primary-100) / <alpha-value>)",
					200: "rgb(var(--primary-200) / <alpha-value>)",
					300: "rgb(var(--primary-300) / <alpha-value>)",
					400: "rgb(var(--primary-400) / <alpha-value>)",
					500: "rgb(var(--primary-500) / <alpha-value>)",
				},
				secondary: {
					100: "rgb(var(--secondary-100) / <alpha-value>)",
					200: "rgb(var(--secondary-200) / <alpha-value>)",
					300: "rgb(var(--secondary-300) / <alpha-value>)",
					400: "rgb(var(--secondary-400) / <alpha-value>)",
					500: "rgb(var(--secondary-500) / <alpha-value>)",
				},
				neutral: {
					100: "rgb(var(--neutral-100) / <alpha-value>)",
					200: "rgb(var(--neutral-200) / <alpha-value>)",
					300: "rgb(var(--neutral-300) / <alpha-value>)",
					400: "rgb(var(--neutral-400) / <alpha-value>)",
					500: "rgb(var(--neutral-500) / <alpha-value>)",
				},
				gray: {
					400: "rgb(var(--gray-400) / <alpha-value>)",
					300: "rgb(var(--gray-300) / <alpha-value>)",
				},
				nextadmin: {
					brand: {
						default: "rgb(var(--primary-500) / <alpha-value>)",
						emphasis: "rgb(var(--primary-400) / <alpha-value>)",
						subtle: "rgb(var(--primary-500) / <alpha-value>)",
					},
					menu: {
						default: "rgb(var(--primary-500) / <alpha-value>)",
						emphasis: "rgb(var(--primary-400) / <alpha-value>)",
						muted: "rgb(var(--neutral-500) / <alpha-value>)",
					},
				},
				get "dark-nextadmin"() {
					return {
						// @ts-expect-error - this is a getter
						...this.nextadmin,
						menu: {
							default: "rgb(var(--neutral-500) / <alpha-value>)",
							emphasis: "rgb(var(--neutral-400) / <alpha-value>)",
						},
					};
				},
			},
		},
	},
	plugins: [],
};
export default config;
