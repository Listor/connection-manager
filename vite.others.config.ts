import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false, // Don't empty since we're building in parts
    rollupOptions: {
      input: {
        background: "src/background/service-worker.ts",
        options: "src/options/options.ts",
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background")
            return "src/background/service-worker.js";
          if (chunk.name === "options") return "src/options/options.js";
          return "assets/[name].js";
        },
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            if (assetInfo.name?.includes("shared")) {
              return "src/styles/shared.css";
            }
            return "src/options/options.css";
          }
          return "assets/[name][extname]";
        },
        format: "es",
      },
    },
  },
  publicDir: "public",
  resolve: {
    alias: {
      "@types": "/src/types",
      "@db": "/src/types/db",
      "@content": "/src/content",
      "@scoring": "/src/scoring",
      "@i18n": "/src/types/i18n",
      "@utils": "/src/utils",
    },
  },
});
