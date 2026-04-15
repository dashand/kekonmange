import { useState, useEffect } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase(window.location.origin);

export interface ActiveGroupOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  itemCount: number;
  status: "open" | "closed";
}

const today = () => new Date().toISOString().split("T")[0];

export function useActiveGroupOrders(instanceId?: string) {
  const [activeOrders, setActiveOrders] = useState<ActiveGroupOrder[]>([]);

  const load = async () => {
    if (!instanceId) return;
    try {
      const filter =
        "status = 'open' && orderDate = '" +
        today() +
        "' && instance = '" +
        instanceId +
        "'";
      const records = await pb
        .collection("group_orders")
        .getFullList({ filter, expand: "restaurant" });

      const orders: ActiveGroupOrder[] = await Promise.all(
        records.map(async (r: any) => {
          const items = await pb
            .collection("order_items")
            .getFullList({ filter: "groupOrder = '" + r.id + "'" });
          return {
            id: r.id,
            restaurantId: r.restaurant,
            restaurantName: r.expand?.restaurant?.name ?? r.restaurant,
            itemCount: items.length,
            status: r.status as "open" | "closed",
          };
        })
      );
      setActiveOrders(orders);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [instanceId]);

  // Realtime: refresh on any group_order change
  useEffect(() => {
    if (!instanceId) return;
    pb.collection("group_orders").subscribe("*", () => load());
    pb.collection("order_items").subscribe("*", () => load());
    return () => {
      pb.collection("group_orders").unsubscribe("*");
      pb.collection("order_items").unsubscribe("*");
    };
  }, [instanceId]);

  return { activeOrders };
}
