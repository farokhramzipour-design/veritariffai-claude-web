import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1440px",
    },
    extend: {
      backgroundImage: {
        'grid-pattern': "linear-gradient(var(--color-border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-subtle) 1px, transparent 1px)",
        'mesh-gradient': "radial-gradient(ellipse at 20% 50%, rgba(0, 200, 150, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(77, 171, 247, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(192, 132, 252, 0.08) 0%, transparent 50%)",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-persian)", "sans-serif"],
        body: ["var(--font-body)", "var(--font-persian)", "sans-serif"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          hover: "var(--color-brand-hover)",
        },
        accent: {
          warning: "var(--color-accent-warning)",
        },
        bg: {
          canvas: "var(--color-bg-canvas)",
          surface: "var(--color-bg-surface)",
          elevated: "var(--color-bg-elevated)",
          input: "var(--color-bg-input)",
          hover: "var(--color-bg-hover)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
          default: "var(--color-border-default)",
          strong: "var(--color-border-strong)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          brand: "var(--color-text-brand)",
          error: "var(--color-text-error)",
        },
        data: {
          duty: "var(--color-data-duty)",
          vat: "var(--color-data-vat)",
          freight: "var(--color-data-freight)",
          excise: "var(--color-data-excise)",
          goods: "var(--color-data-goods)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      spacing: {
        "1": "var(--space-1)", "2": "var(--space-2)", "3": "var(--space-3)", "4": "var(--space-4)", "5": "var(--space-5)", "6": "var(--space-6)", "8": "var(--space-8)", "10": "var(--space-10)", "12": "var(--space-12)", "16": "var(--space-16)", "20": "var(--space-20)", "24": "var(--space-24)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        brand: "var(--shadow-brand)",
        glow: "var(--shadow-glow)",
      },
    },
  },
  plugins: [],
};
export default config;
