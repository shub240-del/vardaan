"use client";

import { useEffect } from "react";

// Firebase web config is public by design (it identifies the project; it is not a secret).
// Database access is locked down by firestore.rules and only happens server-side.
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC5IYI-In7dzBvNLCjgemFoCoQvmuJrEMM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vardaan-tech.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vardaan-tech",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vardaan-tech.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "288723337337",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:288723337337:web:dbd9ac88c1c74e03bbd4a8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GNCQ3N0WGJ",
};

export default function FirebaseAnalytics() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ initializeApp, getApps }, { getAnalytics, isSupported }] = await Promise.all([
          import("firebase/app"),
          import("firebase/analytics"),
        ]);
        if (cancelled || !(await isSupported())) return;
        const app = getApps()[0] ?? initializeApp(config);
        getAnalytics(app);
      } catch {
        // Analytics must never break the page.
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return null;
}
