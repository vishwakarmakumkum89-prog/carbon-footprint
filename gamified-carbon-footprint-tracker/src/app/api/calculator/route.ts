import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emissionCategories } from "@/db/schema";

export async function GET() {
  const categories = await db.select().from(emissionCategories);
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const { inputs } = await req.json();
  // inputs: [{ categoryId, amount }]

  const categories = await db.select().from(emissionCategories);
  const catMap = new Map(categories.map((c) => [c.id, c]));

  let totalCo2 = 0;
  const breakdown: {
    categoryName: string;
    categoryColor: string;
    amount: number;
    unit: string;
    co2: number;
  }[] = [];

  for (const input of inputs) {
    const cat = catMap.get(input.categoryId);
    if (!cat) continue;
    const co2 = input.amount * cat.emissionFactor;
    totalCo2 += co2;
    breakdown.push({
      categoryName: cat.name,
      categoryColor: cat.color,
      amount: input.amount,
      unit: cat.unit,
      co2,
    });
  }

  // Generate personalized recommendations
  const recommendations = breakdown
    .sort((a, b) => b.co2 - a.co2)
    .slice(0, 3)
    .map((b) => {
      const percent = Math.round((b.co2 / totalCo2) * 100);
      if (b.categoryName === "Transport") {
        return `Transport makes up ${percent}% of your emissions. Try carpooling or public transit to cut this significantly.`;
      } else if (b.categoryName === "Home Energy") {
        return `Home energy is ${percent}% of your footprint. Switch to LED bulbs and lower your thermostat by 2°C to save big.`;
      } else if (b.categoryName === "Food") {
        return `Food contributes ${percent}%. Going plant-based 3 days a week could cut this by up to 30%.`;
      } else if (b.categoryName === "Flight") {
        return `Flights account for ${percent}%. One less flight per year could save over 200 kg CO₂.`;
      } else if (b.categoryName === "Shopping") {
        return `Shopping is ${percent}% of your footprint. Buying second-hand or less frequently makes a real difference.`;
      }
      return `${b.categoryName} is ${percent}% of your footprint — consider ways to reduce this.`;
    });

  // Compare to global average (4,700 kg/year = ~392 kg/month)
  const globalMonthlyAvg = 392;
  const comparison =
    totalCo2 > globalMonthlyAvg
      ? `Your estimated monthly footprint is ${Math.round(((totalCo2 - globalMonthlyAvg) / globalMonthlyAvg) * 100)}% above the global average of ${globalMonthlyAvg} kg CO₂.`
      : `Great! Your estimated monthly footprint is ${Math.round(((globalMonthlyAvg - totalCo2) / globalMonthlyAvg) * 100)}% below the global average of ${globalMonthlyAvg} kg CO₂.`;

  return NextResponse.json({
    totalCo2,
    breakdown,
    recommendations,
    comparison,
    annualCo2: totalCo2 * 12,
    treesNeeded: Math.ceil((totalCo2 * 12) / 21),
  });
}
