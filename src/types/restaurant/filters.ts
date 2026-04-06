
import { FoodType, RestaurantTicketType, PriceRange, ReservationType, SpicyLevel, DayOfWeek } from "./base";

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
    id: "open",
    name: "Ouverts aujourd'hui",
    emoji: "🕒",
    filter: { ...defaultFilters, openOnDay: new Date().getDay() as DayOfWeek }
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
    current.openAtTime === saved.openAtTime
  );
};
