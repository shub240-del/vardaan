"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

// Firebase web config is public by design: it identifies the project, it is not a secret.
// What browsers may read or write is decided by firestore.rules.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC5IYI-In7dzBvNLCjgemFoCoQvmuJrEMM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "vardaan-tech.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "vardaan-tech",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "vardaan-tech.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "288723337337",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:288723337337:web:dbd9ac88c1c74e03bbd4a8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GNCQ3N0WGJ",
};

export function firebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const SIGNUPS = "waitlist_signups";
export const UNIQUE = "waitlist_unique";
