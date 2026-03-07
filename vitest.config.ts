import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules", ".next", "**/e2e/**"],
    globals: false,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:test.db",
      AUTH_SECRET: "test-secret",
      NEXTAUTH_URL: "http://localhost:3000",
      GEMINI_API_KEY: "test-gemini-key",
    },
  },
});
