import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroupOrder, MenuItem } from "@/hooks/use-group-order";
import {
  ShoppingCart, Plus, Trash2, Check, Copy, Users,
  UtensilsCrossed, Coffee, Cake, Wine, X, ChevronDown, ChevronUp,
  ClipboardList, CheckCircle2, Circle
} from "lucide-react";
import { toast } from "sonner";

interface GroupOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurantId: string;
  restaurantName: string;
  instanceId?: string;
  nickname: string;
}

const CATEGORIES = [
  { value: "entree", label: "Entr\u00e9e", icon: UtensilsCrossed },
  { value: "plat", label: "Plat", icon: UtensilsCrossed },
  { value: "dessert", label: "Dessert", icon: Cake },
  { value: "boisson", label: "Boisson", icon: Coffee },
  { value: "autre", label: "Autre", icon: Wine },
];

const GroupOrderDialog: React.FC<GroupOrderDialogProps> = ({
  open,
  onOpenChange,
  restaurantId,
  restaurantName,
  instanceId,
  nickname,
}) => {
  const {
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
  } = useGroupOrder(restaurantId, instanceId);

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("plat");
  const [showMenu, setShowMenu] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  const handleAddMenuItem = async () => {
    if (!newItemName.trim()) return;
    await addMenuItem(
      newItemName.trim(),
      newItemPrice ? parseFloat(newItemPrice) : null,
      newItemCategory
    );
    setNewItemName("");
    setNewItemPrice("");
    setShowAddItem(false);
  };

  const handleAddToOrder = async (item: MenuItem) => {
    if (!activeOrder) return;
    await addOrderItem(nickname, item.id, item.itemName, item.price, 1);
    toast.success(item.itemName + " ajout\u00e9 \u00e0 ta commande");
  };

  const handleAddCustomToOrder = async () => {
    if (!activeOrder || !customItemName.trim()) return;
    await addOrderItem(
      nickname,
      undefined,
      customItemName.trim(),
      customItemPrice ? parseFloat(customItemPrice) : null,
      1
    );
    toast.success(customItemName.trim() + " ajout\u00e9");
    setCustomItemName("");
    setCustomItemPrice("");
  };

  // Group order items by person
  const orderByPerson = useMemo(() => {
    const grouped: Record<string, typeof orderItems> = {};
    orderItems.forEach((item) => {
      if (!grouped[item.nickname]) grouped[item.nickname] = [];
      grouped[item.nickname].push(item);
    });
    return grouped;
  }, [orderItems]);

  const totalGeneral = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  }, [orderItems]);

  const allReceived = orderItems.length > 0 && orderItems.every((i) => i.received);

  const copySummary = () => {
    const lines = ["Commande " + restaurantName + " - " + new Date().toLocaleDateString("fr-FR"), ""];
    Object.entries(orderByPerson).forEach(([person, items]) => {
      lines.push(person + " :");
      items.forEach((item) => {
        const name = item.customName || menuItems.find((m) => m.id === item.menuItem)?.itemName || "?";
        const price = item.price ? " (" + item.price.toFixed(2) + "\u20ac)" : "";
        lines.push("  - " + (item.quantity > 1 ? item.quantity + "x " : "") + name + price);
      });
      const personTotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
      if (personTotal > 0) lines.push("  Total: " + personTotal.toFixed(2) + "\u20ac");
      lines.push("");
    });
    if (totalGeneral > 0) lines.push("TOTAL: " + totalGeneral.toFixed(2) + "\u20ac");
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Commande copi\u00e9e !");
  };

  const menuByCategory = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    menuItems.forEach((item) => {
      const cat = item.category || "autre";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [menuItems]);

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-orange-500" />
            Commande group\u00e9e \u2014 {restaurantName}
          </DialogTitle>
        </DialogHeader>

        {/* No active order: start or manage menu */}
        {!activeOrder ? (
          <div className="space-y-4">
            <Button
              onClick={startOrder}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-xl"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Lancer une commande group\u00e9e
            </Button>

            {/* Menu management */}
            <div className="border rounded-xl p-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowMenu(!showMenu)}
              >
                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-orange-400" />
                  Menu ({menuItems.length} plats)
                </h3>
                {showMenu ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </div>

              {showMenu && (
                <div className="mt-3 space-y-3">
                  {Object.entries(menuByCategory).map(([cat, items]) => {
                    const catInfo = CATEGORIES.find((c) => c.value === cat) || CATEGORIES[4];
                    return (
                      <div key={cat}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                          {catInfo.label}
                        </p>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50"
                          >
                            <span className="text-sm text-gray-700">{item.itemName}</span>
                            <div className="flex items-center gap-2">
                              {item.price && (
                                <span className="text-xs font-semibold text-gray-500">
                                  {item.price.toFixed(2)}\u20ac
                                </span>
                              )}
                              <button
                                onClick={() => deleteMenuItem(item.id)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {menuItems.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">
                      Aucun plat dans le menu. Ajoutez-en pour faciliter les commandes.
                    </p>
                  )}

                  {showAddItem ? (
                    <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
                      <Input
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Nom du plat"
                        autoFocus
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Input
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          placeholder="Prix (\u20ac)"
                          type="number"
                          step="0.01"
                          className="text-sm w-24"
                        />
                        <select
                          value={newItemCategory}
                          onChange={(e) => setNewItemCategory(e.target.value)}
                          className="text-sm border rounded-lg px-2 flex-1"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddMenuItem} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                          Ajouter
                        </Button>
                        <Button onClick={() => setShowAddItem(false)} variant="ghost" size="sm" className="text-xs">
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowAddItem(true)}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un plat au menu
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active order */
          <div className="space-y-4">
            {/* Status */}
            <div className={"px-3 py-2 rounded-xl text-xs font-medium text-center " + (activeOrder.status === "open" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500")}>
              {activeOrder.status === "open" ? "Commande en cours" : "Commande cl\u00f4tur\u00e9e"} \u2014 {orderItems.length} article{orderItems.length !== 1 ? "s" : ""} \u2014 {Object.keys(orderByPerson).length} personne{Object.keys(orderByPerson).length !== 1 ? "s" : ""}
            </div>

            {/* Toggle menu/summary */}
            <div className="flex gap-2">
              <Button
                onClick={() => { setShowSummary(false); setShowMenu(true); }}
                variant={!showSummary ? "default" : "outline"}
                size="sm"
                className={"flex-1 text-xs rounded-xl " + (!showSummary ? "bg-orange-500 hover:bg-orange-600" : "")}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Commander
              </Button>
              <Button
                onClick={() => { setShowSummary(true); setShowMenu(false); }}
                variant={showSummary ? "default" : "outline"}
                size="sm"
                className={"flex-1 text-xs rounded-xl " + (showSummary ? "bg-orange-500 hover:bg-orange-600" : "")}
              >
                <Users className="h-3.5 w-3.5 mr-1" /> Synth\u00e8se
              </Button>
            </div>

            {/* Order mode */}
            {!showSummary && activeOrder.status === "open" && (
              <div className="space-y-3">
                {/* Menu items to add */}
                {menuItems.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Menu</p>
                    {Object.entries(menuByCategory).map(([cat, items]) => {
                      const catInfo = CATEGORIES.find((c) => c.value === cat) || CATEGORIES[4];
                      return (
                        <div key={cat}>
                          <p className="text-[10px] text-gray-400 uppercase mt-2 mb-1">{catInfo.label}</p>
                          {items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleAddToOrder(item)}
                              className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                            >
                              <span className="text-sm text-gray-700">{item.itemName}</span>
                              <div className="flex items-center gap-2">
                                {item.price && (
                                  <span className="text-xs font-semibold text-gray-400">
                                    {item.price.toFixed(2)}\u20ac
                                  </span>
                                )}
                                <Plus className="h-4 w-4 text-orange-400" />
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Custom item */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-gray-500">Plat hors menu</p>
                  <div className="flex gap-2">
                    <Input
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      placeholder="Nom du plat"
                      className="text-sm flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleAddCustomToOrder()}
                    />
                    <Input
                      value={customItemPrice}
                      onChange={(e) => setCustomItemPrice(e.target.value)}
                      placeholder="Prix"
                      type="number"
                      step="0.01"
                      className="text-sm w-20"
                    />
                    <Button onClick={handleAddCustomToOrder} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* My items */}
                {orderItems.filter((i) => i.nickname === nickname).length > 0 && (
                  <div className="border rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Ma commande</p>
                    {orderItems
                      .filter((i) => i.nickname === nickname)
                      .map((item) => {
                        const name = item.customName || menuItems.find((m) => m.id === item.menuItem)?.itemName || "?";
                        return (
                          <div key={item.id} className="flex items-center justify-between py-1">
                            <span className="text-sm text-gray-700">
                              {item.quantity > 1 && <span className="font-semibold text-orange-500">{item.quantity}x </span>}
                              {name}
                            </span>
                            <div className="flex items-center gap-2">
                              {item.price ? <span className="text-xs text-gray-400">{(item.price * item.quantity).toFixed(2)}\u20ac</span> : null}
                              <button onClick={() => removeOrderItem(item.id)} className="text-gray-300 hover:text-red-500">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Summary mode */}
            {showSummary && (
              <div className="space-y-3">
                {Object.entries(orderByPerson).map(([person, items]) => {
                  const personTotal = items.reduce((s, i) => s + (i.price || 0) * i.quantity, 0);
                  return (
                    <div key={person} className="border rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm text-gray-800">{person}</p>
                        {personTotal > 0 && (
                          <span className="text-xs font-semibold text-orange-500">{personTotal.toFixed(2)}\u20ac</span>
                        )}
                      </div>
                      {items.map((item) => {
                        const name = item.customName || menuItems.find((m) => m.id === item.menuItem)?.itemName || "?";
                        return (
                          <div key={item.id} className="flex items-center gap-2 py-1">
                            <button
                              onClick={() => toggleReceived(item.id, !item.received)}
                              className="shrink-0"
                            >
                              {item.received ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-300" />
                              )}
                            </button>
                            <span className={"text-sm flex-1 " + (item.received ? "line-through text-gray-400" : "text-gray-700")}>
                              {item.quantity > 1 && <span className="font-semibold">{item.quantity}x </span>}
                              {name}
                            </span>
                            {item.price ? (
                              <span className="text-xs text-gray-400">{(item.price * item.quantity).toFixed(2)}\u20ac</span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {orderItems.length === 0 && (
                  <p className="text-center text-sm text-gray-400 py-4">Aucune commande pour le moment</p>
                )}

                {/* Total */}
                {totalGeneral > 0 && (
                  <div className="flex items-center justify-between px-3 py-2 bg-orange-50 rounded-xl">
                    <span className="font-bold text-sm text-gray-800">Total</span>
                    <span className="font-bold text-sm text-orange-600">{totalGeneral.toFixed(2)}\u20ac</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={copySummary} variant="outline" size="sm" className="flex-1 text-xs rounded-xl">
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copier
                  </Button>
                  {activeOrder.status === "open" && (
                    <Button onClick={closeOrder} variant="outline" size="sm" className="flex-1 text-xs rounded-xl text-red-500 hover:text-red-600">
                      <Check className="h-3.5 w-3.5 mr-1" /> Cl\u00f4turer
                    </Button>
                  )}
                </div>

                {allReceived && orderItems.length > 0 && (
                  <p className="text-center text-sm text-emerald-500 font-semibold">
                    Toutes les commandes ont \u00e9t\u00e9 r\u00e9ceptionn\u00e9es !
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupOrderDialog;
