export interface Restaurant {
  id: string;
  name: string;
  foodType: string;
  color: string;
  address?: string;
  menuInfo?: string;
  menuPhotos?: string[];
  takeaway: boolean;
  vegetarianOption: boolean;
  halalOption: boolean;
  distance: number;
  workplaceId: string;
  restaurantTickets: RestaurantTicketType;
  priceRange: PriceRange;
  reservationType: ReservationType;
  phoneOrderAllowed: boolean;
  phoneNumber?: string;
  promotions?: Promotion[];
  spicyLevel?: SpicyLevel;
  openingHours?: OpeningHours[];
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Workplace {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  description: string;
  dayOfWeek: DayOfWeek | null; // null signifie tous les jours
  discount?: string; // ex: "10%", "5€"
}

export interface OpeningHours {
  dayOfWeek: DayOfWeek;
  closed: boolean; // true si fermé ce jour
  lunchService?: {
    opens: string; // format "HH:MM"
    closes: string; // format "HH:MM"
  };
  dinnerService?: {
    opens: string; // format "HH:MM"
    closes: string; // format "HH:MM"
  };
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Dimanche, 1 = Lundi, etc.

export type FoodType = 
  | "français" 
  | "italien" 
  | "japonais" 
  | "chinois" 
  | "indien" 
  | "mexicain" 
  | "libanais" 
  | "fast-food"
  | "autre";

export type RestaurantTicketType =
  | "none" 
  | "paper" 
  | "card" 
  | "both";

export type PriceRange =
  | "€" 
  | "€€" 
  | "€€€" 
  | "€€€€";

export type ReservationType =
  | "required" 
  | "recommended" 
  | "notAvailable";

export type SpicyLevel =
  | "none"
  | "light"
  | "medium"
  | "hot";

export interface FilterOptions {
  maxDistance: number;
  takeaway: boolean | null;
  vegetarianOption: boolean | null;
  halalOption: boolean | null;
  foodTypes: FoodType[];
  restaurantTickets: RestaurantTicketType | null;
  priceRange: PriceRange[];
  reservationType: ReservationType | null;
  phoneOrderAllowed: boolean | null;
  hasCurrentPromotion: boolean | null;
  spicyLevel: SpicyLevel[];
  openOnDay?: DayOfWeek | null;
  openAtTime?: string | null; // format "HH:MM"
  incompleteOnly?: boolean | null; 
}

export interface SavedFilter {
  id: string;
  name: string;
  emoji: string;
  filter: FilterOptions;
  isDefault?: boolean;
}

export const defaultFilters: FilterOptions = {
  maxDistance: 1500,
  takeaway: null,
  vegetarianOption: null,
  halalOption: null,
  foodTypes: [],
  restaurantTickets: null,
  priceRange: [],
  reservationType: null,
  phoneOrderAllowed: null,
  hasCurrentPromotion: null,
  spicyLevel: [],
  openOnDay: null,
  openAtTime: null,
  incompleteOnly: null,
};

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
  workplaces: Workplace[];
  restaurants: Restaurant[];
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

export const defaultSavedFilters: SavedFilter[] = [
  {
    id: "all",
    name: "Tous les restaurants",
    emoji: "🍽️",
    filter: defaultFilters,
    isDefault: true
  },
  {
    id: "promo",
    name: "Promotions du jour",
    emoji: "🎁",
    filter: { ...defaultFilters, hasCurrentPromotion: true }
  },
  {
    id: "quick",
    name: "Rapide et proche",
    emoji: "⚡",
    filter: { ...defaultFilters, maxDistance: 800, takeaway: true }
  },
  {
    id: "veggie",
    name: "Végétarien",
    emoji: "🥗",
    filter: { ...defaultFilters, vegetarianOption: true }
  },
  {
    id: "cheap",
    name: "Petit budget",
    emoji: "💰",
    filter: { ...defaultFilters, priceRange: ["€"] }
  },
  {
    id: "incomplete",
    name: "À compléter",
    emoji: "📝",
    filter: { ...defaultFilters, incompleteOnly: true },
    isDefault: true
  }
];

export const filterMatchesSaved = (current: FilterOptions, saved: FilterOptions): boolean => {
  return (
    current.maxDistance === saved.maxDistance &&
    current.takeaway === saved.takeaway &&
    current.vegetarianOption === saved.vegetarianOption &&
    current.halalOption === saved.halalOption &&
    JSON.stringify(current.foodTypes.sort()) === JSON.stringify(saved.foodTypes.sort()) &&
    current.restaurantTickets === saved.restaurantTickets &&
    JSON.stringify(current.priceRange.sort()) === JSON.stringify(saved.priceRange.sort()) &&
    current.reservationType === saved.reservationType &&
    current.phoneOrderAllowed === saved.phoneOrderAllowed &&
    current.hasCurrentPromotion === saved.hasCurrentPromotion &&
    JSON.stringify(current.spicyLevel.sort()) === JSON.stringify(saved.spicyLevel.sort()) &&
    current.openOnDay === saved.openOnDay &&
    current.openAtTime === saved.openAtTime &&
    current.incompleteOnly === saved.incompleteOnly
  );
};

export interface CompletenessResult {
  score: number; // 0-100
  filled: number;
  total: number;
  missing: string[];
}

export const getCompletenessScore = (restaurant: Restaurant): CompletenessResult => {
  const checks: { label: string; filled: boolean }[] = [
    { label: "Nom", filled: !!restaurant.name },
    { label: "Type de cuisine", filled: !!restaurant.foodType && restaurant.foodType !== "autre" },
    { label: "Adresse", filled: !!restaurant.address },
    { label: "Distance", filled: restaurant.distance > 0 },
    { label: "Fourchette de prix", filled: !!restaurant.priceRange },
    { label: "Téléphone", filled: !!restaurant.phoneNumber },
    { label: "Horaires d'ouverture", filled: !!restaurant.openingHours && restaurant.openingHours.length > 0 },
    { label: "Options (emporter/veggie/halal)", filled: restaurant.takeaway || restaurant.vegetarianOption || restaurant.halalOption },
    { label: "Infos menu", filled: !!restaurant.menuInfo },
    { label: "Photos", filled: !!restaurant.menuPhotos && restaurant.menuPhotos.length > 0 },
  ];

  const filled = checks.filter(c => c.filled).length;
  const total = checks.length;
  const missing = checks.filter(c => !c.filled).map(c => c.label);
  const score = Math.round((filled / total) * 100);

  return { score, filled, total, missing };
};
