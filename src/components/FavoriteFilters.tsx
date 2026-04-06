
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  FilterOptions, 
  SavedFilter, 
  defaultSavedFilters, 
  filterMatchesSaved,
  defaultFilters
} from "@/types/restaurant";
import { 
  Heart, 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Check, 
  Star
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface FavoriteFiltersProps {
  currentFilters: FilterOptions;
  onFilterSelect: (filters: FilterOptions) => void;
  savedFilters: SavedFilter[];
  onSaveFilter: (filters: SavedFilter[]) => void;
}

const EMOJI_OPTIONS = ["🍔", "🍕", "🍣", "🥗", "🍜", "🌮", "🍲", "💰", "⚡", "🔥", "🌶️", "🥦", "🍹", "🍝", "🍱", "🎁", "👨‍🍳", "🧆", "🥪"];

const FavoriteFilters: React.FC<FavoriteFiltersProps> = ({
  currentFilters,
  onFilterSelect,
  savedFilters,
  onSaveFilter
}) => {
  const [isAddFilterOpen, setIsAddFilterOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🍔");
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);

  // Détermine si les filtres actuels correspondent à un filtre sauvegardé
  const getCurrentActiveFilter = () => {
    return savedFilters.find(saved => filterMatchesSaved(currentFilters, saved.filter));
  };

  const activeFilter = getCurrentActiveFilter();

  const handleSaveCurrentFilter = () => {
    if (newFilterName.trim() === "") {
      toast.error("Veuillez donner un nom à votre filtre");
      return;
    }

    const newFilter: SavedFilter = {
      id: editingFilter?.id || uuidv4(),
      name: newFilterName,
      emoji: selectedEmoji,
      filter: { ...currentFilters }
    };

    let updatedFilters: SavedFilter[];

    if (editingFilter) {
      // Mise à jour d'un filtre existant
      updatedFilters = savedFilters.map(filter => 
        filter.id === editingFilter.id ? newFilter : filter
      );
      toast.success(`Filtre "${newFilterName}" mis à jour`);
    } else {
      // Ajout d'un nouveau filtre
      updatedFilters = [...savedFilters, newFilter];
      toast.success(`Filtre "${newFilterName}" ajouté aux favoris`);
    }

    onSaveFilter(updatedFilters);
    setIsAddFilterOpen(false);
    setNewFilterName("");
    setSelectedEmoji("🍔");
    setEditingFilter(null);
  };

  const handleEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setNewFilterName(filter.name);
    setSelectedEmoji(filter.emoji);
    setIsAddFilterOpen(true);
  };

  const handleDeleteFilter = (id: string) => {
    const updatedFilters = savedFilters.filter(filter => filter.id !== id);
    onSaveFilter(updatedFilters);
    toast.success("Filtre supprimé des favoris");
  };

  const handleSelectFilter = (filter: SavedFilter) => {
    onFilterSelect(filter.filter);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          Filtres favoris
        </h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setEditingFilter(null);
            setNewFilterName("");
            setSelectedEmoji("🍔");
            setIsAddFilterOpen(true);
          }}
          className="rounded-full h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Ajouter un filtre favori</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {savedFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant={activeFilter?.id === filter.id ? "favorite" : "outline"}
            className={`cursor-pointer px-3 py-1 ${filter.isDefault ? 'border-dashed' : ''}`}
            onClick={() => handleSelectFilter(filter)}
          >
            <span>{filter.emoji}</span> {filter.name}
            {!filter.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditFilter(filter);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </Badge>
        ))}
      </div>

      {/* Sheet pour ajouter ou éditer un filtre favori */}
      <Sheet open={isAddFilterOpen} onOpenChange={setIsAddFilterOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingFilter ? "Modifier le filtre" : "Enregistrer comme filtre favori"}
            </SheetTitle>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Nom du filtre</Label>
              <Input
                id="filter-name"
                placeholder="ex: Restaurants italiens proches"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Icône</Label>
              <div className="grid grid-cols-10 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={selectedEmoji === emoji ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedEmoji(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />
            
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Ce filtre inclura les critères suivants :
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {currentFilters.maxDistance < 1500 && (
                  <li>• Distance max: {currentFilters.maxDistance < 1000 ? `${currentFilters.maxDistance}m` : `${(currentFilters.maxDistance/1000).toFixed(1)}km`}</li>
                )}
                {currentFilters.takeaway !== null && (
                  <li>• À emporter: {currentFilters.takeaway ? "Oui" : "Non"}</li>
                )}
                {currentFilters.vegetarianOption !== null && (
                  <li>• Option végétarienne: {currentFilters.vegetarianOption ? "Oui" : "Non"}</li>
                )}
                {currentFilters.halalOption !== null && (
                  <li>• Option halal: {currentFilters.halalOption ? "Oui" : "Non"}</li>
                )}
                {currentFilters.foodTypes.length > 0 && (
                  <li>• Cuisine: {currentFilters.foodTypes.join(", ")}</li>
                )}
                {currentFilters.restaurantTickets !== null && (
                  <li>• Tickets restaurant: {currentFilters.restaurantTickets}</li>
                )}
                {currentFilters.priceRange.length > 0 && (
                  <li>• Prix: {currentFilters.priceRange.join(", ")}</li>
                )}
                {currentFilters.spicyLevel.length > 0 && (
                  <li>• Niveau de piment: {currentFilters.spicyLevel.join(", ")}</li>
                )}
                {currentFilters.hasCurrentPromotion !== null && (
                  <li>• Promotion du jour: {currentFilters.hasCurrentPromotion ? "Oui" : "Non"}</li>
                )}
                {currentFilters.openOnDay !== null && (
                  <li>• Ouvert le: {currentFilters.openOnDay}</li>
                )}
              </ul>
            </div>
          </div>
          
          <SheetFooter>
            {editingFilter && !editingFilter.isDefault && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteFilter(editingFilter.id);
                  setIsAddFilterOpen(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
            <Button onClick={handleSaveCurrentFilter}>
              <Check className="mr-2 h-4 w-4" />
              {editingFilter ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default FavoriteFilters;
