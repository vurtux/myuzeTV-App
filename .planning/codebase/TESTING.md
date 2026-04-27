# Testing Patterns

**Analysis Date:** 2026-04-06

## Test Framework

**Runner:**
- Jest 30.3.0
- Preset: `jest-expo/web` (configured in `package.json`)
- Config: Inline in `package.json` under `jest` key

**Assertion Library:**
- Jest built-in assertions (`expect()`)

**Run Commands:**
```bash
npm test                   # Run all tests
npm run test:watch        # Watch mode
npm run test:e2e          # Playwright E2E tests
npm run test:e2e:headed   # Playwright with visible browser
npm run test:e2e:ui       # Playwright interactive UI mode
```

**Test Paths Ignored:**
- `/node_modules/`
- `/v0-reference/` (reference prototype, not part of app)
- `/e2e-playwright/` (E2E tests run separately)

## Test File Organization

**Location:**
- Co-located with source in `__tests__/` directory
- Structure mirrors source: `__tests__/api/`, `__tests__/components/`, `__tests__/hooks/`, `__tests__/lib/`

**Naming:**
- Test files: `{name}.test.{js,ts,tsx}` (unit/integration tests)
- E2E specs: `{name}.spec.ts` in `e2e-playwright/` directory

**Structure:**
```
__tests__/
├── api/
│   ├── dramas.test.js
│   ├── rails.test.js
│   ├── watchlist.test.js
│   ├── subscription.test.js
│   ├── episodes.test.js
│   └── account.test.js
├── components/
│   ├── BottomNav.test.tsx
│   ├── WatchlistCard.test.tsx
│   ├── GenreChips.test.tsx
│   ├── SkeletonBox.test.tsx
│   ├── StarRating.test.tsx
│   ├── EpisodeFeed.test.tsx
│   └── DramaDetailScreen.test.tsx
├── hooks/
│   └── usePlaybackRequest.test.ts
└── lib/
    ├── auth-storage.test.js
    └── date-utils.test.ts

e2e-playwright/
├── helpers.ts
├── 01-login.spec.ts
├── 02-home-and-navigation.spec.ts
├── 03-profile.spec.ts
├── 04-free-vs-paid.spec.ts
├── 05-video-player.spec.ts
├── 06-search.spec.ts
├── 07-player-episode-navigation.spec.ts
├── 08-player-controls.spec.ts
└── 09-player-lock-enforcement.spec.ts
```

## Test Structure

**Unit/Integration Test Suite Organization:**

```javascript
describe("API: dramas.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchDramas", () => {
    it("returns mapped array when data is a top-level array", async () => {
      client.get.mockResolvedValue({
        data: [{ slug: "love-in-accra", title: "Love in Accra", ... }],
      });

      const result = await fetchDramas();
      expect(client.get).toHaveBeenCalledWith("/dramas");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({ ... }));
    });
  });
});
```

**E2E Test Suite Organization:**

```typescript
test.describe("Login Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.goto("/");
  });

  test("shows login screen on first visit", async ({ page }) => {
    await page.waitForSelector("text=Sign in", { timeout: 30000 });
    await expect(page.getByText("Sign in to start watching")).toBeVisible();
  });
});
```

**Patterns:**
- Setup: `beforeEach()` for test isolation (mocks cleared, storage reset)
- Arrange-Act-Assert: Setup mock → call function → assert result
- Teardown: Jest handles cleanup automatically
- No explicit teardown functions in test files

## Mocking

**Framework:** Jest mocking (`jest.mock()`, `jest.fn()`)

**Patterns from `__tests__/api/dramas.test.js`:**

```javascript
jest.mock("../../api/client", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const client = require("../../api/client").default;
```

**Patterns from `__tests__/components/BottomNav.test.tsx`:**

```typescript
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("lucide-react-native", () => ({
  Home: (props: any) => <span data-testid="icon-home" {...props} />,
  Bookmark: (props: any) => <span data-testid="icon-bookmark" {...props} />,
  User: (props: any) => <span data-testid="icon-user" {...props} />,
}));
```

**Mock State Management:**

```typescript
let mockAuthState = { token: null as string | null, isSubscribed: false };
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockAuthState,
}));

// In test:
beforeEach(() => {
  mockAuthState = { token: null, isSubscribed: false };
});

it("redirects to login when not authenticated", () => {
  mockAuthState = { token: null, isSubscribed: false };
  // ...
});
```

**What to Mock:**
- API clients (`api/client`)
- Router/navigation (`expo-router`)
- External libraries (`lucide-react-native`, `expo-image`)
- Context providers (`AuthContext`)
- Utility functions with side effects (`auth-storage`, `date-utils`)

**What NOT to Mock:**
- Component logic being tested
- Data transformation functions (test with real data)
- Simple utilities (let them run)
- React/React Native core (Jest handles this)

## Fixtures and Factories

**Test Data Factories:**

```javascript
const makeDetailResponse = (overrides = {}) => ({
  data: {
    data: {
      slug: "test-drama",
      title: "Test Drama",
      banner_url: "https://cdn.test/banner.jpg",
      genre: "romance,thriller",
      total_episodes: 5,
      free_episodes: 2,
      ...overrides,
    },
  },
});

// In test:
it("returns DramaDetail shape with all fields", async () => {
  client.get.mockResolvedValue(makeDetailResponse());
  const result = await fetchDramaDetail("test-drama");
  expect(result).toEqual(expect.objectContaining({ ... }));
});
```

**Mock Objects:**

```typescript
const mockDrama = {
  id: "love-in-accra",
  title: "Love in Accra",
  image: "https://cdn.test/poster.jpg",
  genre: "Romance",
};
```

**Location:**
- Inline in test files (small factories)
- In helper functions at top of file (reused across tests)
- No separate fixture files (data defined close to where it's used)

## Coverage

**Requirements:** Not enforced in config (no `collectCoverageFrom` specified)

**View Coverage:**
```bash
npm test -- --coverage
```

Coverage reports generated to `coverage/` directory (in `.gitignore`)

## Test Types

**Unit Tests:**
- Scope: Individual functions and components
- Approach: Isolated with mocks, test behavior not implementation
- Examples:
  - `fetchDramas()` with various API response shapes
  - `formatDuration()` with edge cases (null, 0, large numbers)
  - Component rendering with different props

**Integration Tests:**
- Scope: API client with mock server, component with context providers
- Approach: Mock external deps, test data flow
- Examples:
  - `usePlaybackRequest()` hook with `useAuth()` context
  - `WatchlistCard` with mocked `DramaImage` and `date-utils`

**E2E Tests:**
- Framework: Playwright 1.58.2
- Config: `playwright.config.ts`
- Scope: Critical user flows on real browser
- Device: Pixel 5 (390x844 viewport, Mobile Chrome)
- Tests in: `e2e-playwright/` directory
- Examples:
  - Complete login flow with OTP
  - Home → Drama detail → Video player
  - Episode swiping and playback
  - Watchlist add/remove
  - Free vs paid episode access

**E2E Configuration:**

```typescript
// playwright.config.ts
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
```

## Common Patterns

**Async Testing:**

```typescript
it("loads and parses drama detail", async () => {
  client.get.mockResolvedValue({ data: { data: { ... } } });

  const result = await fetchDramaDetail("test-drama");
  expect(result.title).toBe("Test Drama");
});
```

**Error Testing:**

```javascript
it("propagates API errors", async () => {
  client.post.mockRejectedValue(new Error("Unauthorized"));

  await expect(likeDrama("drama-1")).rejects.toThrow("Unauthorized");
});

it("does not throw on API error (fire-and-forget)", () => {
  client.post.mockRejectedValue(new Error("Network error"));

  expect(() => saveProgress("ep-1", 60, false)).not.toThrow();
});
```

**Hook Testing with renderHook:**

```typescript
import { renderHook } from "@testing-library/react";

it("redirects to login when not authenticated", () => {
  mockAuthState = { token: null, isSubscribed: false };

  const { result } = renderHook(() => usePlaybackRequest());
  result.current("love-in-accra", 0, false);

  expect(mockPush).toHaveBeenCalledWith("/login?redirect=...");
});
```

**Component Testing with render/fireEvent:**

```typescript
it("calls onPress when card is tapped", () => {
  const mockOnPress = jest.fn();
  render(
    <WatchlistCard
      drama={mockDrama}
      onPress={mockOnPress}
      onRemove={jest.fn()}
    />
  );

  const title = screen.getByText("Love in Accra");
  fireEvent.click(title);
  expect(mockOnPress).toHaveBeenCalledTimes(1);
});
```

**E2E Test Helper Pattern:**

```typescript
// e2e-playwright/helpers.ts
export async function loginAsTestUser(page: Page, phone = "0000000001") {
  await page.goto("/");
  await page.waitForSelector("text=Sign in", { timeout: 30000 });
  
  const countryPicker = page.locator("[data-testid='country-picker']").first();
  await countryPicker.click();
  await page.getByText("United States").click();
  
  await page.getByPlaceholder("Enter phone number").first().fill(phone);
  await page.getByText("Continue").first().click();
  
  await page.waitForSelector("text=Enter Code", { timeout: 10000 });
  
  const otpContainer = page.locator("[data-testid='otp-container']");
  const firstInput = otpContainer.locator("input").first();
  await firstInput.click();
  
  for (const digit of "123456") {
    await page.keyboard.type(digit);
    await page.waitForTimeout(100);
  }
  
  await page.getByText("Verify & Continue").click();
  await page.waitForSelector("[data-testid='tab-home']", { timeout: 10000 });
}

// In test:
test("login persists after page refresh", async ({ page }) => {
  await loginAsTestUser(page, "0000000001");
  
  await page.reload();
  await page.waitForSelector("[data-testid='tab-home']", { timeout: 30000 });
  
  await page.getByTestId("tab-profile").click();
  await expect(page.getByText("Test Free User")).toBeVisible();
});
```

**Field Mapping Tests (handling inconsistent backends):**

```javascript
it("maps id from slug, then id, then drama_id", async () => {
  client.get.mockResolvedValue({
    data: [
      { slug: "my-slug", id: 5, drama_id: 99, title: "T" },
      { id: 5, drama_id: 99, title: "T2" },
      { drama_id: 99, title: "T3" },
      { title: "T4" },
    ],
  });

  const result = await fetchDramas();
  expect(result[0].id).toBe("my-slug");
  expect(result[1].id).toBe("5");
  expect(result[2].id).toBe("99");
  expect(result[3].id).toBe("");
});

it("resolves image through fallback chain", async () => {
  client.get.mockResolvedValue({
    data: [{ id: 1, title: "T", banner_url: "https://cdn.test/banner.jpg" }],
  });

  const result = await fetchDramas();
  expect(result[0].image).toBe("https://cdn.test/banner.jpg");
});

it("uses placeholder when no image URL exists", async () => {
  client.get.mockResolvedValue({
    data: [{ id: 1, title: "No Image" }],
  });

  const result = await fetchDramas();
  expect(result[0].image).toContain("placehold.co");
  expect(result[0].image).toContain("No%20Image");
});
```

**React Query Integration (used in components):**
- No explicit tests for React Query setup found
- Integration tests mock API client instead
- Query cache keys documented in ARCHITECTURE.md: `["dramas"]`, `["rails"]`, `["drama", slug]`, etc.

## Test Statistics

**Current test files:** 17 total
- Unit/integration: 14 files in `__tests__/`
- E2E: 12 files in `e2e-playwright/`

**Key test coverage areas:**
- API field mapping (extensive tests for inconsistent backend responses)
- Auth flow (login, token storage, subscription checks)
- Component rendering and interactions
- Hook behavior (playback request logic)
- E2E user journeys (login → watch → swipe → player controls)

---

*Testing analysis: 2026-04-06*
