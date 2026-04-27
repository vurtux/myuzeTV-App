import { Platform } from "react-native";

const USER_TOKEN_KEY = "user_auth_token";

/**
 * Get the API key for app↔backend authentication.
 * This is NOT a user token — it authenticates the client application.
 * Always available (injected on web deploy, env var in dev).
 */
export function getApiKey() {
  if (typeof window !== "undefined" && window.__MYUZE_AUTH_TOKEN__) {
    return window.__MYUZE_AUTH_TOKEN__;
  }
  const envToken =
    typeof process !== "undefined" && process.env?.EXPO_PUBLIC_AUTH_TOKEN;
  if (envToken) return envToken;
  return null;
}

/**
 * Get the user's login token. Returns null if not logged in.
 * Separate from the API key — this is per-user, stored after login.
 */
export async function getUserToken() {
  if (Platform.OS === "web") {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    const val = await AsyncStorage.getItem(USER_TOKEN_KEY);
    console.log("[auth-storage] getUserToken:", val ? `"${val.substring(0, 20)}..."` : "null");
    return val;
  }

  try {
    const { getItemAsync } = await import("expo-secure-store");
    return getItemAsync(USER_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Save the user's login token. Pass null to clear (on logout).
 */
export async function setUserToken(token) {
  console.log("[auth-storage] setUserToken:", token ? `"${token.substring(0, 20)}..."` : "null");
  if (Platform.OS === "web") {
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    if (token) {
      await AsyncStorage.setItem(USER_TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(USER_TOKEN_KEY);
    }
    return;
  }

  try {
    const { setItemAsync, deleteItemAsync } = await import("expo-secure-store");
    if (token) {
      await setItemAsync(USER_TOKEN_KEY, token);
    } else {
      await deleteItemAsync(USER_TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Get the auth token for API requests.
 * Priority: API key first (authenticates the app), then user token as fallback.
 * The API key is what the backend expects for app↔backend auth.
 * User tokens are for user-specific endpoints (issued by backend login).
 */
export async function getAuthToken() {
  // API key takes priority — it's the app-level auth the backend expects
  const apiKey = getApiKey();
  if (apiKey) return apiKey;
  // Fallback to user token (native apps without API key)
  const userToken = await getUserToken();
  return userToken;
}

/**
 * @deprecated Use setUserToken() instead.
 */
export async function setAuthToken(token) {
  return setUserToken(token);
}
