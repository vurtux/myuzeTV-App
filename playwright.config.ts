import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e-playwright",
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  retries: 1,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:8082",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    viewport: { width: 390, height: 844 },
  },
  projects: [
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npx expo start --web --port 8082",
    port: 8082,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
