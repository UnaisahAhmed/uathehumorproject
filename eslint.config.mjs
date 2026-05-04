import { defineConfig, globalIgnores } from "eslint/config";

async function loadConfig(moduleName, fallbackName) {
  try {
    return (await import(moduleName)).default;
  } catch {
    return (await import(fallbackName)).default;
  }
}

const nextVitals = await loadConfig(
  "eslint-config-next/core-web-vitals",
  "eslint-config-next/core-web-vitals.js",
);
const nextTs = await loadConfig(
  "eslint-config-next/typescript",
  "eslint-config-next/typescript.js",
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    ".claude/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
