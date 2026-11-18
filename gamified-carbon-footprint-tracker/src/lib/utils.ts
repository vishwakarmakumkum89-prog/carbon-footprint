import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCO2(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tons`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function getLevelInfo(points: number): {
  level: number;
  title: string;
  nextLevelPoints: number;
  progress: number;
  color: string;
} {
  const levels = [
    { min: 0, title: "Eco Newcomer", color: "#6b7280" },
    { min: 100, title: "Green Sprout", color: "#22c55e" },
    { min: 300, title: "Eco Warrior", color: "#16a34a" },
    { min: 600, title: "Climate Champion", color: "#0ea5e9" },
    { min: 1000, title: "Earth Guardian", color: "#8b5cf6" },
    { min: 1500, title: "Planet Protector", color: "#f59e0b" },
    { min: 2500, title: "Carbon Crusher", color: "#ef4444" },
    { min: 4000, title: "Sustainability Legend", color: "#ec4899" },
  ];

  let currentLevel = 0;
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].min) {
      currentLevel = i;
    }
  }

  const current = levels[currentLevel];
  const next = levels[Math.min(currentLevel + 1, levels.length - 1)];
  const nextLevelPoints =
    currentLevel < levels.length - 1 ? next.min : current.min + 1000;

  const prevMin = current.min;
  const progress =
    currentLevel < levels.length - 1
      ? Math.min(
          100,
          ((points - prevMin) / (nextLevelPoints - prevMin)) * 100
        )
      : 100;

  return {
    level: currentLevel + 1,
    title: current.title,
    nextLevelPoints,
    progress,
    color: current.color,
  };
}

export function getEarthImpact(co2SavedKg: number): string {
  if (co2SavedKg < 5) {
    return `You've saved the equivalent of charging ${Math.round(co2SavedKg * 122)} smartphones!`;
  } else if (co2SavedKg < 50) {
    return `You've offset the carbon absorbed by ${Math.round(co2SavedKg / 21)} trees in a year!`;
  } else if (co2SavedKg < 500) {
    return `You've saved as much CO₂ as ${Math.round(co2SavedKg / 120)} car trips avoided!`;
  } else if (co2SavedKg < 2000) {
    return `You've saved the equivalent of planting ${Math.round(co2SavedKg / 21)} trees!`;
  } else {
    return `You've saved enough CO₂ to power ${Math.round(co2SavedKg / 1200)} homes for a year!`;
  }
}
