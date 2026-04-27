import {
  signInWithPhoneNumber,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "./firebase";
import {
  loginWithBackend,
  registerWithBackend,
  UserNotFoundError,
} from "../api/auth";
import { setAuthToken } from "./auth-storage";

const COUNTRY_CODE = "IN";

/**
 * Try login, fallback to register if user not found (404).
 */
async function loginOrRegisterWithBackend(firebaseUid, registerOptions = {}) {
  try {
    const data = await loginWithBackend(firebaseUid, {
      countryCode: COUNTRY_CODE,
    });
    return data;
  } catch (err) {
    if (err instanceof UserNotFoundError) {
      return registerWithBackend(firebaseUid, {
        ...registerOptions,
        countryCode: COUNTRY_CODE,
      });
    }
    throw err;
  }
}

/**
 * Send OTP to phone number. Returns confirmationResult for verifyOtp.
 * Web only - requires DOM for reCAPTCHA.
 */
export function sendPhoneOtp(phoneNumber, recaptchaContainerId = "recaptcha-container") {
  if (typeof window === "undefined") {
    throw new Error("Phone auth is only supported on web");
  }
  const container = document.getElementById(recaptchaContainerId);
  if (!container) {
    throw new Error(`Recaptcha container #${recaptchaContainerId} not found`);
  }
  const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
    size: "invisible",
    callback: () => {},
  });
  const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
  return signInWithPhoneNumber(auth, formattedPhone, verifier);
}

/**
 * Verify OTP code, call backend, store token.
 */
export async function verifyPhoneOtp(confirmationResult, otpCode) {
  const userCredential = await confirmationResult.confirm(otpCode);
  const firebaseUid = userCredential.user.uid;
  const data = await loginOrRegisterWithBackend(firebaseUid, {
    phone: userCredential.user.phoneNumber,
  });
  await setAuthToken(data.token);
  return data;
}

/**
 * Sign in with Google popup, call backend, store token.
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const firebaseUid = userCredential.user.uid;
  const data = await loginOrRegisterWithBackend(firebaseUid, {
    email: userCredential.user.email,
    name: userCredential.user.displayName,
    profileImage: userCredential.user.photoURL,
  });
  await setAuthToken(data.token);
  return data;
}

/**
 * Sign out from Firebase and clear stored token.
 */
export async function signOut() {
  await firebaseSignOut(auth);
  await setAuthToken(null);
}
