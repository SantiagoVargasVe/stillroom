import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: process.env.STILLROOM_TEST_URL || "http://127.0.0.1:4176",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 1100 },
  },
  webServer: process.env.STILLROOM_TEST_URL
    ? undefined
    : {
        command: "npm run build && npm run preview -- --port 4176",
        url: "http://127.0.0.1:4176",
        reuseExistingServer: false,
      },
});
