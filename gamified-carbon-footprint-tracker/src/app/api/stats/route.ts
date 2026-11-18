import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { emissionLogs, emissionCategories } from "@/db/schema";
import { eq, gte, and } from "drizzle-orm";
import { format, subDays, startOfDay } from "date-fns";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const thirtyDaysAgo = startOfDay(subDays(new Date(), 29));

  const logs = await db
    .select({
      co2Amount: emissionLogs.co2Amount,
      date: emissionLogs.date,
      categoryName: emissionCategories.name,
      categoryColor: emissionCategories.color,
    })
    .from(emissionLogs)
    .innerJoin(
      emissionCategories,
      eq(emissionLogs.categoryId, emissionCategories.id)
    )
    .where(
      and(
        eq(emissionLogs.userId, session.id),
        gte(emissionLogs.date, thirtyDaysAgo)
      )
    );

  // Group by day for the last 30 days
  const dailyData: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    dailyData[format(d, "MMM d")] = 0;
  }

  logs.forEach((log) => {
    const key = format(new Date(log.date), "MMM d");
    if (key in dailyData) {
      dailyData[key] = parseFloat(
        (dailyData[key] + log.co2Amount).toFixed(2)
      );
    }
  });

  const chartData = Object.entries(dailyData).map(([date, co2]) => ({
    date,
    co2,
  }));

  return NextResponse.json({ chartData });
}
