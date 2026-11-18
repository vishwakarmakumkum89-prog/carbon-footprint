"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, Star, Leaf, Shield, Wind, Trophy, Flame, Globe } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  requirementValue: number;
  requirementType: string;
  earned: boolean;
  earnedAt: string | null;
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Star,
  Leaf,
  Shield,
  Wind,
  Trophy,
  Flame,
  Globe,
  Coins: Star,
};

function getIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  return iconMap[name] || Star;
}

export default function AchievementsClient() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all");

  useEffect(() => {
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((d) => {
        setAchievements(d.achievements || []);
        setLoading(false);
      });
  }, []);

  const earned = achievements.filter((a) => a.earned);
  const locked = achievements.filter((a) => !a.earned);
  const filtered =
    filter === "all"
      ? achievements
      : filter === "earned"
      ? earned
      : locked;

  const typeLabels: Record<string, string> = {
    tasks_completed: "Tasks",
    co2_saved: "CO₂",
    streak: "Streak",
    points: "Points",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <p className="text-gray-500 text-sm mt-1">
          Collect badges by completing eco challenges and milestones
        </p>
      </div>

      {/* Progress summary */}
      <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-4 top-4 text-8xl opacity-10">🏆</div>
        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-1">Your Badge Collection</h2>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-5xl font-bold">{earned.length}</span>
            <span className="text-yellow-200 text-lg">/ {achievements.length}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{
                width: `${achievements.length ? (earned.length / achievements.length) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-yellow-100 text-sm mt-2">
            {locked.length} more badge{locked.length !== 1 ? "s" : ""} to unlock!
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {(["all", "earned", "locked"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
              filter === f
                ? "bg-yellow-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {f === "all"
              ? `All (${achievements.length})`
              : f === "earned"
              ? `Earned (${earned.length})`
              : `Locked (${locked.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ach) => {
            const Icon = getIcon(ach.icon);
            return (
              <div
                key={ach.id}
                className={cn(
                  "relative bg-white rounded-2xl p-5 border shadow-sm transition-all",
                  ach.earned
                    ? "border-yellow-200 hover:shadow-md"
                    : "border-gray-100 opacity-70"
                )}
              >
                {!ach.earned && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-4 h-4 text-gray-300" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl",
                    ach.earned ? "" : "grayscale"
                  )}
                  style={{
                    backgroundColor: ach.earned ? `${ach.color}20` : "#f3f4f6",
                  }}
                >
                  {ach.earned ? (
                    <Icon
                      className="w-7 h-7"
                      style={{ color: ach.color }}
                    />
                  ) : (
                    <Icon className="w-7 h-7 text-gray-300" />
                  )}
                </div>

                <h3
                  className={cn(
                    "font-bold text-base mb-1",
                    ach.earned ? "text-gray-900" : "text-gray-400"
                  )}
                >
                  {ach.name}
                </h3>
                <p
                  className={cn(
                    "text-sm mb-3",
                    ach.earned ? "text-gray-600" : "text-gray-400"
                  )}
                >
                  {ach.description}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: ach.earned ? `${ach.color}15` : "#f3f4f6",
                      color: ach.earned ? ach.color : "#9ca3af",
                    }}
                  >
                    {ach.requirement}
                  </span>
                  {ach.earned && ach.earnedAt && (
                    <span className="text-xs text-gray-400">
                      {format(new Date(ach.earnedAt), "MMM d, yyyy")}
                    </span>
                  )}
                </div>

                {ach.earned && (
                  <div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: ach.color }}
                  >
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* How to earn more */}
      {!loading && locked.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">
            🎯 How to earn more badges
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { type: "tasks_completed", icon: "✅", tip: "Complete eco challenges" },
              { type: "co2_saved", icon: "🌿", tip: "Save CO₂ through tasks" },
              { type: "streak", icon: "🔥", tip: "Stay active every day" },
              { type: "points", icon: "⭐", tip: "Accumulate points" },
            ].map((item) => (
              <div
                key={item.type}
                className="bg-gray-50 rounded-xl p-3 text-center"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-xs text-gray-600 font-medium">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
