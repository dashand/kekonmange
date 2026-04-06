
import { DayOfWeek, SpicyLevel } from "./base";

export const getRandomColor = (): string => {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#F97316",
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getDayName = (day: DayOfWeek): string => {
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi"
  ];
  
  return days[day];
};

export const getCurrentDay = (): DayOfWeek => {
  return new Date().getDay() as DayOfWeek;
};

export interface ExportData {
  version: string;
  date: string;
  workplaces: import('./base').Workplace[];
  restaurants: import('./base').Restaurant[];
}

export const EXPORT_VERSION = "1.0.0";

export const getSpicyLevelLabel = (level: SpicyLevel): string => {
  switch (level) {
    case "none":
      return "Non pimenté";
    case "light":
      return "Légèrement pimenté";
    case "medium":
      return "Réchauffe en hiver";
    case "hot":
      return "Porte de l'enfer";
    default:
      return "Non pimenté";
  }
};

export const getDayHourLabel = (day: DayOfWeek, time: string | null = null): string => {
  const dayName = getDayName(day);
  if (!time) return dayName;
  return `${dayName} à ${time}`;
};
