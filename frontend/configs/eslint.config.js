// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "url";

const frontendDirectory = path.resolve(
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url)),
  "../",
);
const projectDirectory = path.resolve(frontendDirectory, "../");

export default defineConfig([
  globalIgnores([
    "vite.config.ts",
    "vitest.shims.d.ts",
    ".storybook/",
    "**/*.js",
    "**/*.cjs",
    "**/*.mjs",
  ]),
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  importPlugin.flatConfigs.typescript,
  importPlugin.flatConfigs.react,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  storybook.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: [path.resolve(projectDirectory, "tsconfig.json")],
        tsconfigRootDir: projectDirectory,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "import/no-restricted-paths": [
        "error",
        {
          basePath: frontendDirectory,
          zones: [
            // Disable cross-feature imports
            {
              target: "./features/bouts",
              from: "./features",
              except: ["./bouts"],
            },
            {
              target: "./features/jams",
              from: "./features",
              except: ["./jams"],
            },
            {
              target: "./features/series",
              from: "./features",
              except: ["./series"],
            },
            {
              target: "./features/teams",
              from: "./features",
              except: ["./teams"],
            },
            {
              target: "./features/timeouts",
              from: "./features",
              except: ["./timeouts"],
            },
            // Enforce unidirectional codebase
            {
              target: "./features",
              from: "./app",
            },
            {
              target: [
                "./components",
                "./hooks",
                "./lib",
                "./types",
                "./utils",
              ],
              from: ["./features", "./app"],
            },
          ],
        },
      ],
    },
  },
]);
