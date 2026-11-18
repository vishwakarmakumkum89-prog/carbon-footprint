"use client";

import { useEffect, useState } from "react";
import {
  CheckSquare,
  Loader2,
  Check,
  Plus,
  Leaf,
  Zap,
  Car,
  Droplets,
  ShoppingBag,
  Utensils,
  TreePine,
  Wind,
  Bike,
  Monitor,
  Apple,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  co2SavedKg: number;
  impactDescription: string;
  tips: string[];
  isRecurring: boolean;
  recurringPeriod: string | null;
  icon: string;
  userTaskId?: number;
  status: string;
  completedAt: string | null;
  pointsEarned: number;
  co2SavedByUser: number;
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Leaf,
  Zap,
  Car,
  Bus: Car,
  Bike: Car,
  Droplets,
  ShoppingBag,
  Utensils,
  TreePine,
  Trees: TreePine,
  Wind,
  Monitor,
  Apple,
  Flame,
  Recycle: Leaf,
  Shirt: ShoppingBag,
};

function getIcon(name: string): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  return iconMap[name] || Leaf;
}

const difficultyConfig = {
  easy: {
    label: "Easy",
    color: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-400",
  },
  medium: {
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dot: "bg-yellow-400",
  },
  hard: {
    label: "Hard",
    color: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-400",
  },
};

export default function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "available" | "assigned" | "completed">("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  }

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAssign(taskId: number) {
    setActionLoading(taskId);
    // Optimistic
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: "assigned" } : t
      )
    );

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, action: "assign" }),
    });

    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || "Failed to assign task", "error");
      loadTasks();
    } else {
      showToast("Challenge added! Good luck! 🌿");
    }
    setActionLoading(null);
  }

  async function handleComplete(taskId: number) {
    setActionLoading(taskId);
    // Optimistic
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "completed",
              completedAt: new Date().toISOString(),
              pointsEarned: t.points,
              co2SavedByUser: t.co2SavedKg,
            }
          : t
      )
    );

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, action: "complete" }),
    });

    if (!res.ok) {
      loadTasks();
      showToast("Failed to complete task", "error");
    } else {
      showToast(
        `🎉 +${task?.points} points! You saved ${task?.co2SavedKg} kg CO₂!`
      );
    }
    setActionLoading(null);
    setSelectedTask(null);
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const assignedCount = tasks.filter((t) => t.status === "assigned").length;
  const totalCo2Saved = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.co2SavedByUser, 0);
  const totalPoints = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.pointsEarned, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg animate-slide-in",
            toast.type === "success" ? "bg-green-600" : "bg-red-500"
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Eco Challenges</h1>
        <p className="text-gray-500 text-sm mt-1">
          Complete tasks to earn points and reduce your carbon footprint
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Completed", value: completedCount, color: "text-green-600", bg: "bg-green-50", icon: "✅" },
          { label: "In Progress", value: assignedCount, color: "text-blue-600", bg: "bg-blue-50", icon: "⏳" },
          { label: "CO₂ Saved", value: `${totalCo2Saved.toFixed(1)} kg`, color: "text-emerald-600", bg: "bg-emerald-50", icon: "🌿" },
          { label: "Points Earned", value: totalPoints, color: "text-purple-600", bg: "bg-purple-50", icon: "⭐" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{s.icon}</span>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            </div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100 w-fit">
        {(["all", "available", "assigned", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
              filter === f
                ? "bg-green-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {f === "all"
              ? `All (${tasks.length})`
              : f === "available"
              ? `Available (${tasks.filter((t) => t.status === "available").length})`
              : f === "assigned"
              ? `Active (${assignedCount})`
              : `Done (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <CheckSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No tasks here</h3>
          <p className="text-sm text-gray-400">
            {filter === "completed"
              ? "Complete some tasks to see them here!"
              : "All caught up!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const Icon = getIcon(task.icon);
            const diff =
              difficultyConfig[task.difficulty as keyof typeof difficultyConfig];
            const isCompleted = task.status === "completed";
            const isAssigned = task.status === "assigned";
            const isLoading = actionLoading === task.id;

            return (
              <div
                key={task.id}
                className={cn(
                  "task-card bg-white rounded-2xl p-5 border shadow-sm cursor-pointer",
                  isCompleted
                    ? "border-green-200 bg-green-50/50"
                    : "border-gray-100 hover:border-green-200"
                )}
                onClick={() => setSelectedTask(task)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center",
                      isCompleted ? "bg-green-100" : "bg-gray-100"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Icon
                        className="w-5 h-5 text-gray-600"
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                        diff?.color
                      )}
                    >
                      {diff?.label}
                    </span>
                    {task.isRecurring && (
                      <span className="text-xs text-gray-400 capitalize">
                        🔄 {task.recurringPeriod}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1.5 leading-snug">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                  {task.description}
                </p>

                {/* Rewards */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {task.points} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-500 text-sm">🌿</span>
                    <span className="text-sm font-semibold text-gray-800">
                      -{task.co2SavedKg} kg CO₂
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {isCompleted ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Completed!
                  </div>
                ) : isAssigned ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleComplete(task.id);
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Mark Complete
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssign(task.id);
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 border border-green-500 text-green-600 rounded-xl text-sm font-semibold hover:bg-green-50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Take Challenge
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gradient-earth p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    {selectedTask.title}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {selectedTask.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-4 mt-4">
                <div className="text-center">
                  <div className="text-xl font-bold">
                    ⭐ {selectedTask.points}
                  </div>
                  <div className="text-xs text-white/70">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">
                    🌿 {selectedTask.co2SavedKg}kg
                  </div>
                  <div className="text-xs text-white/70">CO₂ Saved</div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-sm font-medium text-green-900 mb-1">
                  🌍 Earth Impact
                </p>
                <p className="text-sm text-green-700">
                  {selectedTask.impactDescription}
                </p>
              </div>

              {selectedTask.tips && selectedTask.tips.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    💡 Tips for success
                  </p>
                  <ul className="space-y-1.5">
                    {selectedTask.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {selectedTask.status === "completed" ? (
                  <div className="flex-1 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold text-center">
                    ✅ Already Completed!
                  </div>
                ) : selectedTask.status === "assigned" ? (
                  <button
                    onClick={() => handleComplete(selectedTask.id)}
                    disabled={actionLoading === selectedTask.id}
                    className="flex-1 py-3 gradient-green text-white rounded-xl text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedTask.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "✅ Mark as Complete"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssign(selectedTask.id)}
                    disabled={actionLoading === selectedTask.id}
                    className="flex-1 py-3 gradient-green text-white rounded-xl text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedTask.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "🌿 Take This Challenge"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
