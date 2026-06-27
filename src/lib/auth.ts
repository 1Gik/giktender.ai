import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AUTH_COOKIE_NAME = "giktender_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function verifySession(token: string) {
  return jwt.verify(token, getJwtSecret()) as SessionPayload;
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export { AUTH_COOKIE_NAME };
