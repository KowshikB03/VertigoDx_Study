import { cookies } from "next/headers";
import { getUser, type User } from "./users";

const COOKIE = "sv_session";

// Simple signed-ish cookie. For a closed IRB cohort this is sufficient.
// Value is just the user id; we re-validate against the config on every read.
export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  return getUser(id); // re-check against hardcoded config
}
