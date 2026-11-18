"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  CheckSquare,
  Trophy,
  Medal,
  Calculator,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";
import { getLevelInfo } from "@/lib/utils";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    exact: true,
  },
  { href: "/dashboard/emissions", icon: BarChart3, label: "Emissions" },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "Eco Tasks" },
  { href: "/dashboard/achievements", icon: Medal, label: "Achievements" },
  { href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "/dashboard/calculator", icon: Calculator, label: "Calculator" },
];

interface SidebarProps {
  user: SessionUser;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const levelInfo = getLevelInfo(user.totalPoints);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="w-9 h-9 gradient-green rounded-xl flex items-center justify-center shadow-sm">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">EcoTrack</span>
      </div>

      {/* User Card */}
      <div className="mx-3 my-4 p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: levelInfo.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-green-700 font-medium">
              {levelInfo.title}
            </p>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Level {levelInfo.level}</span>
            <span>{user.totalPoints} pts</span>
          </div>
          <div className="h-1.5 bg-green-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${levelInfo.progress}%`,
                backgroundColor: levelInfo.color,
              }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {levelInfo.nextLevelPoints - user.totalPoints} pts to next level
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 px-3 py-2 mb-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-semibold text-gray-900">
              {user.streak} day streak
            </p>
            <p className="text-xs text-gray-500">Keep it going!</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {loggingOut ? "Signing out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center border border-gray-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-2xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
}
