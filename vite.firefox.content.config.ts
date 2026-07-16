import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist-firefox",
    emptyOutDir: false, // Don't empty since we're building in parts
    rollupOptions: {
      input: "src/content/content.ts",
      output: {
        entryFileNames: "src/content/content.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "src/styles/shared.css";
          }
          return "assets/[name][extname]";
        },
        format: "iife",
        name: "ConnectionManager",
        globals: {},
      },
    },
  },
  resolve: {
    alias: {
      "@types": "/src/types",
      "@db": "/src/types/db",
      "@content": "/src/content",
      "@scoring": "/src/scoring",
      "@i18n": "/src/types/i18n",
      "@utils": "/src/utils",
      "@styles": "/src/styles",
    },
  },
});
