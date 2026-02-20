/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { createMpaPlugin } from "vite-plugin-virtual-mpa";

// https://vite.dev/config/
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  build: {
    cssMinify: true,
    minify: true,
    outDir: "www",
  },
  plugins: [
    react(),
    tailwindcss(),
    createMpaPlugin({
      htmlMinify: true,
      template: "frontend/app/template.html",
      pages: [
        {
          name: "Main",
          filename: "index.html",
          entry: "/frontend/app/index.tsx",
          data: {
            templateTitle: "NSO Bridge",
            scriptPath: "frontend/app/index.tsx",
          },
        },
        {
          name: "Scoreboard",
          filename: "sb.html",
          entry: "/frontend/app/scoreboard.tsx",
          data: {
            templateTitle: "Scoreboard",
            scriptPath: "frontend/app/scoreboard.tsx",
          },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend"),
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
            configDir: path.join(dirname, ".storybook"),
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
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
