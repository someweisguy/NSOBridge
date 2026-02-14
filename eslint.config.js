import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  globalIgnores(["vite.config.ts", "**/*.js", "**/*.cjs", "**/*.mjs"]),
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  importPlugin.flatConfigs.typescript,
  importPlugin.flatConfigs.react,
  reactRefresh.configs.vite,
  // reactHooks.configs.flat.recommended,  // TODO: add back in
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./frontend/tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
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
      "import/no-restricted-paths": [
        "error",
        {
          basePath: "./frontend",
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
