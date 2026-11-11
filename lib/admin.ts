import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "./security";

export function isAdmin(): boolean {
  try {
    return verifySessionToken(cookies().get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}
