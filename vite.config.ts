import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("/node_modules/react/") ||
              id.includes("/node_modules/react-dom/") ||
              id.includes("/node_modules/react-router-dom/") ||
              id.includes("/node_modules/@tanstack/react-query/") ||
              id.includes("/node_modules/next-themes/") ||
              id.includes("/node_modules/sonner/")
            ) {
              return "react-vendor";
            }
            if (
              id.includes("/node_modules/leaflet/") ||
              id.includes("/node_modules/react-leaflet/") ||
              id.includes("/node_modules/leaflet.heat/")
            ) {
              return "map-vendor";
            }
            if (
              id.includes("/node_modules/recharts/") ||
              id.includes("/node_modules/date-fns/")
            ) {
              return "chart-vendor";
            }
            if (id.includes("/node_modules/framer-motion/")) {
              return "motion-vendor";
            }
          }
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
