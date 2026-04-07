import PocketBase from 'pocketbase';

const pb = new PocketBase(window.location.origin);

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export interface OsmRestaurant {
  osmId: number;
  name: string;
  lat: number;
  lon: number;
  cuisine?: string;
  phone?: string;
  openingHours?: string;
  address?: string;
  vegetarian?: boolean;
  halal?: boolean;
  takeaway?: boolean;
  website?: string;
  distance?: number;
}

interface CacheRecord {
  id: string;
  workplaceId: string;
  lat: number;
  lon: number;
  radius: number;
  data: OsmRestaurant[];
  fetchedAt: string;
}

// --- Geocoding via Nominatim ---
export async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
    { headers: { 'User-Agent': 'KekonMange/1.0' } }
  );
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

// --- Haversine distance ---
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const p = Math.PI / 180;
  const a = Math.sin((lat2 - lat1) * p / 2) ** 2 +
    Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin((lon2 - lon1) * p / 2) ** 2;
  return Math.round(R * 2 * Math.asin(Math.sqrt(a)));
}

// --- Parse Overpass response ---
function parseOverpassElements(elements: any[], refLat: number, refLon: number): OsmRestaurant[] {
  return elements
    .filter((e: any) => e.tags?.name)
    .map((e: any) => {
      const t = e.tags || {};
      return {
        osmId: e.id,
        name: t.name,
        lat: e.lat,
        lon: e.lon,
        cuisine: t.cuisine || undefined,
        phone: t.phone || t['contact:phone'] || undefined,
        openingHours: t.opening_hours || undefined,
        address: [t['addr:housenumber'], t['addr:street'], t['addr:postcode'], t['addr:city']]
          .filter(Boolean).join(' ') || undefined,
        vegetarian: t['diet:vegetarian'] === 'yes' || undefined,
        halal: t['diet:halal'] === 'yes' || undefined,
        takeaway: (t.takeaway === 'yes' || t.takeaway === 'only') || undefined,
        website: t.website || t['contact:website'] || undefined,
        distance: haversine(refLat, refLon, e.lat, e.lon),
      };
    })
    .sort((a: OsmRestaurant, b: OsmRestaurant) => (a.distance || 0) - (b.distance || 0));
}

// --- Fetch from Overpass ---
async function fetchFromOverpass(lat: number, lon: number, radius: number): Promise<OsmRestaurant[]> {
  const query = `[out:json][timeout:30];(node["amenity"="restaurant"](around:${radius},${lat},${lon});node["amenity"="fast_food"](around:${radius},${lat},${lon}););out body;`;
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
  const data = await res.json();
  return parseOverpassElements(data.elements || [], lat, lon);
}

// --- Cache management ---
async function getCachedData(workplaceId: string): Promise<CacheRecord | null> {
  try {
    const records = await pb.collection('osm_cache').getFullList({
      filter: `workplaceId = '${workplaceId}'`,
    });
    if (records.length === 0) return null;
    return records[0] as unknown as CacheRecord;
  } catch {
    return null;
  }
}

function isCacheFresh(fetchedAt: string): boolean {
  return Date.now() - new Date(fetchedAt).getTime() < CACHE_TTL_MS;
}

// --- Main API: get restaurants around a workplace ---
export async function getOsmRestaurants(
  workplaceId: string,
  workplaceAddress: string,
  radius: number = 500
): Promise<{ restaurants: OsmRestaurant[]; fromCache: boolean; cacheDate?: string }> {
  // Check cache
  const cached = await getCachedData(workplaceId);
  if (cached && isCacheFresh(cached.fetchedAt)) {
    return { restaurants: cached.data, fromCache: true, cacheDate: cached.fetchedAt };
  }

  // Geocode workplace address
  const coords = await geocodeAddress(workplaceAddress);
  if (!coords) throw new Error('Adresse introuvable');

  // Fetch from Overpass
  const restaurants = await fetchFromOverpass(coords.lat, coords.lon, radius);

  // Update or create cache
  const now = new Date().toISOString();
  try {
    if (cached) {
      await pb.collection('osm_cache').update(cached.id, {
        lat: coords.lat,
        lon: coords.lon,
        radius,
        data: restaurants,
        fetchedAt: now,
      });
    } else {
      await pb.collection('osm_cache').create({
        workplaceId,
        lat: coords.lat,
        lon: coords.lon,
        radius,
        data: restaurants,
        fetchedAt: now,
      });
    }
  } catch (err) {
    console.warn('Failed to update OSM cache:', err);
  }

  return { restaurants, fromCache: false, cacheDate: now };
}

// --- Search within cached results ---
export function searchOsmRestaurants(restaurants: OsmRestaurant[], query: string): OsmRestaurant[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return restaurants.filter(r =>
    r.name.toLowerCase().includes(q) ||
    (r.cuisine && r.cuisine.toLowerCase().includes(q)) ||
    (r.address && r.address.toLowerCase().includes(q))
  ).slice(0, 10);
}
