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
          zones: [
            // Disable cross-feature imports
            {
              target: "./frontend/features/bouts",
              from: "./frontend/features",
              except: ["./bouts"],
            },
            {
              target: "./frontend/features/team-jams",
              from: "./frontend/features",
              except: ["./team-jams"],
            },
            {
              target: "./frontend/features/teams",
              from: "./frontend/features",
              except: ["./teams"],
            },

            // Enforce unidirectional codebase
            {
              target: "./frontend/features",
              from: "./frontend/app",
            },
            {
              target: [
                "./frontend/components",
                "./frontend/hooks",
                "./frontend/lib",
                "./frontend/types",
                "./frontend/utils",
              ],
              from: ["./frontend/features", "./frontend/app"],
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
