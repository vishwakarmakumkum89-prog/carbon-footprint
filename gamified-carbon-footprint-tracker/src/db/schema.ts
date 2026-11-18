import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  serial,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatar: text("avatar"),
  level: integer("level").default(1).notNull(),
  totalPoints: integer("total_points").default(0).notNull(),
  totalCo2Saved: real("total_co2_saved").default(0).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastActiveDate: timestamp("last_active_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Carbon emission categories
export const emissionCategories = pgTable("emission_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  description: text("description"),
  emissionFactor: real("emission_factor").notNull(), // kg CO2 per unit
  unit: varchar("unit", { length: 50 }).notNull(),
});

// Carbon emission logs
export const emissionLogs = pgTable("emission_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => emissionCategories.id),
  amount: real("amount").notNull(), // units consumed
  co2Amount: real("co2_amount").notNull(), // kg CO2
  note: text("note"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tasks / challenges
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => emissionCategories.id),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // easy, medium, hard
  points: integer("points").notNull(),
  co2SavedKg: real("co2_saved_kg").notNull(),
  impactDescription: text("impact_description").notNull(),
  tips: jsonb("tips").$type<string[]>().default([]),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurringPeriod: varchar("recurring_period", { length: 20 }), // daily, weekly, monthly
  icon: varchar("icon", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User task completions
export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id),
  status: varchar("status", { length: 20 }).default("assigned").notNull(), // assigned, in_progress, completed
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0).notNull(),
  co2Saved: real("co2_saved").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Achievements / badges
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  requirement: text("requirement").notNull(),
  requirementValue: integer("requirement_value").notNull(),
  requirementType: varchar("requirement_type", { length: 50 }).notNull(), // tasks_completed, co2_saved, streak, points
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementId: integer("achievement_id")
    .notNull()
    .references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Leaderboard entries (computed weekly)
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weekStart: timestamp("week_start").notNull(),
  points: integer("points").default(0).notNull(),
  co2Saved: real("co2_saved").default(0).notNull(),
  rank: integer("rank"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table for auth
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  emissionLogs: many(emissionLogs),
  userTasks: many(userTasks),
  userAchievements: many(userAchievements),
  leaderboard: many(leaderboard),
  sessions: many(sessions),
}));

export const emissionCategoriesRelations = relations(
  emissionCategories,
  ({ many }) => ({
    emissionLogs: many(emissionLogs),
    tasks: many(tasks),
  })
);

export const emissionLogsRelations = relations(emissionLogs, ({ one }) => ({
  user: one(users, { fields: [emissionLogs.userId], references: [users.id] }),
  category: one(emissionCategories, {
    fields: [emissionLogs.categoryId],
    references: [emissionCategories.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  category: one(emissionCategories, {
    fields: [tasks.categoryId],
    references: [emissionCategories.id],
  }),
  userTasks: many(userTasks),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, { fields: [userTasks.userId], references: [users.id] }),
  task: one(tasks, { fields: [userTasks.taskId], references: [tasks.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  })
);

export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  user: one(users, { fields: [leaderboard.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
