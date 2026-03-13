import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Disable no-explicit-any as it's too strict for many use cases
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unused variables that start with underscore
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      // Disable react unescaped entities rule (common in real-world code)
      "react/no-unescaped-entities": "off",
      // Disable prefer-const (sometimes let is intentional)
      "prefer-const": "off",
      // Disable module assignment rule
      "@next/next/no-assign-module-variable": "off",
    },
  },
];

export default eslintConfig;
