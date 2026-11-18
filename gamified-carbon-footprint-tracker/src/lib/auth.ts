import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "sustainability-app-secret-key-2024"
);

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  level: number;
  totalPoints: number;
  streak: number;
  totalCo2Saved: number;
};

export async function createSession(userId: string): Promise<string> {
  const sessionId = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const token = await new SignJWT({ sessionId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    const sessionId = payload.sessionId as string;

    const result = await db
      .select({
        user: users,
        session: sessions,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date()))
      )
      .limit(1);

    if (!result.length) return null;

    const { user } = result[0];
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      level: user.level,
      totalPoints: user.totalPoints,
      streak: user.streak,
      totalCo2Saved: user.totalCo2Saved,
    };
  } catch {
    return null;
  }
}

export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return;

    const { payload } = await jwtVerify(token, SECRET);
    const sessionId = payload.sessionId as string;

    await db.delete(sessions).where(eq(sessions.id, sessionId));
  } catch {
    // ignore
  }
}
