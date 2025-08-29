import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { createMpaPlugin } from "vite-plugin-virtual-mpa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createMpaPlugin({
      htmlMinify: true,
      template: "src/app/template.html",
      pages: [
        {
          name: "Main",
          filename: "index.html",
          entry: "/src/app/main.tsx",
          data: {
            scriptPath: `src/app/main.tsx`,
          },
        },
        {
          name: "Scoreboard",
          filename: "sb.html",
          entry: "/src/app/scoreboard.tsx",
          data: {
            scriptPath: `src/app/scoreboard.tsx`,
          },
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
