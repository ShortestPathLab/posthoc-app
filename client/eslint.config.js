import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactCompiler from "eslint-plugin-react-compiler";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  reactHooks.configs.flat.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  reactCompiler.configs.recommended,
  {
    rules: {
      "react-compiler/react-compiler": "warn",
    },
  },
  {
    rules: { "react/react-in-jsx-scope": "off" },
  },
  { rules: { "@typescript-eslint/no-explicit-any": "warn" } },
  { settings: { react: { version: "detect" } } },
];
