// vite.config.ts
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { mochaPlugins } from "@getmocha/vite-plugins";

export default defineConfig({
  plugins: [
    ...mochaPlugins(process.env as any),
    react(),
  ],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 5000,
  },

  resolve: {
    alias: [
      // This exact order + format is what finally fixes the red squiggles
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "@/shared", replacement: path.resolve(__dirname, "./src/shared") },
      { find: "@/components", replacement: path.resolve(__dirname, "./src/react-app/components") },
      { find: "@/pages", replacement: path.resolve(__dirname, "./src/react-app/pages") },
    ],
  },
});