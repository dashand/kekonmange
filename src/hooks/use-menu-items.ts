import { useState, useEffect, useCallback } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase(window.location.origin);

export interface MenuItem {
  id: string;
  restaurant: string;
  itemName: string;
  price: number | null;
  category: string;
  instance?: string;
}

export function useMenuItems(restaurantId: string, instanceId?: string) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) { setLoading(false); return; }
    setLoading(true);
    pb.collection("menu_items")
      .getFullList({ filter: "restaurant = '" + restaurantId + "'", sort: "category,itemName" })
      .then((records) => {
        setMenuItems(records.map((r: any) => ({
          id: r.id,
          restaurant: r.restaurant,
          itemName: r.itemName,
          price: r.price || null,
          category: r.category || "",
          instance: r.instance || undefined,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const addItem = useCallback(async (itemName: string, price: number | null, category: string) => {
    const record = await pb.collection("menu_items").create({
      restaurant: restaurantId,
      itemName,
      price,
      category,
      instance: instanceId || "",
    });
    const item: MenuItem = {
      id: record.id,
      restaurant: restaurantId,
      itemName,
      price,
      category,
      instance: instanceId || undefined,
    };
    setMenuItems(prev =>
      [...prev, item].sort((a, b) =>
        a.category.localeCompare(b.category) || a.itemName.localeCompare(b.itemName)
      )
    );
    return item;
  }, [restaurantId, instanceId]);

  const deleteItem = useCallback(async (id: string) => {
    await pb.collection("menu_items").delete(id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
  }, []);

  return { menuItems, loading, addItem, deleteItem };
}
