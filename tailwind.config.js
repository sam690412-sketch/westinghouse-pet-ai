/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // ============================================================
      // BRAND COLORS — Westinghouse Pet Taiwan
      // ============================================================
      colors: {
        // CSS variable-based semantic colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        // Westinghouse brand palette
        brand: {
          blue: "#0047AB",
          "blue-light": "#1E6FD9",
          "blue-dark": "#003380",
          navy: "#0A2540",
          white: "#FFFFFF",
          silver: "#C0C0C0",
          gray: "#6B7280",
        },
        // Pet-specific accent colors
        pet: {
          paw: "#FF8C42",
          "paw-light": "#FFB380",
          "paw-dark": "#E66E2E",
          mint: "#34D399",
          "mint-light": "#6EE7B7",
          rose: "#FB7185",
          "rose-light": "#FDA4AF",
          sky: "#38BDF8",
          "sky-light": "#7DD3FC",
        },
        // Semantic colors
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
          dark: "#047857",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
          dark: "#B45309",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
          dark: "#B91C1C",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          dark: "#1D4ED8",
        },
        // Neutral scale
        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0A0A0A",
        },
      },
      // ============================================================
      // TYPOGRAPHY
      // ============================================================
      fontFamily: {
        sans: [
          '"Noto Sans TC"',
          '"PingFang TC"',
          '"Microsoft JhengHei"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        display: [
          '"Noto Sans TC"',
          '"PingFang TC"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          '"Cascadia Code"',
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.1" }],
        "7xl": ["4.5rem", { lineHeight: "1.05" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      fontWeight: {
        thin: "100",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      // ============================================================
      // SPACING
      // ============================================================
      spacing: {
        0: "0px",
        0.5: "0.125rem",
        1: "0.25rem",
        1.5: "0.375rem",
        2: "0.5rem",
        2.5: "0.625rem",
        3: "0.75rem",
        3.5: "0.875rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        11: "2.75rem",
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
        18: "4.5rem",
        20: "5rem",
        24: "6rem",
        28: "7rem",
        32: "8rem",
        36: "9rem",
        40: "10rem",
        44: "11rem",
        48: "12rem",
        52: "13rem",
        56: "14rem",
        60: "15rem",
        64: "16rem",
        72: "18rem",
        80: "20rem",
        96: "24rem",
        128: "32rem",
      },
      // ============================================================
      // BORDER RADIUS
      // ============================================================
      borderRadius: {
        none: "0px",
        xs: "2px",
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
        full: "9999px",
      },
      // ============================================================
      // SHADOWS
      // ============================================================
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        sm: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
        DEFAULT:
          "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.2)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        // Brand-specific shadows
        "card": "0 2px 8px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)",
        "card-hover": "0 8px 24px 0 rgb(0 0 0 / 0.1), 0 2px 8px 0 rgb(0 0 0 / 0.06)",
        "button": "0 1px 3px 0 rgb(0 71 171 / 0.15)",
        "button-hover": "0 4px 12px 0 rgb(0 71 171 / 0.25)",
        "dropdown": "0 10px 38px -10px rgb(0 0 0 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.08)",
        "sticky-cta": "0 -4px 20px 0 rgb(0 0 0 / 0.1)",
        "focus": "0 0 0 3px rgb(37 99 235 / 0.25)",
      },
      // ============================================================
      // Z-INDEX
      // ============================================================
      zIndex: {
        hide: "-1",
        base: "0",
        docked: "10",
        dropdown: "1000",
        sticky: "1100",
        banner: "1200",
        overlay: "1300",
        modal: "1400",
        popover: "1500",
        skipLink: "1600",
        toast: "1700",
        tooltip: "1800",
      },
      // ============================================================
      // KEYFRAMES & ANIMATION — Motion System
      // ============================================================
      keyframes: {
        // Accordion
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Fade
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        // Slide
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-top": {
          from: { transform: "translateY(-20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        // Scale
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        // Skeleton
        "skeleton": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        // Pulse
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        // Spin
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        // Bounce
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        // Shake (error)
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        // Caret blink
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        // Existing
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        // New motion system
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.15s ease-in",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-out-right": "slide-out-right 0.2s ease-in",
        "slide-in-bottom": "slide-in-bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-top": "slide-in-top 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-out": "scale-out 0.15s ease-in",
        "skeleton": "skeleton 1.5s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "spin-slow": "spin-slow 3s linear infinite",
        "bounce-subtle": "bounce-subtle 1s ease-in-out infinite",
        "shake": "shake 0.5s ease-in-out",
      },
      // ============================================================
      // TRANSITIONS
      // ============================================================
      transitionDuration: {
        0: "0ms",
        50: "50ms",
        100: "100ms",
        150: "150ms",
        200: "200ms",
        250: "250ms",
        300: "300ms",
        350: "350ms",
        400: "400ms",
        500: "500ms",
        600: "600ms",
        700: "700ms",
        800: "800ms",
        900: "900ms",
        1000: "1000ms",
      },
      transitionTimingFunction: {
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-expo": "cubic-bezier(0.7, 0, 0.84, 0)",
        "ease-out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      // ============================================================
      // ASPECT RATIO
      // ============================================================
      aspectRatio: {
        "4/3": "4 / 3",
        "3/4": "3 / 4",
        "16/9": "16 / 9",
        "21/9": "21 / 9",
        "1/1": "1 / 1",
        product: "4 / 5",
        hero: "16 / 9",
        card: "3 / 4",
        banner: "21 / 9",
      },
      // ============================================================
      // MAX WIDTH (container)
      // ============================================================
      maxWidth: {
        xs: "20rem",
        sm: "24rem",
        md: "28rem",
        lg: "32rem",
        xl: "36rem",
        "2xl": "42rem",
        "3xl": "48rem",
        "4xl": "56rem",
        "5xl": "64rem",
        "6xl": "72rem",
        "7xl": "80rem",
        container: "1280px",
        "container-lg": "1440px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
