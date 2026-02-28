import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../frontend/stories/**/*.mdx",
    "../frontend/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "storybook-addon-mock-date",
  ],
  framework: "@storybook/react-vite",
};
export default config;
