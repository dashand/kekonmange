import { useState, useEffect, useCallback } from "react";
import PocketBase from "pocketbase";
import { toast } from "sonner";

const pb = new PocketBase(window.location.origin);

export interface MenuItem {
  id: string;
  restaurant: string;
  itemName: string;
  price: number | null;
  category: string;
  instance?: string;
}

export interface GroupOrder {
  id: string;
  restaurant: string;
  orderDate: string;
  status: "open" | "closed";
  instance?: string;
}

export interface OrderItem {
  id: string;
  groupOrder: string;
  menuItem?: string;
  customName?: string;
  price: number | null;
  quantity: number;
  nickname: string;
  received: boolean;
  instance?: string;
}

const today = () => new Date().toISOString().split("T")[0];

export function useGroupOrder(restaurantId: string, instanceId?: string) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeOrder, setActiveOrder] = useState<GroupOrder | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load menu items for this restaurant
  useEffect(() => {
    const filter = "restaurant = '" + restaurantId + "'";
    pb.collection("menu_items")
      .getFullList({ filter, sort: "category,itemName" })
      .then((records) => {
        setMenuItems(
          records.map((r: any) => ({
            id: r.id,
            restaurant: r.restaurant,
            itemName: r.itemName,
            price: r.price || null,
            category: r.category || "",
            instance: r.instance || undefined,
          }))
        );
      })
      .catch(console.error);
  }, [restaurantId]);

  // Load or find today's order
  useEffect(() => {
    const filter = "restaurant = '" + restaurantId + "' && orderDate = '" + today() + "'";
    pb.collection("group_orders")
      .getFullList({ filter })
      .then((records) => {
        if (records.length > 0) {
          const r = records[0];
          const order: GroupOrder = {
            id: r.id,
            restaurant: r.restaurant,
            orderDate: r.orderDate,
            status: r.status as "open" | "closed",
            instance: r.instance || undefined,
          };
          setActiveOrder(order);
          // Load order items
          return pb
            .collection("order_items")
            .getFullList({ filter: "groupOrder = '" + r.id + "'" })
            .then((items) => {
              setOrderItems(
                items.map((i: any) => ({
                  id: i.id,
                  groupOrder: i.groupOrder,
                  menuItem: i.menuItem || undefined,
                  customName: i.customName || undefined,
                  price: i.price || null,
                  quantity: i.quantity,
                  nickname: i.nickname,
                  received: i.received || false,
                  instance: i.instance || undefined,
                }))
              );
            });
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // Realtime for order_items
  useEffect(() => {
    if (!activeOrder) return;
    pb.collection("order_items").subscribe("*", (e) => {
      const item: OrderItem = {
        id: e.record.id,
        groupOrder: e.record.groupOrder,
        menuItem: e.record.menuItem || undefined,
        customName: e.record.customName || undefined,
        price: e.record.price || null,
        quantity: e.record.quantity,
        nickname: e.record.nickname,
        received: e.record.received || false,
        instance: e.record.instance || undefined,
      };
      if (item.groupOrder !== activeOrder.id) return;
      setOrderItems((prev) => {
        if (e.action === "create") {
          if (prev.find((x) => x.id === item.id)) return prev;
          return [...prev, item];
        }
        if (e.action === "update")
          return prev.map((x) => (x.id === item.id ? item : x));
        if (e.action === "delete")
          return prev.filter((x) => x.id !== item.id);
        return prev;
      });
    });
    return () => {
      pb.collection("order_items").unsubscribe("*");
    };
  }, [activeOrder?.id]);

  // Start a new group order
  const startOrder = useCallback(async () => {
    try {
      const record = await pb.collection("group_orders").create({
        restaurant: restaurantId,
        orderDate: today(),
        status: "open",
        instance: instanceId || "",
      });
      const order: GroupOrder = {
        id: record.id,
        restaurant: record.restaurant,
        orderDate: record.orderDate,
        status: "open",
        instance: record.instance || undefined,
      };
      setActiveOrder(order);
      toast.success("Commande groupée ouverte !");
      return order;
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création de la commande");
    }
  }, [restaurantId, instanceId]);

  // Add a menu item
  const addMenuItem = useCallback(
    async (itemName: string, price: number | null, category: string) => {
      try {
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
        setMenuItems((prev) => [...prev, item]);
        return item;
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de l'ajout du plat");
      }
    },
    [restaurantId, instanceId]
  );

  // Delete a menu item
  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      await pb.collection("menu_items").delete(id);
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  }, []);

  // Add item to order
  const addOrderItem = useCallback(
    async (
      nickname: string,
      menuItemId?: string,
      customName?: string,
      price?: number | null,
      quantity: number = 1
    ) => {
      if (!activeOrder) return;
      try {
        await pb.collection("order_items").create({
          groupOrder: activeOrder.id,
          menuItem: menuItemId || "",
          customName: customName || "",
          price: price || 0,
          quantity,
          nickname,
          received: false,
          instance: instanceId || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Erreur lors de l'ajout à la commande");
      }
    },
    [activeOrder?.id, instanceId]
  );

  // Remove order item
  const removeOrderItem = useCallback(async (id: string) => {
    try {
      await pb.collection("order_items").delete(id);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la suppression");
    }
  }, []);

  // Toggle received
  const toggleReceived = useCallback(async (id: string, received: boolean) => {
    try {
      await pb.collection("order_items").update(id, { received });
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Close order
  const closeOrder = useCallback(async () => {
    if (!activeOrder) return;
    try {
      await pb.collection("group_orders").update(activeOrder.id, {
        status: "closed",
      });
      setActiveOrder((prev) => (prev ? { ...prev, status: "closed" } : null));
      toast.success("Commande clôturée");
    } catch (err) {
      console.error(err);
    }
  }, [activeOrder?.id]);

  return {
    menuItems,
    activeOrder,
    orderItems,
    loading,
    startOrder,
    addMenuItem,
    deleteMenuItem,
    addOrderItem,
    removeOrderItem,
    toggleReceived,
    closeOrder,
  };
}
