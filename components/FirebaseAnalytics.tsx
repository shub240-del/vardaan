"use client";

import { useEffect } from "react";
import { firebaseApp } from "@/lib/firebase";

export default function FirebaseAnalytics() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getAnalytics, isSupported } = await import("firebase/analytics");
        if (!cancelled && (await isSupported())) getAnalytics(firebaseApp());
      } catch {
        // Analytics must never break the page.
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return null;
}
