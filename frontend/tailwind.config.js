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
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 1s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(-5px)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'luxury': '0 4px 14px 0 rgba(139, 69, 19, 0.15)',
        'luxury-lg': '0 10px 25px -3px rgba(139, 69, 19, 0.2), 0 4px 6px -2px rgba(139, 69, 19, 0.1)',
        'luxury-xl': '0 20px 40px -4px rgba(139, 69, 19, 0.25)',
        '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(184, 134, 11, 0.3)',
        'glow-lg': '0 0 40px rgba(184, 134, 11, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}