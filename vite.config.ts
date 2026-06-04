import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectRegister: false,
      includeAssets: ["favicon.ico", "robots.txt", "icons/apple-touch-icon.png"],
      manifest: {
        name: "AirQualityVN — Theo dõi chất lượng không khí Việt Nam",
        short_name: "AirQualityVN",
        description:
          "Theo dõi chất lượng không khí thời gian thực tại Việt Nam, cảnh báo và dự báo AQI.",
        lang: "vi",
        theme_color: "#0a0e1a",
        background_color: "#0a0e1a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["weather", "health", "utilities"],
        shortcuts: [
          {
            name: "So sánh trạm",
            short_name: "So sánh",
            description: "Đối chiếu AQI 24h giữa nhiều trạm",
            url: "/compare",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Cài đặt cảnh báo",
            short_name: "Cảnh báo",
            description: "Quản lý rule cảnh báo cá nhân",
            url: "/settings/alerts",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
          {
            name: "Lịch sử cảnh báo",
            short_name: "Lịch sử",
            description: "Xem các cảnh báo gần đây",
            url: "/alerts",
            icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
          },
        ],
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ].filter(Boolean),
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
