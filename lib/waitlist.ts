"use client";

import { doc, collection, getFirestore, serverTimestamp, writeBatch } from "firebase/firestore";
import { firebaseApp, SIGNUPS, UNIQUE } from "@/lib/firebase";

export type NewSignup = {
  full_name: string; hospital_name: string; role: string; email: string; phone: string;
  city: string; state: string; bed_capacity: string; monthly_claims: string; language: string;
  consent: true; user_agent: string;
};

/**
 * Saves a sign-up in one atomic batch with two "unique key" docs (email and phone).
 * firestore.rules only allow those key docs to be created, never overwritten, so a repeat
 * email or phone makes the whole batch fail with permission-denied, which means duplicate.
 */
export async function saveSignup(s: NewSignup): Promise<"created" | "duplicate"> {
  const db = getFirestore(firebaseApp());
  const ref = doc(collection(db, SIGNUPS));
  const batch = writeBatch(db);
  batch.set(doc(db, UNIQUE, `email_${s.email}`), { signup: ref.id });
  batch.set(doc(db, UNIQUE, `phone_${s.phone}`), { signup: ref.id });
  batch.set(ref, { ...s, created_at: serverTimestamp() });
  try {
    await batch.commit();
    return "created";
  } catch (e) {
    if ((e as { code?: string }).code === "permission-denied") return "duplicate";
    throw e;
  }
}
