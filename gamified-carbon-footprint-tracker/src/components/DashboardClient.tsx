"use client";

import { useEffect, useState } from "react";
import {
  TrendingDown,
  CheckSquare,
  Flame,
  Award,
  ArrowRight,
  Loader2,
  Leaf,
  TreePine,
  Wind,
  Zap,
  Car,
  ShoppingBag,
  Utensils,
  Droplets,
  Plane,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { formatCO2, getLevelInfo, getEarthImpact } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    level: number;
    totalPoints: number;
    totalCo2Saved: number;
    streak: number;
    passwordHash?: string;
  };
  recentLogs: Array<{
    id: number;
    amount: number;
    co2Amount: number;
    note: string | null;
    date: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
  }>;
  co2ByCategory: Array<{
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    totalCo2: string | null;
  }>;
  myTasks: Array<{
    id: number;
    status: string;
    pointsEarned: number;
    co2Saved: number;
    completedAt: string | null;
    taskId: number;
    taskTitle: string;
    taskDescription: string;
    taskDifficulty: string;
    taskPoints: number;
    taskCo2SavedKg: number;
    taskImpact: string;
    taskIcon: string;
    taskIsRecurring: boolean;
  }>;
  myAchievements: Array<{
    id: number;
    earnedAt: string;
    achievementName: string;
    achievementDescription: string;
    achievementIcon: string;
    achievementColor: string;
  }>;
  stats: {
    totalCo2: number;
    tasksCompleted: number;
  };
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Car,
  Home: Zap,
  Utensils,
  ShoppingBag,
  Plane,
  Droplets,
  Leaf,
  TreePine,
  Wind,
  Zap,
  Bus: Car,
  Bike: Car,
  Recycle: Leaf,
  Trees: TreePine,
  Monitor: Zap,
  Apple: Utensils,
  Shirt: ShoppingBag,
  Flame,
};

function getIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  return iconMap[name] || Leaf;
}

export default function DashboardClient({ userId }: { userId: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your eco dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, recentLogs, co2ByCategory, myTasks, myAchievements, stats } =
    data;
  const levelInfo = getLevelInfo(user.totalPoints);
  const chartData = co2ByCategory
    .filter((c) => Number(c.totalCo2) > 0)
    .map((c) => ({
      name: c.categoryName,
      value: Number(c.totalCo2).toFixed(1),
      color: c.categoryColor,
    }));

  const pendingTasks = myTasks.filter((t) => t.status !== "completed");
  const completedTasks = myTasks.filter((t) => t.status === "completed");

  const statsCards = [
    {
      label: "Total CO₂ Logged",
      value: formatCO2(stats.totalCo2),
      icon: Wind,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    {
      label: "CO₂ Saved",
      value: formatCO2(user.totalCo2Saved),
      icon: Leaf,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Tasks Completed",
      value: completedTasks.length.toString(),
      icon: CheckSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Day Streak",
      value: `${user.streak} days`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Level & Impact Hero */}
      <div className="gradient-earth rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-12 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex flex-wrap gap-4 justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-white/80">
                  Level {levelInfo.level} — {levelInfo.title}
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-1">
                {getEarthImpact(user.totalCo2Saved)}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                Total CO₂ saved:{" "}
                <span className="font-semibold text-white">
                  {formatCO2(user.totalCo2Saved)}
                </span>
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{user.totalPoints}</div>
                <div className="text-xs text-white/70">Points</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  🔥 {user.streak}
                </div>
                <div className="text-xs text-white/70">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Level progress */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/70 mb-1.5">
              <span>Progress to Level {levelInfo.level + 1}</span>
              <span>{Math.round(levelInfo.progress)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full progress-bar"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1">
              {levelInfo.nextLevelPoints - user.totalPoints} points until next
              level
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className={`stat-card bg-white rounded-2xl p-4 border ${card.border} shadow-sm`}
          >
            <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-xl font-bold text-gray-900">{card.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CO2 by Category Chart */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            Emissions Breakdown
          </h3>
          {chartData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} kg CO₂`, ""]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-gray-600 truncate">
                      {item.name}
                    </span>
                    <span className="text-xs font-medium text-gray-900 ml-auto">
                      {item.value} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Wind className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No emission data yet</p>
              <Link
                href="/dashboard/emissions"
                className="mt-2 text-xs text-green-600 hover:underline"
              >
                Log your first emission →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Recent Activity
            </span>
            <Link
              href="/dashboard/emissions"
              className="text-xs text-green-600 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </h3>
          {recentLogs.length > 0 ? (
            <div className="space-y-2">
              {recentLogs.slice(0, 5).map((log) => {
                const Icon = getIcon(log.categoryIcon);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${log.categoryColor}20` }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: log.categoryColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {log.categoryName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.note || "No note"} •{" "}
                        {format(new Date(log.date), "MMM d")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-red-500">
                        +{log.co2Amount.toFixed(1)} kg
                      </p>
                      <p className="text-xs text-gray-400">CO₂</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <BarChart3 className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-green-500" />
              Active Challenges
            </span>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-green-600 hover:underline flex items-center gap-1"
            >
              All tasks <ArrowRight className="w-3 h-3" />
            </Link>
          </h3>
          {pendingTasks.length > 0 ? (
            <div className="space-y-2">
              {pendingTasks.slice(0, 4).map((task) => {
                const Icon = getIcon(task.taskIcon);
                const diffColors = {
                  easy: "bg-green-100 text-green-700",
                  medium: "bg-yellow-100 text-yellow-700",
                  hard: "bg-red-100 text-red-700",
                };
                return (
                  <div
                    key={task.id}
                    className="task-card flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-green-200 cursor-pointer"
                    onClick={() =>
                      (window.location.href = "/dashboard/tasks")
                    }
                  >
                    <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.taskTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            diffColors[
                              task.taskDifficulty as keyof typeof diffColors
                            ]
                          }`}
                        >
                          {task.taskDifficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          +{task.taskPoints} pts
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <CheckSquare className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No active challenges</p>
              <Link
                href="/dashboard/tasks"
                className="mt-2 text-xs text-green-600 hover:underline"
              >
                Browse challenges →
              </Link>
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Recent Badges
            </span>
            <Link
              href="/dashboard/achievements"
              className="text-xs text-green-600 hover:underline flex items-center gap-1"
            >
              All badges <ArrowRight className="w-3 h-3" />
            </Link>
          </h3>
          {myAchievements.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {myAchievements.slice(0, 4).map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ backgroundColor: `${ach.achievementColor}20` }}
                  >
                    🏆
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {ach.achievementName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {format(new Date(ach.earnedAt), "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Award className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">No badges yet</p>
              <p className="text-xs mt-1">Complete tasks to earn badges!</p>
            </div>
          )}
        </div>
      </div>

      {/* Earth Impact Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-5 text-white">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">🌍 Your Earth Impact</h3>
            <p className="text-green-100 text-sm">
              By saving {formatCO2(user.totalCo2Saved)} CO₂, you&apos;ve helped
              offset the equivalent of{" "}
              <strong>{Math.ceil(user.totalCo2Saved / 21)} trees</strong> planted
              and avoided{" "}
              <strong>{Math.ceil(user.totalCo2Saved / 120)} car trips</strong>!
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl">🌳</div>
              <div className="text-lg font-bold">
                {Math.ceil(user.totalCo2Saved / 21)}
              </div>
              <div className="text-xs text-green-200">Trees equiv.</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🚗</div>
              <div className="text-lg font-bold">
                {Math.ceil(user.totalCo2Saved / 2.4)}
              </div>
              <div className="text-xs text-green-200">Trips avoided</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">📱</div>
              <div className="text-lg font-bold">
                {Math.ceil(user.totalCo2Saved * 122)}
              </div>
              <div className="text-xs text-green-200">Phones charged</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


