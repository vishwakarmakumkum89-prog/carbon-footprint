import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import {
  emissionLogs,
  emissionCategories,
  userTasks,
  tasks,
  userAchievements,
  achievements,
  users,
} from "@/db/schema";
import { eq, desc, gte, sum, count } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.id;

  // Get last 30 days emission logs
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLogs = await db
    .select({
      id: emissionLogs.id,
      amount: emissionLogs.amount,
      co2Amount: emissionLogs.co2Amount,
      note: emissionLogs.note,
      date: emissionLogs.date,
      categoryName: emissionCategories.name,
      categoryIcon: emissionCategories.icon,
      categoryColor: emissionCategories.color,
    })
    .from(emissionLogs)
    .innerJoin(
      emissionCategories,
      eq(emissionLogs.categoryId, emissionCategories.id)
    )
    .where(eq(emissionLogs.userId, userId))
    .orderBy(desc(emissionLogs.date))
    .limit(10);

  // Get CO2 by category
  const co2ByCategory = await db
    .select({
      categoryName: emissionCategories.name,
      categoryColor: emissionCategories.color,
      categoryIcon: emissionCategories.icon,
      totalCo2: sum(emissionLogs.co2Amount),
    })
    .from(emissionLogs)
    .innerJoin(
      emissionCategories,
      eq(emissionLogs.categoryId, emissionCategories.id)
    )
    .where(eq(emissionLogs.userId, userId))
    .groupBy(
      emissionCategories.name,
      emissionCategories.color,
      emissionCategories.icon
    );

  // Get assigned/in-progress tasks
  const myTasks = await db
    .select({
      id: userTasks.id,
      status: userTasks.status,
      pointsEarned: userTasks.pointsEarned,
      co2Saved: userTasks.co2Saved,
      completedAt: userTasks.completedAt,
      taskId: tasks.id,
      taskTitle: tasks.title,
      taskDescription: tasks.description,
      taskDifficulty: tasks.difficulty,
      taskPoints: tasks.points,
      taskCo2SavedKg: tasks.co2SavedKg,
      taskImpact: tasks.impactDescription,
      taskIcon: tasks.icon,
      taskIsRecurring: tasks.isRecurring,
    })
    .from(userTasks)
    .innerJoin(tasks, eq(userTasks.taskId, tasks.id))
    .where(eq(userTasks.userId, userId))
    .orderBy(desc(userTasks.createdAt))
    .limit(6);

  // Get user achievements
  const myAchievements = await db
    .select({
      id: userAchievements.id,
      earnedAt: userAchievements.earnedAt,
      achievementName: achievements.name,
      achievementDescription: achievements.description,
      achievementIcon: achievements.icon,
      achievementColor: achievements.color,
    })
    .from(userAchievements)
    .innerJoin(
      achievements,
      eq(userAchievements.achievementId, achievements.id)
    )
    .where(eq(userAchievements.userId, userId))
    .orderBy(desc(userAchievements.earnedAt));

  // Get fresh user data
  const userData = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Total CO2 this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const monthlyEmissions = await db
    .select({ total: sum(emissionLogs.co2Amount) })
    .from(emissionLogs)
    .where(eq(emissionLogs.userId, userId));

  const completedCount = await db
    .select({ count: count() })
    .from(userTasks)
    .where(eq(userTasks.userId, userId));

  return NextResponse.json({
    user: userData[0] || session,
    recentLogs,
    co2ByCategory,
    myTasks,
    myAchievements,
    stats: {
      totalCo2: Number(monthlyEmissions[0]?.total || 0),
      tasksCompleted: Number(completedCount[0]?.count || 0),
    },
  });
}
