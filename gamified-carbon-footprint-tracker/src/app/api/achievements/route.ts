import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { achievements, userAchievements } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allAchievements = await db.select().from(achievements);

  const earned = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, session.id));

  const earnedIds = new Set(earned.map((e) => e.achievementId));

  const achievementsWithStatus = allAchievements.map((ach) => ({
    ...ach,
    earned: earnedIds.has(ach.id),
    earnedAt: earned.find((e) => e.achievementId === ach.id)?.earnedAt || null,
  }));

  return NextResponse.json({ achievements: achievementsWithStatus });
}
