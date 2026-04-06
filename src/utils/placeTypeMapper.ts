
import { FoodType } from "@/types/restaurant";

// Fonction pour déterminer le type de cuisine en fonction des types de lieu Google Maps
export const getFoodTypeFromPlaceTypes = (types: string[]): FoodType => {
  // Mapping des types Google vers nos types de cuisine
  const typeMapping: Record<string, FoodType> = {
    'restaurant_french': 'français',
    'restaurant_italian': 'italien',
    'restaurant_japanese': 'japonais',
    'restaurant_chinese': 'chinois',
    'restaurant_indian': 'indien',
    'restaurant_mexican': 'mexicain',
    'restaurant_lebanese': 'libanais',
    'fast_food': 'fast-food',
  };

  // Vérifier les types connus
  for (const type of types) {
    if (type in typeMapping) {
      return typeMapping[type];
    }
  }

  // Vérifier les mots-clés dans les types
  if (types.some(t => t.includes('french') || t.includes('bistro'))) {
    return 'français';
  } else if (types.some(t => t.includes('italian') || t.includes('pizza'))) {
    return 'italien';
  } else if (types.some(t => t.includes('japanese') || t.includes('sushi'))) {
    return 'japonais';
  } else if (types.some(t => t.includes('chinese'))) {
    return 'chinois';
  } else if (types.some(t => t.includes('indian'))) {
    return 'indien';
  } else if (types.some(t => t.includes('mexican'))) {
    return 'mexicain';
  } else if (types.some(t => t.includes('lebanese') || t.includes('middle_eastern'))) {
    return 'libanais';
  } else if (types.some(t => t.includes('fast_food') || t.includes('burger'))) {
    return 'fast-food';
  }

  // Par défaut
  return 'autre';
};

// Fonction pour estimer la distance entre deux points géographiques (formule de Haversine)
export const calculateHaversineDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // en mètres
  return Math.round(distance);
};
