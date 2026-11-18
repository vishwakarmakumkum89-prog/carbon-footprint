"use client";

import { useEffect, useState } from "react";
import {
  Calculator,
  Loader2,
  ArrowRight,
  RotateCcw,
  TreePine,
  Car,
  Zap,
  Leaf,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  emissionFactor: number;
  unit: string;
  description: string;
}

interface CalculatorResult {
  totalCo2: number;
  breakdown: Array<{
    categoryName: string;
    categoryColor: string;
    amount: number;
    unit: string;
    co2: number;
  }>;
  recommendations: string[];
  comparison: string;
  annualCo2: number;
  treesNeeded: number;
}

const emojiMap: Record<string, string> = {
  Transport: "🚗",
  "Home Energy": "🏠",
  Food: "🍽️",
  Shopping: "🛍️",
  Flight: "✈️",
  Water: "💧",
};

export default function CalculatorClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calculator")
      .then((r) => r.json())
      .then((d) => {
        setCategories(d.categories || []);
        setCategoriesLoading(false);
        // Default inputs
        const defaults: Record<number, string> = {};
        (d.categories || []).forEach((c: Category) => {
          defaults[c.id] = "";
        });
        setInputs(defaults);
      });
  }, []);

  async function handleCalculate() {
    const validInputs = categories
      .filter((c) => inputs[c.id] && parseFloat(inputs[c.id]) > 0)
      .map((c) => ({ categoryId: c.id, amount: parseFloat(inputs[c.id]) }));

    if (validInputs.length === 0) return;

    setLoading(true);
    const res = await fetch("/api/calculator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: validInputs }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  function handleReset() {
    const defaults: Record<number, string> = {};
    categories.forEach((c) => {
      defaults[c.id] = "";
    });
    setInputs(defaults);
    setResult(null);
  }

  const hasInputs = Object.values(inputs).some(
    (v) => v && parseFloat(v) > 0
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Carbon Footprint Calculator
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Estimate your monthly carbon emissions and get personalized advice
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-500" />
              Monthly Usage
            </h2>

            {categoriesLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-green-500" />
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                      <span className="text-lg">
                        {emojiMap[cat.name] || "🌍"}
                      </span>
                      {cat.name}
                      <span className="text-xs text-gray-400 font-normal">
                        ({cat.unit})
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={inputs[cat.id] || ""}
                        onChange={(e) =>
                          setInputs({ ...inputs, [cat.id]: e.target.value })
                        }
                        placeholder={`e.g. ${cat.name === "Transport" ? "300" : cat.name === "Home Energy" ? "300" : cat.name === "Food" ? "90" : cat.name === "Flight" ? "0" : cat.name === "Shopping" ? "3" : "2000"}`}
                        min="0"
                        step="1"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all pr-24"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {inputs[cat.id] && parseFloat(inputs[cat.id]) > 0 ? (
                          <span className="text-red-500 font-medium">
                            ≈{" "}
                            {(
                              parseFloat(inputs[cat.id]) * cat.emissionFactor
                            ).toFixed(1)}{" "}
                            kg
                          </span>
                        ) : (
                          cat.unit
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCalculate}
                disabled={!hasInputs || loading}
                className="flex-1 py-3 gradient-green text-white rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Calculate <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              {result && (
                <button
                  onClick={handleReset}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Quick presets */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">
              📊 Quick Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Average Person",
                  values: { Transport: 300, "Home Energy": 300, Food: 90, Shopping: 3 },
                },
                {
                  label: "Eco Lifestyle",
                  values: { Transport: 100, "Home Energy": 150, Food: 60, Shopping: 1 },
                },
                {
                  label: "High Consumer",
                  values: { Transport: 600, "Home Energy": 500, Food: 120, Flight: 2000, Shopping: 8 },
                },
                {
                  label: "City Dweller",
                  values: { Transport: 150, "Home Energy": 200, Food: 90, Shopping: 5 },
                },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const newInputs: Record<number, string> = { ...inputs };
                    categories.forEach((cat) => {
                      const val =
                        preset.values[cat.name as keyof typeof preset.values];
                      newInputs[cat.id] = val ? val.toString() : "";
                    });
                    setInputs(newInputs);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-gray-700 border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-left"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center h-full flex flex-col items-center justify-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="font-semibold text-gray-700 mb-2">
                Enter your monthly usage
              </h3>
              <p className="text-sm text-gray-400">
                Fill in your consumption data to see your carbon footprint and
                get personalized tips
              </p>
            </div>
          ) : (
            <>
              {/* Total CO2 */}
              <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-5 text-white">
                <p className="text-red-200 text-sm mb-1">
                  Monthly Carbon Footprint
                </p>
                <div className="text-4xl font-bold mb-1">
                  {result.totalCo2.toFixed(1)} kg
                </div>
                <p className="text-red-100 text-sm">
                  CO₂ per month · {(result.annualCo2 / 1000).toFixed(2)} tons/year
                </p>
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-sm text-white/90">{result.comparison}</p>
                </div>
              </div>

              {/* Impact stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: "🌳",
                    value: result.treesNeeded,
                    label: "Trees needed to offset",
                    color: "text-green-600",
                    bg: "bg-green-50",
                  },
                  {
                    icon: "🚗",
                    value: Math.ceil(result.annualCo2 / 120),
                    label: "Car trips equivalent",
                    color: "text-red-600",
                    bg: "bg-red-50",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`${stat.bg} rounded-2xl p-4`}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-xl font-bold ${stat.color}`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Breakdown Chart */}
              {result.breakdown.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                    Breakdown
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={result.breakdown.map((b) => ({
                          name: b.categoryName,
                          value: parseFloat(b.co2.toFixed(2)),
                          color: b.categoryColor,
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {result.breakdown.map((entry, index) => (
                          <Cell key={index} fill={entry.categoryColor} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} kg CO₂`, ""]}
                        contentStyle={{
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {result.breakdown
                      .sort((a, b) => b.co2 - a.co2)
                      .map((item) => (
                        <div key={item.categoryName} className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.categoryColor }}
                          />
                          <span className="text-xs text-gray-600 flex-1">
                            {item.categoryName}
                          </span>
                          <span className="text-xs font-semibold text-gray-900">
                            {item.co2.toFixed(1)} kg
                          </span>
                          <span className="text-xs text-gray-400 w-8 text-right">
                            {Math.round((item.co2 / result.totalCo2) * 100)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-green-500" />
                    Personalized Recommendations
                  </h3>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 bg-green-50 rounded-xl"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm text-green-900">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Global context */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white">
        <h3 className="font-bold text-lg mb-3">🌍 Global Context</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Global avg/person/year", value: "4.7 tons", icon: "🌎" },
            { label: "Paris Agreement target", value: "2 tons", icon: "🎯" },
            { label: "US avg/person/year", value: "14.4 tons", icon: "🇺🇸" },
            { label: "EU avg/person/year", value: "6.8 tons", icon: "🇪🇺" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/10 rounded-xl p-3 text-center"
            >
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="font-bold text-sm">{item.value}</div>
              <div className="text-blue-200 text-xs mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
