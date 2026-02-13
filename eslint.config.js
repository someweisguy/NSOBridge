import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".venv", "dist", "www"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: [
          "./frontend/tsconfig.node.json",
          "./frontend/tsconfig.app.json",
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
      react: react,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "import/no-restricted-paths": [
        "error",
        {
          basePath: "./frontend",
          zones: [
            // Disable cross-feature imports
            {
              target: "./feature/bouts",
              from: "./features/",
              except: ["./bouts"],
            },
            {
              target: "./features/team-jams",
              from: "./features",
              except: ["./team-jams"],
            },
            {
              target: "./features/teams",
              from: "./features",
              except: ["./teams"],
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
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
