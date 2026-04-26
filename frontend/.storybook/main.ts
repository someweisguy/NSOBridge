// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendDirectory = path.resolve(
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url)),
  "../",
);
const projectDirectory = path.resolve(frontendDirectory, "../");

const config: StorybookConfig = {
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
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding", // TODO: Remove when ready
    "storybook-addon-mock-date",
    "storybook-addon-deep-controls",
    "storybook-dark-mode",
  ],
  stories: [
    "../stories/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../features/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  staticDirs: [path.resolve(projectDirectory, "public")],
};
export default config;
