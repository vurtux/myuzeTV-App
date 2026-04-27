import { API_BASE } from "./mappers";

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = "UserNotFoundError";
  }
}

/**
 * Login with backend using Firebase UID.
 * POST /api/auth/login
 * Throws UserNotFoundError when status is 404 (new user).
 */
export async function loginWithBackend(firebaseUid, options = {}) {
  const { countryCode } = options;
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(countryCode && { "X-User-Country": countryCode }),
    },
    body: JSON.stringify({
      firebase_uid: firebaseUid,
      ...(countryCode && { country_code: countryCode }),
    }),
  });
  if (res.status === 404) {
    throw new UserNotFoundError();
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data;
}

/**
 * Register with backend using Firebase UID.
 * POST /api/auth/register
 */
export async function registerWithBackend(firebaseUid, options = {}) {
  const { email, phone, name, profileImage, countryCode } = options;
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(countryCode && { "X-User-Country": countryCode }),
    },
    body: JSON.stringify({
      firebase_uid: firebaseUid,
      ...(email && { email }),
      ...(phone && { phone }),
      ...(name && { name }),
      ...(profileImage && { profile_image: profileImage }),
      ...(countryCode && { country_code: countryCode }),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}
