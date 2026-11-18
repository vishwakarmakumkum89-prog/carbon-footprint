"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      mode === "login"
        ? { email: form.email, password: form.password }
        : form;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fillDemo() {
    setForm({ name: "", email: "alex@demo.com", password: "demo123" });
    setMode("login");
  }

  const features = [
    "Track your carbon footprint daily",
    "Complete eco-challenges to earn points",
    "Climb the global leaderboard",
    "See your real-world Earth impact",
    "Personalized reduction recommendations",
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/hero-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/80 to-emerald-900/90" />

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">EcoTrack</span>
          </div>

          {/* Hero content */}
          <div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Track your impact.
              <br />
              <span className="text-green-300">Save the planet.</span>
            </h1>
            <p className="text-green-100 text-lg mb-8 leading-relaxed">
              Join thousands of eco-warriors reducing their carbon footprint
              through gamified challenges and real-time tracking.
            </p>

            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-300" />
                  </div>
                  <span className="text-green-100 text-sm">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "50K+", label: "Eco Warriors" },
              { value: "2.4M kg", label: "CO₂ Saved" },
              { value: "180K", label: "Tasks Done" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-green-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 gradient-green rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EcoTrack</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === "login" ? "Welcome back!" : "Join EcoTrack"}
            </h2>
            <p className="text-gray-500">
              {mode === "login"
                ? "Sign in to continue your eco journey"
                : "Start your journey to a greener planet today"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "login"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode("register")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                mode === "register"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Johnson"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-gray-900 placeholder-gray-400"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-gray-900 placeholder-gray-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 gradient-green text-white font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo account */}
          <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-sm text-green-800 font-medium mb-2">
              🌿 Try the demo account
            </p>
            <p className="text-xs text-green-600 mb-3">
              Explore with pre-filled data — no sign-up needed
            </p>
            <button
              onClick={fillDemo}
              className="text-sm font-medium text-green-700 hover:text-green-800 underline"
            >
              Use demo: alex@demo.com / demo123
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
