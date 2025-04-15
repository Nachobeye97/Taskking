import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"], // Modo oscuro activado por clase
  content: [
    "./pages/**/*.{ts,tsx}", // Asegúrate de que todas las rutas sean correctas
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "", // No añadimos un prefijo a las clases de Tailwind
  theme: {
    container: {
      center: true, // Centra los contenedores por defecto
      padding: "2rem",
      screens: {
        "2xl": "1400px", // Añade configuraciones para pantallas grandes
      },
    },
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
      },
      borderRadius: {
        lg: "var(--radius)", // Bordes grandes
        md: "calc(var(--radius) - 2px)", // Bordes medianos
        sm: "calc(var(--radius) - 4px)", // Bordes pequeños
      },
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
        "accordion-down": "accordion-down 0.2s ease-out", // Animación de apertura
        "accordion-up": "accordion-up 0.2s ease-out", // Animación de cierre
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Plugin para animaciones
    // Asegúrate de que DaisyUI está correctamente instalado si lo usas
    require("daisyui"),
  ],
};

export default config;
