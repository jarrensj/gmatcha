import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'cream': {
  				DEFAULT: 'hsl(var(--cream))',
  				dark: 'hsl(var(--cream-dark))'
  			},
  			'charcoal': {
  				DEFAULT: 'hsl(var(--charcoal))',
  				light: 'hsl(var(--charcoal-light))',
  				lighter: 'hsl(var(--charcoal-lighter))'
  			},
  			'matcha': {
  				subtle: 'hsl(var(--matcha-subtle))',
  				muted: 'hsl(var(--matcha-muted))',
  				accent: 'hsl(var(--matcha-accent))'
  			},
  			'brown': {
  				subtle: 'hsl(var(--brown-subtle))',
  				muted: 'hsl(var(--brown-muted))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			'zen': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  		},
  		letterSpacing: {
  			'zen': '0.02em',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
