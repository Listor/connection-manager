import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-polyfill",
      writeBundle() {
        // Copy webextension-polyfill to the build directory
        const distDir = "dist-firefox";
        const nodeModulesDir = "node_modules/webextension-polyfill/dist";

        try {
          mkdirSync(
            join(distDir, "node_modules", "webextension-polyfill", "dist"),
            { recursive: true }
          );
          copyFileSync(
            join(nodeModulesDir, "browser-polyfill.min.js"),
            join(
              distDir,
              "node_modules",
              "webextension-polyfill",
              "dist",
              "browser-polyfill.min.js"
            )
          );
        } catch (error) {
          console.warn("Could not copy webextension-polyfill:", error);
        }
      },
    },
  ],
  build: {
    outDir: "dist-firefox",
    emptyOutDir: true,
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
        assetFileNames: "assets/[name][extname]",
        format: "es",
      },
    },
  },
  publicDir: "public-firefox",
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
