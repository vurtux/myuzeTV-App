import { defineConfig } from "@playwright/test";

/**
 * Playwright config for testing on a physical Android device via Chrome.
 * Connects to Chrome on the device via ADB port forwarding.
 *
 * Prerequisites:
 *   adb forward tcp:9222 localabstract:chrome_devtools_remote
 *   Expo web running on LAN: npx expo start --web --port 8082 --host lan
 */
export default defineConfig({
  testDir: "./",
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [["list"]],
  use: {
    // Connect to Chrome on the physical device via CDP
    connectOverCDP: "http://localhost:9222",
    // Use the device's real viewport (no override)
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },
});
