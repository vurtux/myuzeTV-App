// Mock react-native Platform
jest.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

// Mock AsyncStorage - this is required() dynamically inside auth-storage
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

const {
  getApiKey,
  getUserToken,
  setUserToken,
  getAuthToken,
} = require("../../lib/auth-storage");

// Get reference to the mocked AsyncStorage that the module will use via require()
const AsyncStorage =
  require("@react-native-async-storage/async-storage").default;

// Preserve original env state
const originalWindow = { ...window };

describe("lib/auth-storage.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear window token
    delete window.__MYUZE_AUTH_TOKEN__;
    // Clear env var
    delete process.env.EXPO_PUBLIC_AUTH_TOKEN;
  });

  // ---------------------------------------------------------------------------
  // getApiKey
  // ---------------------------------------------------------------------------
  describe("getApiKey", () => {
    it("returns window.__MYUZE_AUTH_TOKEN__ when set", () => {
      window.__MYUZE_AUTH_TOKEN__ = "window-api-key-123";

      const result = getApiKey();
      expect(result).toBe("window-api-key-123");
    });

    it("returns env var when window token is not set", () => {
      process.env.EXPO_PUBLIC_AUTH_TOKEN = "env-api-key-456";

      const result = getApiKey();
      expect(result).toBe("env-api-key-456");
    });

    it("prefers window token over env var", () => {
      window.__MYUZE_AUTH_TOKEN__ = "window-key";
      process.env.EXPO_PUBLIC_AUTH_TOKEN = "env-key";

      const result = getApiKey();
      expect(result).toBe("window-key");
    });

    it("returns null when neither window token nor env var is set", () => {
      const result = getApiKey();
      expect(result).toBeNull();
    });

    it("returns null for empty string window token", () => {
      window.__MYUZE_AUTH_TOKEN__ = "";

      const result = getApiKey();
      // empty string is falsy, so it falls through
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // getUserToken (web platform)
  // ---------------------------------------------------------------------------
  describe("getUserToken", () => {
    it("reads from AsyncStorage on web platform", async () => {
      AsyncStorage.getItem.mockResolvedValue("user-jwt-token-789");

      const result = await getUserToken();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("user_auth_token");
      expect(result).toBe("user-jwt-token-789");
    });

    it("returns null when no token stored", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await getUserToken();
      expect(result).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // setUserToken (web platform)
  // ---------------------------------------------------------------------------
  describe("setUserToken", () => {
    it("stores token via AsyncStorage.setItem when token is provided", async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await setUserToken("new-user-token");
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "user_auth_token",
        "new-user-token"
      );
    });

    it("removes token via AsyncStorage.removeItem when token is null", async () => {
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      await setUserToken(null);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user_auth_token");
    });

    it("does not call setItem when token is null", async () => {
      AsyncStorage.removeItem.mockResolvedValue(undefined);

      await setUserToken(null);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it("does not call removeItem when token is provided", async () => {
      AsyncStorage.setItem.mockResolvedValue(undefined);

      await setUserToken("some-token");
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // getAuthToken
  // ---------------------------------------------------------------------------
  describe("getAuthToken", () => {
    it("returns API key when available (takes priority over user token)", async () => {
      window.__MYUZE_AUTH_TOKEN__ = "api-key-first";
      AsyncStorage.getItem.mockResolvedValue("user-token-second");

      const result = await getAuthToken();
      expect(result).toBe("api-key-first");
      // Should NOT call AsyncStorage because API key short-circuits
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    });

    it("falls back to user token when no API key exists", async () => {
      AsyncStorage.getItem.mockResolvedValue("user-fallback-token");

      const result = await getAuthToken();
      expect(result).toBe("user-fallback-token");
    });

    it("returns null when neither API key nor user token exists", async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const result = await getAuthToken();
      expect(result).toBeNull();
    });
  });
});
