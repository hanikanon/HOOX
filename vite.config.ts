import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";

// Plain client-side SPA build for Capacitor. The original project used
// TanStack Start (SSR + Nitro), which needs a Node server at runtime.
// Capacitor loads static files into a WebView with no server, so this keeps
// TanStack Router (file-based routes under src/routes/) but drops the SSR
// layer — same routes, same components, same animations, just rendered
// entirely client-side.
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 5173,
  },
});
