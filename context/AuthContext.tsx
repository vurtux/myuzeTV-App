import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserToken, setUserToken } from "../lib/auth-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_STORAGE_KEY = "myuze_user_data";
import { onAuthInvalid } from "../lib/auth-invalid";

declare global {
  interface Window {
    __MYUZE_AUTH_TOKEN__?: string;
  }
}
import {
  signInWithGoogle,
  signOut as authSignOut,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "../lib/auth-service";
import { analyticsService } from "../lib/analytics-service";

// Test phone numbers that bypass Firebase entirely — no backend call needed
const TEST_ACCOUNTS: Record<string, { user: User; token: string }> = {
  "+10000000001": {
    user: {
      id: 99901,
      name: "Test Free User",
      email: "free@test.myuze.app",
      phone: "+10000000001",
      subscription_status: undefined,
      subscription_expires_at: undefined,
    },
    token: "test-free-token-myuze-dev-only",
  },
  "+10000000002": {
    user: {
      id: 99902,
      name: "Test Premium User",
      email: "premium@test.myuze.app",
      phone: "+10000000002",
      subscription_status: "active",
      subscription_expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
    },
    token: "test-premium-token-myuze-dev-only",
  },
};

function isTestPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "");
  return !!TEST_ACCOUNTS[cleaned];
}

function getTestAccount(phone: string) {
  const cleaned = phone.replace(/\s+/g, "");
  return TEST_ACCOUNTS[cleaned];
}

type User = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  subscription_status?: string;
  subscription_expires_at?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSubscribed: boolean;
  subscriptionExpiresAt: string | null;
};

type AuthContextValue = AuthState & {
  signInWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phoneNumber: string) => Promise<unknown>;
  verifyPhoneOtp: (confirmationResult: unknown, otpCode: string) => Promise<void>;
  signOut: () => Promise<void>;
  setGuestMode: () => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function computeIsSubscribed(user: User | null): boolean {
  if (!user) return false;
  if (user.subscription_status !== "active") return false;
  if (!user.subscription_expires_at) return false;
  return new Date(user.subscription_expires_at) > new Date();
}

function extractSubscriptionExpiresAt(user: User | null): string | null {
  if (!user?.subscription_expires_at) return null;
  return user.subscription_expires_at;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Persist user token to storage whenever it changes
  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    setUserToken(t ?? null).catch(() => {});
  }, []);
  const token = tokenState;

  const refreshToken = useCallback(async () => {
    const t = await getUserToken(); // User token only — NOT the API key
    console.log("[AuthContext] refreshToken: getUserToken returned", t ? `"${t.substring(0, 20)}..."` : "null");
    setTokenState(t); // Read from storage — don't write back
    if (t) {
      // Restore persisted user data
      try {
        const stored = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser({}); // Token exists but no user data — still authenticated
        }
      } catch {
        setUser({});
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Initial load: check stored token
    refreshToken().finally(() => {
      setIsLoading(false);
      analyticsService.init(); // Initialize analytics after auth check
    });
  }, [refreshToken]);

  // Firebase auth state listener — only handles real Firebase sessions.
  // Does NOT affect: test accounts, API key auth, or stored user tokens.
  useEffect(() => {
    // Skip on web deploy — Firebase isn't used there
    const hasInjectedToken =
      typeof window !== "undefined" && !!window.__MYUZE_AUTH_TOKEN__;
    if (hasInjectedToken) return;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Real Firebase login happened (e.g., Google sign-in)
        await refreshToken();
      } else {
        // Firebase reports no session — but we may have a stored user token
        // (test accounts, phone OTP tokens persist without Firebase sessions)
        // NEVER clear auth here — only clear on explicit logout or 401
      }
    });
    return () => unsub();
  }, [refreshToken]);

  // Handle 401 from API
  // With API key priority in getAuthToken(), 401 means the API key itself
  // is invalid (server config issue) — NOT a user session problem.
  // Only clear user session if we're on native without an API key.
  useEffect(() => {
    const unsub = onAuthInvalid(async () => {
      const { getApiKey } = await import("../lib/auth-storage");
      const apiKey = getApiKey();
      if (apiKey) {
        // API key exists but got 401 — server issue, not user auth.
        // Don't clear user session.
        console.warn("[AuthContext] 401 with API key present — possible server config issue");
        return;
      }

      // No API key (native app) — 401 means user token is invalid
      const userToken = await getUserToken();
      if (!userToken) return;

      setToken(null);
      setUser(null);
      setIsGuest(false);
      AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => {});
    });
    return unsub;
  }, []);

  const setUserFromResponse = useCallback((data: { user?: User }) => {
    const responseUser = data.user ?? {};
    setUser(responseUser);
    // Persist user data so it survives refresh
    AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(responseUser)).catch(() => {});
  }, []);

  const handleSignInWithGoogle = useCallback(async () => {
    const data = await signInWithGoogle();
    setUserFromResponse(data);
    setToken(data.token);

    // Identify in Analytics
    if (data.user?.id) {
      analyticsService.identify(String(data.user.id), {
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
      });
    }
  }, [setUserFromResponse]);

  // Store the phone number used for OTP so we can detect test accounts on verify
  const pendingPhoneRef = React.useRef<string>("");

  const handleSendPhoneOtp = useCallback(async (phoneNumber: string) => {
    pendingPhoneRef.current = phoneNumber.replace(/\s+/g, "");
    // For test numbers, skip Firebase — just return a sentinel value
    if (isTestPhone(phoneNumber)) {
      return "__TEST_CONFIRMATION__";
    }
    return sendPhoneOtp(phoneNumber);
  }, []);

  const handleVerifyPhoneOtp = useCallback(async (
    confirmationResult: unknown,
    otpCode: string
  ) => {
    // Test account: use local mock data, no API or Firebase call needed
    if (confirmationResult === "__TEST_CONFIRMATION__" && isTestPhone(pendingPhoneRef.current)) {
      if (otpCode !== "123456") {
        throw new Error("Invalid OTP");
      }
      const testData = getTestAccount(pendingPhoneRef.current);
      if (!testData) throw new Error("Unknown test account");
      setUserFromResponse(testData);
      setToken(testData.token);
      if (testData.user?.id) {
        analyticsService.identify(String(testData.user.id), {
          phone: testData.user.phone,
        });
      }
      return;
    }

    // Real Firebase flow
    const data = await verifyPhoneOtp(
      confirmationResult as Parameters<typeof verifyPhoneOtp>[0],
      otpCode
    );
    setUserFromResponse(data);
    setToken(data.token);

    // Identify in Analytics
    if (data.user?.id) {
      analyticsService.identify(String(data.user.id), {
        phone: data.user.phone,
      });
    }
  }, [setUserFromResponse]);

  const handleSignOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
    setToken(null);
    setIsGuest(false);
    AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => {});

    // Reset Analytics
    analyticsService.reset();
  }, []);

  const handleSetGuestMode = useCallback(() => {
    setIsGuest(true);
    setUser({});
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsGuest(false);
    AsyncStorage.removeItem(USER_STORAGE_KEY).catch(() => {});
  }, []);

  const isSubscribed = computeIsSubscribed(user);
  const subscriptionExpiresAt = extractSubscriptionExpiresAt(user);

  const value: AuthContextValue = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token || isGuest,
    isSubscribed,
    subscriptionExpiresAt,
    signInWithGoogle: handleSignInWithGoogle,
    sendPhoneOtp: handleSendPhoneOtp,
    verifyPhoneOtp: handleVerifyPhoneOtp,
    signOut: handleSignOut,
    setGuestMode: handleSetGuestMode,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
