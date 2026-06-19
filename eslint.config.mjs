import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Pre-existing stylistic debt is surfaced as warnings rather than
    // hard errors, so `npm run lint` can act as a CI gate (fails only
    // on genuine errors) while these stay visible for incremental
    // cleanup. Tighten back to "error" as the codebase is paid down.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "react-hooks/set-state-in-effect": "warn",
      // Allow intentionally-unused identifiers when prefixed with "_"
      // (e.g. unused route handler args `_req`, destructured `_p`).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          // Destructuring rest-omit idiom: `const { icon, ...rest } = x`
          // intentionally names the stripped key, so don't flag it.
          ignoreRestSiblings: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
