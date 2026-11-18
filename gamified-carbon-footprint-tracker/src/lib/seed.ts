import { db } from "@/db";
import {
  emissionCategories,
  tasks,
  achievements,
  users,
  emissionLogs,
  userTasks,
  userAchievements,
  leaderboard,
} from "@/db/schema";
import { eq, count } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export async function seedDatabase() {
  // Check if already seeded
  const existing = await db
    .select({ count: count() })
    .from(emissionCategories);
  if (existing[0].count > 0) return;

  // Seed emission categories
  const categoryData = [
    {
      name: "Transport",
      icon: "Car",
      color: "#ef4444",
      description: "Flights, car trips, public transit",
      emissionFactor: 0.21,
      unit: "km",
    },
    {
      name: "Home Energy",
      icon: "Home",
      color: "#f59e0b",
      description: "Electricity, heating, cooling",
      emissionFactor: 0.45,
      unit: "kWh",
    },
    {
      name: "Food",
      icon: "Utensils",
      color: "#22c55e",
      description: "Meals, dietary choices",
      emissionFactor: 2.5,
      unit: "meal",
    },
    {
      name: "Shopping",
      icon: "ShoppingBag",
      color: "#8b5cf6",
      description: "Clothing, electronics, goods",
      emissionFactor: 15.0,
      unit: "item",
    },
    {
      name: "Flight",
      icon: "Plane",
      color: "#0ea5e9",
      description: "Air travel",
      emissionFactor: 0.255,
      unit: "km",
    },
    {
      name: "Water",
      icon: "Droplets",
      color: "#06b6d4",
      description: "Water consumption",
      emissionFactor: 0.0003,
      unit: "liter",
    },
  ];

  const insertedCategories = await db
    .insert(emissionCategories)
    .values(categoryData)
    .returning();
  const catMap = Object.fromEntries(
    insertedCategories.map((c) => [c.name, c.id])
  );

  // Seed tasks
  const taskData = [
    {
      title: "Take public transit today",
      description:
        "Use the bus, subway, or train instead of driving. Every trip counts toward a cleaner future.",
      categoryId: catMap["Transport"],
      difficulty: "easy",
      points: 50,
      co2SavedKg: 2.4,
      impactDescription:
        "Taking transit once saves 2.4 kg CO₂ — like charging 290 smartphones!",
      tips: [
        "Plan your route with Google Maps",
        "Get a transit pass for savings",
        "Walk to the nearest stop",
      ],
      isRecurring: true,
      recurringPeriod: "daily",
      icon: "Bus",
    },
    {
      title: "Eat a plant-based meal",
      description:
        "Replace one meat-based meal with a delicious plant-based alternative.",
      categoryId: catMap["Food"],
      difficulty: "easy",
      points: 40,
      co2SavedKg: 1.5,
      impactDescription:
        "One plant-based meal saves 1.5 kg CO₂ compared to a beef meal!",
      tips: [
        "Try bean tacos or veggie stir-fry",
        "Visit a local farmer's market",
        "Meal prep to stay consistent",
      ],
      isRecurring: true,
      recurringPeriod: "daily",
      icon: "Leaf",
    },
    {
      title: "Reduce home energy by 10%",
      description:
        "Turn off lights, unplug devices, and adjust thermostat to reduce your energy this week.",
      categoryId: catMap["Home Energy"],
      difficulty: "medium",
      points: 80,
      co2SavedKg: 5.0,
      impactDescription:
        "Saving 10% energy weekly can cut 260 kg CO₂ per year — like planting 12 trees!",
      tips: [
        "Set AC to 24°C instead of 20°C",
        "Unplug chargers when not in use",
        "Switch to LED bulbs",
      ],
      isRecurring: true,
      recurringPeriod: "weekly",
      icon: "Zap",
    },
    {
      title: "Walk or cycle 5km",
      description:
        "Choose active travel for short trips instead of taking a car or ride-share.",
      categoryId: catMap["Transport"],
      difficulty: "medium",
      points: 60,
      co2SavedKg: 1.05,
      impactDescription:
        "5km on foot or bike saves over 1 kg CO₂ and improves your health!",
      tips: [
        "Use a cycling app to track routes",
        "Keep a water bottle handy",
        "Find bike-friendly streets",
      ],
      isRecurring: true,
      recurringPeriod: "daily",
      icon: "Bike",
    },
    {
      title: "Go plastic-free for a week",
      description:
        "Avoid single-use plastics: bags, bottles, straws, and packaging for 7 days.",
      categoryId: catMap["Shopping"],
      difficulty: "hard",
      points: 150,
      co2SavedKg: 3.5,
      impactDescription:
        "Reducing plastic waste saves 3.5 kg CO₂ and prevents ocean pollution!",
      tips: [
        "Carry a reusable bag and bottle",
        "Buy loose produce",
        "Use beeswax wraps instead of cling film",
      ],
      isRecurring: false,
      recurringPeriod: null,
      icon: "Recycle",
    },
    {
      title: "Plant a tree",
      description:
        "Plant a tree in your garden, community, or through an online reforestation project.",
      categoryId: catMap["Shopping"],
      difficulty: "medium",
      points: 100,
      co2SavedKg: 21.0,
      impactDescription:
        "One tree absorbs ~21 kg CO₂ per year and provides habitat for wildlife!",
      tips: [
        "Choose a native species",
        "Water regularly for the first year",
        "Or donate to Eden Reforestation Projects",
      ],
      isRecurring: false,
      recurringPeriod: null,
      icon: "Trees",
    },
    {
      title: "Shorter showers (under 5 min)",
      description:
        "Limit shower time to 5 minutes to save water and the energy used to heat it.",
      categoryId: catMap["Water"],
      difficulty: "easy",
      points: 30,
      co2SavedKg: 0.5,
      impactDescription:
        "A 5-min shower saves 50L of water and 0.5 kg CO₂ compared to a 15-min shower!",
      tips: [
        "Set a shower timer",
        "Install a low-flow showerhead",
        "Turn off water while soaping up",
      ],
      isRecurring: true,
      recurringPeriod: "daily",
      icon: "Droplets",
    },
    {
      title: "Buy second-hand clothing",
      description:
        "Shop at thrift stores or online marketplaces instead of buying new clothes.",
      categoryId: catMap["Shopping"],
      difficulty: "easy",
      points: 70,
      co2SavedKg: 8.0,
      impactDescription:
        "One second-hand clothing item saves 8 kg CO₂ vs. manufacturing new!",
      tips: [
        "Check Depop, Vinted, or local thrift stores",
        "Swap clothes with friends",
        "Repair clothes instead of discarding",
      ],
      isRecurring: false,
      recurringPeriod: null,
      icon: "Shirt",
    },
    {
      title: "Work from home today",
      description:
        "Skip the commute and work remotely to reduce transport emissions.",
      categoryId: catMap["Transport"],
      difficulty: "easy",
      points: 45,
      co2SavedKg: 3.2,
      impactDescription:
        "One WFH day saves ~3.2 kg CO₂ from an average 30km commute!",
      tips: [
        "Set up an ergonomic home workspace",
        "Avoid unnecessary video calls",
        "Save commute time for exercise",
      ],
      isRecurring: true,
      recurringPeriod: "daily",
      icon: "Monitor",
    },
    {
      title: "Reduce food waste this week",
      description:
        "Plan meals, use leftovers, and compost food scraps to cut food waste by 50%.",
      categoryId: catMap["Food"],
      difficulty: "medium",
      points: 90,
      co2SavedKg: 4.2,
      impactDescription:
        "Cutting food waste by half saves 4.2 kg CO₂ weekly — that's a huge impact!",
      tips: [
        "Plan meals before shopping",
        "Store food properly",
        "Use vegetable scraps for broth",
      ],
      isRecurring: true,
      recurringPeriod: "weekly",
      icon: "Apple",
    },
  ];

  await db.insert(tasks).values(taskData);

  // Seed achievements
  const achievementData = [
    {
      name: "First Step",
      description: "Complete your first eco task",
      icon: "Star",
      color: "#22c55e",
      requirement: "Complete 1 task",
      requirementValue: 1,
      requirementType: "tasks_completed",
    },
    {
      name: "Green Rookie",
      description: "Complete 5 eco tasks",
      icon: "Leaf",
      color: "#16a34a",
      requirement: "Complete 5 tasks",
      requirementValue: 5,
      requirementType: "tasks_completed",
    },
    {
      name: "Eco Warrior",
      description: "Complete 20 eco tasks",
      icon: "Shield",
      color: "#0ea5e9",
      requirement: "Complete 20 tasks",
      requirementValue: 20,
      requirementType: "tasks_completed",
    },
    {
      name: "Carbon Cutter",
      description: "Save your first 10 kg of CO₂",
      icon: "Wind",
      color: "#8b5cf6",
      requirement: "Save 10 kg CO₂",
      requirementValue: 10,
      requirementType: "co2_saved",
    },
    {
      name: "Climate Hero",
      description: "Save 100 kg of CO₂",
      icon: "Trophy",
      color: "#f59e0b",
      requirement: "Save 100 kg CO₂",
      requirementValue: 100,
      requirementType: "co2_saved",
    },
    {
      name: "7-Day Streak",
      description: "Stay active for 7 days in a row",
      icon: "Flame",
      color: "#ef4444",
      requirement: "7 day streak",
      requirementValue: 7,
      requirementType: "streak",
    },
    {
      name: "Point Collector",
      description: "Earn 500 points",
      icon: "Coins",
      color: "#f59e0b",
      requirement: "Earn 500 points",
      requirementValue: 500,
      requirementType: "points",
    },
    {
      name: "Planet Champion",
      description: "Earn 1000 points",
      icon: "Globe",
      color: "#ec4899",
      requirement: "Earn 1,000 points",
      requirementValue: 1000,
      requirementType: "points",
    },
  ];

  await db.insert(achievements).values(achievementData);

  // Seed demo users
  const demoUsers = [
    {
      id: uuidv4(),
      name: "Alex Johnson",
      email: "alex@demo.com",
      password: "demo123",
      level: 4,
      totalPoints: 850,
      totalCo2Saved: 124.5,
      streak: 12,
    },
    {
      id: uuidv4(),
      name: "Sarah Chen",
      email: "sarah@demo.com",
      password: "demo123",
      level: 5,
      totalPoints: 1200,
      totalCo2Saved: 210.3,
      streak: 21,
    },
    {
      id: uuidv4(),
      name: "Marcus Rivera",
      email: "marcus@demo.com",
      password: "demo123",
      level: 3,
      totalPoints: 520,
      totalCo2Saved: 87.2,
      streak: 5,
    },
    {
      id: uuidv4(),
      name: "Emma Wilson",
      email: "emma@demo.com",
      password: "demo123",
      level: 6,
      totalPoints: 1650,
      totalCo2Saved: 340.8,
      streak: 30,
    },
    {
      id: uuidv4(),
      name: "Jordan Lee",
      email: "jordan@demo.com",
      password: "demo123",
      level: 2,
      totalPoints: 280,
      totalCo2Saved: 45.1,
      streak: 3,
    },
  ];

  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await db.insert(users).values({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash,
      level: u.level,
      totalPoints: u.totalPoints,
      totalCo2Saved: u.totalCo2Saved,
      streak: u.streak,
      lastActiveDate: new Date(),
    });
  }

  // Seed demo emission logs for the first demo user (alex)
  const alexUser = await db
    .select()
    .from(users)
    .where(eq(users.email, "alex@demo.com"))
    .limit(1);

  if (alexUser.length > 0) {
    const alexId = alexUser[0].id;
    const now = new Date();

    const logData = [
      {
        userId: alexId,
        categoryId: catMap["Transport"],
        amount: 20,
        co2Amount: 4.2,
        note: "Drove to work",
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: alexId,
        categoryId: catMap["Food"],
        amount: 3,
        co2Amount: 7.5,
        note: "Had beef meals today",
        date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: alexId,
        categoryId: catMap["Home Energy"],
        amount: 15,
        co2Amount: 6.75,
        note: "AC usage",
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: alexId,
        categoryId: catMap["Transport"],
        amount: 35,
        co2Amount: 7.35,
        note: "Weekend road trip",
        date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: alexId,
        categoryId: catMap["Shopping"],
        amount: 2,
        co2Amount: 30.0,
        note: "Bought new clothes",
        date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId: alexId,
        categoryId: catMap["Transport"],
        amount: 10,
        co2Amount: 2.1,
        note: "Short city drive",
        date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: alexId,
        categoryId: catMap["Home Energy"],
        amount: 20,
        co2Amount: 9.0,
        note: "Heating",
        date: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
    ];

    await db.insert(emissionLogs).values(logData);

    // Seed some completed tasks for alex
    const allTasks = await db.select().from(tasks).limit(5);
    for (let i = 0; i < 3; i++) {
      const task = allTasks[i];
      await db.insert(userTasks).values({
        userId: alexId,
        taskId: task.id,
        status: "completed",
        completedAt: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        pointsEarned: task.points,
        co2Saved: task.co2SavedKg,
      });
    }

    // Add remaining as assigned
    for (let i = 3; i < 6 && i < allTasks.length; i++) {
      await db.insert(userTasks).values({
        userId: alexId,
        taskId: allTasks[i].id,
        status: "assigned",
        pointsEarned: 0,
        co2Saved: 0,
      });
    }

    // Seed achievements for alex
    const allAchievements = await db.select().from(achievements).limit(3);
    for (const ach of allAchievements) {
      await db.insert(userAchievements).values({
        userId: alexId,
        achievementId: ach.id,
        earnedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      });
    }

    // Seed leaderboard
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const leaderboardUsers = await db.select().from(users);
    const leaderboardData = leaderboardUsers.map((u, i) => ({
      userId: u.id,
      weekStart,
      points: u.totalPoints,
      co2Saved: u.totalCo2Saved,
      rank: i + 1,
    }));

    await db.insert(leaderboard).values(leaderboardData);
  }
}
