import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthCookieOptions, signSession, AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
  }

  const { email, password, fullName } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
    },
  });

  const token = signSession({ userId: user.id, email: user.email });
  const response = NextResponse.json({ id: user.id, email: user.email, fullName: user.fullName }, { status: 201 });

  response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  return response;
}
