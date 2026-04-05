import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "amplify/functions/generate-insights/**/*.test.ts",
    ],
    reporters: ["default"],
  },
});
