import PocketBase from 'pocketbase';
import type { Restaurant, Workplace } from '@/types/restaurant';

const pb = new PocketBase(window.location.origin);

// --- Mapping helpers ---
function mapRecordToWorkplace(r: any): Workplace {
  return {
    id: r.id,
    name: r.name,
    address: r.address,
    isActive: r.isActive || false,
  };
}

function mapRecordToRestaurant(r: any): Restaurant {
  return {
    id: r.id,
    name: r.name,
    foodType: r.foodType,
    color: r.color,
    address: r.address || undefined,
    menuInfo: r.menuInfo || undefined,
    menuPhotos: r.menuPhotos || undefined,
    takeaway: r.takeaway || false,
    vegetarianOption: r.vegetarianOption || false,
    halalOption: r.halalOption || false,
    distance: r.distance,
    workplaceId: r.workplace,
    restaurantTickets: r.restaurantTickets || 'none',
    priceRange: r.priceRange || '€',
    reservationType: r.reservationType || 'notAvailable',
    phoneOrderAllowed: r.phoneOrderAllowed || false,
    phoneNumber: r.phoneNumber || undefined,
    promotions: r.promotions || undefined,
    spicyLevel: r.spicyLevel || 'none',
    openingHours: r.openingHours || undefined,
    location: r.location || undefined,
  };
}

function mapRestaurantToRecord(r: Partial<Restaurant>): Record<string, any> {
  const data: Record<string, any> = { ...r };
  if ('workplaceId' in data) {
    data.workplace = data.workplaceId;
    delete data.workplaceId;
  }
  delete data.id;
  return data;
}

// --- Workplaces ---
export async function getWorkplaces(): Promise<Workplace[]> {
  const records = await pb.collection('workplaces').getFullList({ sort: 'name' });
  return records.map(mapRecordToWorkplace);
}

export async function createWorkplace(wp: Omit<Workplace, 'id'>): Promise<Workplace> {
  const record = await pb.collection('workplaces').create(wp);
  return mapRecordToWorkplace(record);
}

export async function updateWorkplace(id: string, wp: Partial<Workplace>): Promise<Workplace> {
  const record = await pb.collection('workplaces').update(id, wp);
  return mapRecordToWorkplace(record);
}

export async function deleteWorkplace(id: string): Promise<void> {
  await pb.collection('workplaces').delete(id);
}

// --- Restaurants ---
export async function getRestaurants(): Promise<Restaurant[]> {
  const records = await pb.collection('restaurants').getFullList({ sort: 'name' });
  return records.map(mapRecordToRestaurant);
}

export async function createRestaurant(r: Omit<Restaurant, 'id'>): Promise<Restaurant> {
  const record = await pb.collection('restaurants').create(mapRestaurantToRecord(r));
  return mapRecordToRestaurant(record);
}

export async function updateRestaurant(id: string, r: Partial<Restaurant>): Promise<Restaurant> {
  const record = await pb.collection('restaurants').update(id, mapRestaurantToRecord(r));
  return mapRecordToRestaurant(record);
}

export async function deleteRestaurant(id: string): Promise<void> {
  await pb.collection('restaurants').delete(id);
}

// --- Realtime ---
export function subscribeToRestaurants(callback: (action: string, record: Restaurant) => void) {
  return pb.collection('restaurants').subscribe('*', (e) => {
    callback(e.action, mapRecordToRestaurant(e.record));
  });
}

export function subscribeToWorkplaces(callback: (action: string, record: Workplace) => void) {
  return pb.collection('workplaces').subscribe('*', (e) => {
    callback(e.action, mapRecordToWorkplace(e.record));
  });
}

export function unsubscribeAll() {
  pb.realtime.unsubscribe();
}

// --- Delete restaurants by workplace ---
export async function deleteRestaurantsByWorkplace(workplaceId: string): Promise<void> {
  const records = await pb.collection('restaurants').getFullList({ filter: `workplace = '${workplaceId}'` });
  await Promise.all(records.map(r => pb.collection('restaurants').delete(r.id)));
}
