"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy, Flame, Leaf, Crown } from "lucide-react";
import { getLevelInfo, formatCO2 } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  name: string;
  email: string;
  level: number;
  totalPoints: number;
  totalCo2Saved: number;
  streak: number;
  rank: number;
  isCurrentUser: boolean;
}

const rankColors: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", icon: "🥇" },
  2: { bg: "bg-gray-50 border-gray-200", text: "text-gray-600", icon: "🥈" },
  3: { bg: "bg-orange-50 border-orange-200", text: "text-orange-600", icon: "🥉" },
};

export default function LeaderboardClient() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"points" | "co2">("points");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.leaderboard || []);
        setLoading(false);
      });
  }, []);

  const sorted = [...entries].sort((a, b) =>
    sortBy === "points"
      ? b.totalPoints - a.totalPoints
      : b.totalCo2Saved - a.totalCo2Saved
  );

  const currentUser = entries.find((e) => e.isCurrentUser);

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          See how you rank among all EcoTrack warriors
        </p>
      </div>

      {/* Current user position */}
      {currentUser && (
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {currentUser.rank <= 3
                ? rankColors[currentUser.rank].icon
                : `#${currentUser.rank}`}
            </div>
            <div className="flex-1">
              <p className="text-green-200 text-sm">Your Position</p>
              <p className="text-xl font-bold">
                Rank #{currentUser.rank} of {entries.length}
              </p>
              <p className="text-green-200 text-sm">
                {currentUser.totalPoints} pts · {formatCO2(currentUser.totalCo2Saved)} saved
              </p>
            </div>
            {currentUser.rank > 1 && (
              <div className="text-right">
                <p className="text-green-200 text-xs">Points to next rank</p>
                <p className="text-lg font-bold">
                  {sorted[currentUser.rank - 2]?.totalPoints - currentUser.totalPoints} pts
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort toggle */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        <button
          onClick={() => setSortBy("points")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
            sortBy === "points"
              ? "bg-green-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          ⭐ Points
        </button>
        <button
          onClick={() => setSortBy("co2")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5",
            sortBy === "co2"
              ? "bg-green-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          🌿 CO₂ Saved
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry, index) => {
            const rank = index + 1;
            const levelInfo = getLevelInfo(entry.totalPoints);
            const isTop3 = rank <= 3;
            const rankConfig = rankColors[rank] || {
              bg: "bg-white border-gray-100",
              text: "text-gray-600",
              icon: `${rank}`,
            };

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                  rankConfig.bg,
                  entry.isCurrentUser
                    ? "ring-2 ring-green-500 ring-offset-1"
                    : "hover:border-gray-200"
                )}
              >
                {/* Rank */}
                <div className="w-10 flex items-center justify-center flex-shrink-0">
                  {isTop3 ? (
                    <span className="text-2xl">{rankConfig.icon}</span>
                  ) : (
                    <span className={cn("text-lg font-bold", rankConfig.text)}>
                      #{rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: levelInfo.color }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {entry.name}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        You
                      </span>
                    )}
                    {rank === 1 && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      Lv.{levelInfo.level} {levelInfo.title}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-orange-500 flex items-center gap-0.5">
                      <Flame className="w-3 h-3" /> {entry.streak}d
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-gray-900 text-sm">
                    {sortBy === "points"
                      ? `${entry.totalPoints} pts`
                      : formatCO2(entry.totalCo2Saved)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {sortBy === "points"
                      ? formatCO2(entry.totalCo2Saved) + " saved"
                      : `${entry.totalPoints} pts`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Motivational footer */}
      {!loading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 text-center">
          <p className="text-2xl mb-2">🌍</p>
          <h3 className="font-bold text-gray-900 mb-1">
            Together we&apos;re making a difference
          </h3>
          <p className="text-sm text-gray-600">
            Combined, all EcoTrack users have saved{" "}
            <strong>
              {formatCO2(entries.reduce((s, e) => s + e.totalCo2Saved, 0))}
            </strong>{" "}
            of CO₂ — that&apos;s{" "}
            <strong>
              {Math.ceil(
                entries.reduce((s, e) => s + e.totalCo2Saved, 0) / 21
              )}{" "}
              trees
            </strong>{" "}
            worth!
          </p>
        </div>
      )}
    </div>
  );
}
