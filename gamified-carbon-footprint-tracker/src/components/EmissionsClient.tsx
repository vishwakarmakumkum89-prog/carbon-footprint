"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  BarChart3,
  Filter,
  X,
  Check,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Plane,
  Droplets,
  Leaf,
  Wind,
} from "lucide-react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  emissionFactor: number;
  unit: string;
}

interface EmissionLog {
  id: number;
  amount: number;
  co2Amount: number;
  note: string | null;
  date: string;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  categoryUnit: string;
}

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Car,
  Home: Zap,
  Utensils,
  ShoppingBag,
  Plane,
  Droplets,
  Leaf,
  Wind,
  Zap,
  Bus: Car,
};

function getIcon(name: string) {
  return iconMap[name] || Leaf;
}

export default function EmissionsClient() {
  const [logs, setLogs] = useState<EmissionLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLog, setEditLog] = useState<EmissionLog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const res = await fetch("/api/emissions");
    const data = await res.json();
    setLogs(data.logs || []);
    setCategories(data.categories || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      categoryId: parseInt(form.categoryId),
      amount: parseFloat(form.amount),
      note: form.note,
      date: form.date,
    };

    if (editLog) {
      // Optimistic update
      const cat = categories.find((c) => c.id === payload.categoryId);
      const co2Amount = payload.amount * (cat?.emissionFactor || 1);
      setLogs((prev) =>
        prev.map((l) =>
          l.id === editLog.id
            ? {
                ...l,
                ...payload,
                co2Amount,
                categoryName: cat?.name || l.categoryName,
                categoryIcon: cat?.icon || l.categoryIcon,
                categoryColor: cat?.color || l.categoryColor,
                categoryUnit: cat?.unit || l.categoryUnit,
              }
            : l
        )
      );

      await fetch(`/api/emissions/${editLog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // Optimistic update
      const cat = categories.find((c) => c.id === payload.categoryId);
      const co2Amount = payload.amount * (cat?.emissionFactor || 1);
      const tempLog: EmissionLog = {
        id: Date.now(),
        ...payload,
        co2Amount,
        date: form.date,
        createdAt: new Date().toISOString(),
        categoryName: cat?.name || "",
        categoryIcon: cat?.icon || "",
        categoryColor: cat?.color || "#22c55e",
        categoryUnit: cat?.unit || "",
      };
      setLogs((prev) => [tempLog, ...prev]);

      const res = await fetch("/api/emissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.log) {
        setLogs((prev) =>
          prev.map((l) => (l.id === tempLog.id ? { ...l, ...data.log, categoryName: cat?.name || "", categoryIcon: cat?.icon || "", categoryColor: cat?.color || "", categoryUnit: cat?.unit || "" } : l))
        );
      }
    }

    setSubmitting(false);
    setShowForm(false);
    setEditLog(null);
    setForm({
      categoryId: "",
      amount: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    // Optimistic
    setLogs((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/emissions/${id}`, { method: "DELETE" });
    setDeletingId(null);
  }

  function openEdit(log: EmissionLog) {
    setEditLog(log);
    setForm({
      categoryId: log.categoryId.toString(),
      amount: log.amount.toString(),
      note: log.note || "",
      date: log.date.split("T")[0],
    });
    setShowForm(true);
  }

  const filteredLogs =
    filterCategory === "all"
      ? logs
      : logs.filter((l) => l.categoryName === filterCategory);

  // Chart data - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: format(d, "MMM d"),
      dateStr: d.toISOString().split("T")[0],
      co2: 0,
    };
  });

  logs.forEach((log) => {
    const logDate = log.date.split("T")[0];
    const day = last7Days.find((d) => d.dateStr === logDate);
    if (day) {
      day.co2 = parseFloat((day.co2 + log.co2Amount).toFixed(2));
    }
  });

  const totalCo2 = logs.reduce((sum, l) => sum + l.co2Amount, 0);

  const selectedCat = categories.find((c) => c.id === parseInt(form.categoryId));
  const estimatedCo2 = selectedCat && form.amount
    ? parseFloat(form.amount) * selectedCat.emissionFactor
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Emission Tracker
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Log and track your carbon emissions across categories
          </p>
        </div>
        <button
          onClick={() => {
            setEditLog(null);
            setForm({
              categoryId: "",
              amount: "",
              note: "",
              date: new Date().toISOString().split("T")[0],
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 gradient-green text-white rounded-xl font-medium text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Log Emission
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total CO₂",
            value: `${totalCo2.toFixed(1)} kg`,
            color: "text-red-500",
            bg: "bg-red-50",
          },
          {
            label: "Logs",
            value: logs.length.toString(),
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Avg/Day",
            value: `${(totalCo2 / 7).toFixed(1)} kg`,
            color: "text-orange-500",
            bg: "bg-orange-50",
          },
          {
            label: "Categories",
            value: new Set(logs.map((l) => l.categoryName)).size.toString(),
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          >
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 7-Day Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          Last 7 Days
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              unit=" kg"
            />
            <Tooltip
              formatter={(value) => [`${value} kg CO₂`, "Emissions"]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="co2" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
            filterCategory === "all"
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.name)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              filterCategory === cat.name
                ? "text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-400"
            )}
            style={
              filterCategory === cat.name
                ? { backgroundColor: cat.color }
                : {}
            }
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Log List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <Wind className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No emissions logged</h3>
          <p className="text-sm text-gray-400 mb-4">
            Start tracking to understand your carbon footprint
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 gradient-green text-white text-sm font-medium rounded-xl"
          >
            Log First Emission
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filteredLogs.map((log) => {
              const Icon = getIcon(log.categoryIcon);
              return (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors",
                    deletingId === log.id && "opacity-50"
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${log.categoryColor}20` }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: log.categoryColor }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {log.categoryName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {log.amount} {log.categoryUnit}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-xs text-gray-500 truncate">{log.note}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {format(new Date(log.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-red-500">
                      {log.co2Amount.toFixed(2)} kg
                    </div>
                    <div className="text-xs text-gray-400">CO₂</div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(log)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">
                {editLog ? "Edit Emission" : "Log Emission"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditLog(null);
                }}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (per {cat.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Amount ({selectedCat?.unit || "units"})
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
                {estimatedCo2 > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    ≈ {estimatedCo2.toFixed(2)} kg CO₂
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="What did you do?"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 gradient-green text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-70 transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {editLog ? "Save Changes" : "Log Emission"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
