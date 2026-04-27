// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFden3h7P43rAjQG12PHTLtPTmPvlShSs",
  authDomain: "myuzetv.firebaseapp.com",
  projectId: "myuzetv",
  storageBucket: "myuzetv.firebasestorage.app",
  messagingSenderId: "296118662863",
  appId: "1:296118662863:web:e21b4c2712773a811229ba",
  measurementId: "G-P1NCDL83ZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth – used for sign-in, sign-out, etc.
export const auth = getAuth(app);

// Analytics – only in browser (avoids errors in React Native)
let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    // Analytics not available (e.g. localhost, ad blockers)
  }
}
export { analytics };
