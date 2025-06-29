/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Luxury Tiramisu Brand Colors
        luxury: {
          cream: {
            50: '#FEFCF8',
            100: '#FDF9F1',
            200: '#F9F0E2',
            300: '#F5F1E8',
            400: '#E8DDD4',
            500: '#D4C2A8',
            600: '#C4A882',
            700: '#A8905F',
            800: '#8A7248',
            900: '#6B5B37',
          },
          gold: {
            50: '#FEF7E0',
            100: '#FDECC2',
            200: '#FAD785',
            300: '#F7C142',
            400: '#F0A90A',
            500: '#B8860B',
            600: '#996F0A',
            700: '#7A5808',
            800: '#5C4206',
            900: '#3E2C04',
          },
          brown: {
            50: '#F7F3F0',
            100: '#E8DDD6',
            200: '#D1BAA8',
            300: '#B8967A',
            400: '#9F734C',
            500: '#8B4513',
            600: '#73370F',
            700: '#5B2A0C',
            800: '#431F09',
            900: '#2F1B14',
          },
          warm: {
            50: '#FDF6F0',
            100: '#FAEAE0',
            200: '#F4D5C1',
            300: '#EDB896',
            400: '#E69B6B',
            500: '#D2691E',
            600: '#B8571A',
            700: '#9F4515',
            800: '#7D3410',
            900: '#5A240B',
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}