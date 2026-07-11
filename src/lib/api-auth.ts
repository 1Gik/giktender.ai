import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function requireCurrentUser() {
  const session = await requireAuth();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, fullName: true, role: true },
  });
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}
