import path from "node:path";
import url from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export const baseEslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/coverage/**",
      "next-env.d.ts",
    ],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
