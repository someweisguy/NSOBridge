import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import path from "path";

const frontendDirectory = path.resolve(
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url)),
  "../frontend",
);

const config: StorybookConfig = {
  stories: [
    "../frontend/stories/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../frontend/features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "storybook-addon-mock-date",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
      builder: {
        viteConfigPath: path.resolve(
          frontendDirectory,
          "configs/vite.config.ts",
        ),
      },
    },
  },
};
export default config;
