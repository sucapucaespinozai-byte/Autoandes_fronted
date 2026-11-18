import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/resultados.json" }],
  ],
  use: {
    baseURL: "http://localhost:4200",
    channel: "msedge",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
