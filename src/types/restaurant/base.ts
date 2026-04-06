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
