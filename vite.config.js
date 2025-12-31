import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 40px rgba(168,85,247,.25), 0 0 120px rgba(59,130,246,.18)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: { floaty: "floaty 6s ease-in-out infinite" },
    },
  },
})
