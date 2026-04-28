/// <reference types="vitest/config" />
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "vite";

const frontendDirectory = path.resolve(
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url)),
  "../",
);
const projectDirectory = path.resolve(frontendDirectory, "../");

export default defineConfig({
  root: frontendDirectory,
  publicDir: path.resolve(projectDirectory, "public"),
  build: {
    cssMinify: true,
    minify: true,
    outDir: path.resolve(projectDirectory, "www"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(frontendDirectory, "index.html"),
        sb: path.resolve(frontendDirectory, "sb.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Returns the package name as the chunk name
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": frontendDirectory,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.resolve(frontendDirectory, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
});
