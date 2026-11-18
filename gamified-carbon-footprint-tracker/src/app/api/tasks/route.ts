import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { tasks, userTasks, users, userAchievements, achievements } from "@/db/schema";
import { eq, notInArray, count } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all tasks with user status
  const allTasks = await db.select().from(tasks);

  const myUserTasks = await db
    .select()
    .from(userTasks)
    .where(eq(userTasks.userId, session.id));

  const taskMap = new Map(myUserTasks.map((ut) => [ut.taskId, ut]));

  const tasksWithStatus = allTasks.map((task) => {
    const ut = taskMap.get(task.id);
    return {
      ...task,
      userTaskId: ut?.id,
      status: ut?.status || "available",
      completedAt: ut?.completedAt,
      pointsEarned: ut?.pointsEarned || 0,
      co2SavedByUser: ut?.co2Saved || 0,
    };
  });

  return NextResponse.json({ tasks: tasksWithStatus });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId, action } = await req.json();

  if (!taskId || !action) {
    return NextResponse.json(
      { error: "taskId and action required" },
      { status: 400 }
    );
  }

  const task = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  if (!task.length) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const existingUserTask = await db
    .select()
    .from(userTasks)
    .where(eq(userTasks.userId, session.id))
    .then((rows) => rows.find((r) => r.taskId === taskId));

  if (action === "assign") {
    if (existingUserTask) {
      return NextResponse.json(
        { error: "Task already assigned" },
        { status: 400 }
      );
    }
    const [newUserTask] = await db
      .insert(userTasks)
      .values({
        userId: session.id,
        taskId,
        status: "assigned",
        pointsEarned: 0,
        co2Saved: 0,
      })
      .returning();

    return NextResponse.json({ userTask: newUserTask });
  }

  if (action === "complete") {
    if (!existingUserTask) {
      return NextResponse.json(
        { error: "Task not assigned" },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(userTasks)
      .set({
        status: "completed",
        completedAt: new Date(),
        pointsEarned: task[0].points,
        co2Saved: task[0].co2SavedKg,
      })
      .where(eq(userTasks.id, existingUserTask.id))
      .returning();

    // Update user stats
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    if (currentUser.length) {
      const newPoints = currentUser[0].totalPoints + task[0].points;
      const newCo2 = currentUser[0].totalCo2Saved + task[0].co2SavedKg;
      const newStreak = currentUser[0].streak + 1;

      // Calculate new level
      const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000];
      let newLevel = 1;
      for (let i = 0; i < levelThresholds.length; i++) {
        if (newPoints >= levelThresholds[i]) newLevel = i + 1;
      }

      await db
        .update(users)
        .set({
          totalPoints: newPoints,
          totalCo2Saved: newCo2,
          streak: newStreak,
          level: newLevel,
          lastActiveDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.id));

      // Check and award achievements
      const completedTasksCount = await db
        .select({ count: count() })
        .from(userTasks)
        .where(eq(userTasks.userId, session.id));

      const earnedAchIds = (
        await db
          .select({ achievementId: userAchievements.achievementId })
          .from(userAchievements)
          .where(eq(userAchievements.userId, session.id))
      ).map((a) => a.achievementId);

      const allAchs = await db.select().from(achievements);

      for (const ach of allAchs) {
        if (earnedAchIds.includes(ach.id)) continue;

        let earned = false;
        const completedCount = Number(completedTasksCount[0]?.count || 0);

        if (ach.requirementType === "tasks_completed" && completedCount >= ach.requirementValue) {
          earned = true;
        } else if (ach.requirementType === "co2_saved" && newCo2 >= ach.requirementValue) {
          earned = true;
        } else if (ach.requirementType === "streak" && newStreak >= ach.requirementValue) {
          earned = true;
        } else if (ach.requirementType === "points" && newPoints >= ach.requirementValue) {
          earned = true;
        }

        if (earned) {
          await db.insert(userAchievements).values({
            userId: session.id,
            achievementId: ach.id,
          });
        }
      }
    }

    return NextResponse.json({ userTask: updated, success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
