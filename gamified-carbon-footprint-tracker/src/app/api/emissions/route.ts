import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { emissionLogs, emissionCategories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await db
    .select({
      id: emissionLogs.id,
      amount: emissionLogs.amount,
      co2Amount: emissionLogs.co2Amount,
      note: emissionLogs.note,
      date: emissionLogs.date,
      createdAt: emissionLogs.createdAt,
      categoryId: emissionLogs.categoryId,
      categoryName: emissionCategories.name,
      categoryIcon: emissionCategories.icon,
      categoryColor: emissionCategories.color,
      categoryUnit: emissionCategories.unit,
    })
    .from(emissionLogs)
    .innerJoin(
      emissionCategories,
      eq(emissionLogs.categoryId, emissionCategories.id)
    )
    .where(eq(emissionLogs.userId, session.id))
    .orderBy(desc(emissionLogs.date));

  const categories = await db.select().from(emissionCategories);

  return NextResponse.json({ logs, categories });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId, amount, note, date } = await req.json();

  if (!categoryId || !amount) {
    return NextResponse.json(
      { error: "Category and amount required" },
      { status: 400 }
    );
  }

  const category = await db
    .select()
    .from(emissionCategories)
    .where(eq(emissionCategories.id, categoryId))
    .limit(1);

  if (!category.length) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const co2Amount = amount * category[0].emissionFactor;

  const [newLog] = await db
    .insert(emissionLogs)
    .values({
      userId: session.id,
      categoryId,
      amount,
      co2Amount,
      note,
      date: date ? new Date(date) : new Date(),
    })
    .returning();

  return NextResponse.json({ log: newLog });
}
