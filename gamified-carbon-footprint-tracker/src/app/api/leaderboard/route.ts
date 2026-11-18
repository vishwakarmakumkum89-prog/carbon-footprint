import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      level: users.level,
      totalPoints: users.totalPoints,
      totalCo2Saved: users.totalCo2Saved,
      streak: users.streak,
    })
    .from(users)
    .orderBy(desc(users.totalPoints))
    .limit(20);

  const ranked = allUsers.map((u, i) => ({
    ...u,
    rank: i + 1,
    isCurrentUser: u.id === session.id,
  }));

  return NextResponse.json({ leaderboard: ranked });
}
