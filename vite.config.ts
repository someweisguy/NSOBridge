import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { createMpaPlugin } from "vite-plugin-virtual-mpa";

// https://vite.dev/config/
export default defineConfig({
  build: {
    minify: false,
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
          entry: "/frontend/app/main.tsx",
          data: {
            templateTitle: "NSO Bridge",
            scriptPath: "frontend/app/main.tsx",
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
});
