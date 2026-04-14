import { describe, it, expect } from "vitest";
import {
  getDayName,
  getSpicyLevelLabel,
  getDayHourLabel,
  getCompletenessScore,
  filterMatchesSaved,
  getRandomColor,
  defaultFilters,
  type Restaurant,
  type DayOfWeek,
} from "./restaurant";

describe("getDayName", () => {
  it("returns correct day names", () => {
    expect(getDayName(0)).toBe("Dimanche");
    expect(getDayName(1)).toBe("Lundi");
    expect(getDayName(6)).toBe("Samedi");
  });
});

describe("getSpicyLevelLabel", () => {
  it("returns labels for all levels", () => {
    expect(getSpicyLevelLabel("none")).toBe("Non pimenté");
    expect(getSpicyLevelLabel("light")).toBe("Légèrement pimenté");
    expect(getSpicyLevelLabel("medium")).toBe("Réchauffe en hiver");
    expect(getSpicyLevelLabel("hot")).toBe("Porte de l'enfer");
  });
});

describe("getDayHourLabel", () => {
  it("returns day name without time", () => {
    expect(getDayHourLabel(1)).toBe("Lundi");
  });

  it("returns day name with time", () => {
    expect(getDayHourLabel(1, "12:00")).toBe("Lundi à 12:00");
  });
});

describe("getRandomColor", () => {
  it("returns a valid hex color", () => {
    const color = getRandomColor();
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe("filterMatchesSaved", () => {
  it("returns true for identical filters", () => {
    expect(filterMatchesSaved(defaultFilters, { ...defaultFilters })).toBe(true);
  });

  it("returns false when maxDistance differs", () => {
    expect(filterMatchesSaved(defaultFilters, { ...defaultFilters, maxDistance: 500 })).toBe(false);
  });

  it("returns false when a boolean filter differs", () => {
    expect(filterMatchesSaved(defaultFilters, { ...defaultFilters, takeaway: true })).toBe(false);
  });

  it("matches regardless of array order", () => {
    const a = { ...defaultFilters, foodTypes: ["français" as any, "italien" as any] };
    const b = { ...defaultFilters, foodTypes: ["italien" as any, "français" as any] };
    expect(filterMatchesSaved(a, b)).toBe(true);
  });
});

describe("getCompletenessScore", () => {
  const baseRestaurant: Restaurant = {
    id: "1",
    name: "",
    foodType: "",
    color: "#000",
    takeaway: false,
    vegetarianOption: false,
    halalOption: false,
    distance: 0,
    workplaceId: "w1",
    restaurantTickets: "none",
    priceRange: "€",
    reservationType: "notAvailable",
    phoneOrderAllowed: false,
  };

  it("returns 0% for empty restaurant", () => {
    const result = getCompletenessScore(baseRestaurant);
    // Only priceRange is filled
    expect(result.score).toBeLessThan(20);
    expect(result.missing.length).toBeGreaterThan(5);
  });

  it("returns 100% for complete restaurant", () => {
    const complete: Restaurant = {
      ...baseRestaurant,
      name: "Le Bistrot",
      foodType: "français",
      address: "1 rue de Paris",
      distance: 500,
      priceRange: "€€",
      phoneNumber: "0123456789",
      openingHours: [{ dayOfWeek: 1, closed: false, lunchService: { opens: "12:00", closes: "14:00" } }],
      takeaway: true,
      menuInfo: "Plat du jour à 12€",
      menuPhotos: ["photo1.jpg"],
    };
    const result = getCompletenessScore(complete);
    expect(result.score).toBe(100);
    expect(result.missing).toHaveLength(0);
  });

  it("lists missing fields", () => {
    const partial: Restaurant = {
      ...baseRestaurant,
      name: "Test",
      foodType: "français",
      address: "1 rue",
      distance: 100,
    };
    const result = getCompletenessScore(partial);
    expect(result.missing).toContain("Téléphone");
    expect(result.missing).not.toContain("Nom");
  });
});
