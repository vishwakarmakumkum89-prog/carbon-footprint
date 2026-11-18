"use client";

import { Bell, Flame } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { formatCO2 } from "@/lib/utils";

interface TopBarProps {
  user: SessionUser;
}

export default function TopBar({ user }: TopBarProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center justify-between flex-shrink-0 ml-10 lg:ml-0">
      <div>
        <h1 className="text-base font-semibold text-gray-900 hidden sm:block">
          {greeting}, {user.name.split(" ")[0]}! 🌿
        </h1>
        <p className="text-xs text-gray-500 hidden sm:block">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak badge */}
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-700">
            {user.streak}d
          </span>
        </div>

        {/* CO2 saved */}
        <div className="hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1.5">
          <span className="text-sm">🌿</span>
          <span className="text-sm font-semibold text-green-700">
            {formatCO2(user.totalCo2Saved)} saved
          </span>
        </div>

        {/* Points */}
        <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-100 rounded-full px-3 py-1.5">
          <span className="text-sm">⭐</span>
          <span className="text-sm font-semibold text-purple-700">
            {user.totalPoints} pts
          </span>
        </div>

        {/* Notification bell */}
        <button className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors relative">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
