import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "next/link": path.resolve(__dirname, "src/next-shims/link.tsx"),
      "next/image": path.resolve(__dirname, "src/next-shims/image.tsx"),
      "next/navigation": path.resolve(__dirname, "src/next-shims/navigation.ts"),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
})

