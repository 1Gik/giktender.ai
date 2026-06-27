import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/auth";

export async function requireAuth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    return verifySession(sessionToken);
  } catch {
    return null;
  }
}
