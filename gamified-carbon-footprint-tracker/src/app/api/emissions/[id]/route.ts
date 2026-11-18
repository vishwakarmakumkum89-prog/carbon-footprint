import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { emissionLogs, emissionCategories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id);

  await db
    .delete(emissionLogs)
    .where(
      and(eq(emissionLogs.id, logId), eq(emissionLogs.userId, session.id))
    );

  return NextResponse.json({ success: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const logId = parseInt(id);
  const { categoryId, amount, note, date } = await req.json();

  let co2Amount: number | undefined;
  if (categoryId && amount) {
    const category = await db
      .select()
      .from(emissionCategories)
      .where(eq(emissionCategories.id, categoryId))
      .limit(1);
    if (category.length) {
      co2Amount = amount * category[0].emissionFactor;
    }
  }

  const [updated] = await db
    .update(emissionLogs)
    .set({
      ...(categoryId && { categoryId }),
      ...(amount && { amount }),
      ...(co2Amount !== undefined && { co2Amount }),
      ...(note !== undefined && { note }),
      ...(date && { date: new Date(date) }),
    })
    .where(
      and(eq(emissionLogs.id, logId), eq(emissionLogs.userId, session.id))
    )
    .returning();

  return NextResponse.json({ log: updated });
}
