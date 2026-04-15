import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, UtensilsCrossed, Coffee, Cake, Wine, Loader2 } from "lucide-react";
import { useMenuItems } from "@/hooks/use-menu-items";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "entree", label: "Entrée", icon: UtensilsCrossed },
  { value: "plat", label: "Plat", icon: UtensilsCrossed },
  { value: "dessert", label: "Dessert", icon: Cake },
  { value: "boisson", label: "Boisson", icon: Coffee },
  { value: "autre", label: "Autre", icon: Wine },
];

interface MenuEditorProps {
  restaurantId: string;
  instanceId?: string;
  readonly?: boolean;
}

const MenuEditor: React.FC<MenuEditorProps> = ({ restaurantId, instanceId, readonly = false }) => {
  const { menuItems, loading, addItem, deleteItem } = useMenuItems(restaurantId, instanceId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("plat");

  const menuByCategory = useMemo(() => {
    const grouped: Record<string, typeof menuItems> = {};
    menuItems.forEach((item) => {
      const cat = item.category || "autre";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });
    return grouped;
  }, [menuItems]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addItem(newName.trim(), newPrice ? parseFloat(newPrice) : null, newCategory);
      setNewName("");
      setNewPrice("");
      setNewCategory("plat");
      setShowAddForm(false);
    } catch {
      toast.error("Erreur lors de l'ajout du plat");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.keys(menuByCategory).length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">
          {readonly ? "Aucun plat renseigné." : "Aucun plat pour l'instant. Ajoutez-en pour faciliter les commandes groupées."}
        </p>
      )}

      {Object.entries(menuByCategory).map(([cat, items]) => {
        const catInfo = CATEGORIES.find(c => c.value === cat) || CATEGORIES[4];
        return (
          <div key={cat}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              {catInfo.label}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">{item.itemName}</span>
                  <div className="flex items-center gap-3">
                    {item.price != null && (
                      <span className="text-xs font-semibold text-gray-400">
                        {item.price.toFixed(2)}€
                      </span>
                    )}
                    {!readonly && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {!readonly && (
        showAddForm ? (
          <div className="space-y-2 p-3 bg-gray-50 rounded-xl mt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom du plat"
              autoFocus
              className="text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <div className="flex gap-2">
              <Input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Prix (€)"
                type="number"
                step="0.01"
                className="text-sm w-28"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="text-sm border rounded-lg px-2 flex-1 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleAdd}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs"
              >
                Ajouter
              </Button>
              <Button
                type="button"
                onClick={() => { setShowAddForm(false); setNewName(""); setNewPrice(""); }}
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => setShowAddForm(true)}
            variant="outline"
            size="sm"
            className="w-full text-xs mt-1"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un plat
          </Button>
        )
      )}
    </div>
  );
};

export default MenuEditor;
