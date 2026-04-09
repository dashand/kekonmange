import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import RestaurantForm from "@/components/RestaurantForm";
import RestaurantList from "@/components/RestaurantList";
import FilterPanel from "@/components/FilterPanel";
import FavoriteFilters from "@/components/FavoriteFilters";
import WheelOfFortune from "@/components/WheelOfFortune";
import RestaurantEditDialog from "@/components/RestaurantEditDialog";
import WorkplaceSelector from "@/components/WorkplaceSelector";
import { 
  Restaurant, FilterOptions, defaultFilters, Workplace,
  getCurrentDay, SavedFilter, defaultSavedFilters,
  getRandomColor, getCompletenessScore
} from "@/types/restaurant";
import { ChevronUp, ChevronDown, Plus, FilterX, SlidersHorizontal, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePocketBase } from "@/hooks/use-pocketbase";

const Index = () => {
  const {
    workplaces, restaurants, loading,
    addWorkplace, selectWorkplace, editWorkplace, removeWorkplace,
    addRestaurant, editRestaurant, removeRestaurant,
  } = usePocketBase();

  const activeWorkplace = workplaces.find(wp => wp.isActive) || null;
  
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem("savedFilters");
    if (!saved) return defaultSavedFilters;
    const parsed: SavedFilter[] = JSON.parse(saved);
    // Merge: ensure all default filters are present
    const merged = [...parsed];
    for (const df of defaultSavedFilters) {
      if (df.isDefault && !merged.find(f => f.id === df.id)) {
        merged.push(df);
      }
    }
    return merged;
  });
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showWorkplaces, setShowWorkplaces] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  const activeWorkplaceRestaurants = activeWorkplace 
    ? restaurants.filter(r => r.workplaceId === activeWorkplace.id)
    : [];
  
  const filteredRestaurants = activeWorkplaceRestaurants.filter((restaurant) => {
    if (restaurant.distance > filters.maxDistance) return false;
    if (filters.takeaway !== null && restaurant.takeaway !== filters.takeaway) return false;
    if (filters.vegetarianOption !== null && restaurant.vegetarianOption !== filters.vegetarianOption) return false;
    if (filters.halalOption !== null && restaurant.halalOption !== filters.halalOption) return false;
    if (filters.foodTypes.length > 0 && !filters.foodTypes.includes(restaurant.foodType as any)) return false;
    if (filters.restaurantTickets !== null && restaurant.restaurantTickets !== filters.restaurantTickets) return false;
    if (filters.priceRange.length > 0 && !filters.priceRange.includes(restaurant.priceRange as any)) return false;
    if (filters.reservationType !== null && restaurant.reservationType !== filters.reservationType) return false;
    if (filters.phoneOrderAllowed !== null && restaurant.phoneOrderAllowed !== filters.phoneOrderAllowed) return false;
    
    if (filters.hasCurrentPromotion === true) {
      const currentDay = getCurrentDay();
      const hasPromoToday = restaurant.promotions?.some(promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay);
      if (!hasPromoToday) return false;
    } else if (filters.hasCurrentPromotion === false) {
      const currentDay = getCurrentDay();
      const hasPromoToday = restaurant.promotions?.some(promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay);
      if (hasPromoToday) return false;
    }
    
    if (filters.spicyLevel.length > 0) {
      if (!restaurant.spicyLevel || !filters.spicyLevel.includes(restaurant.spicyLevel)) return false;
    }
    
    if (filters.openOnDay !== null && restaurant.openingHours) {
      const dayOH = restaurant.openingHours.find(oh => oh.dayOfWeek === filters.openOnDay);
      if (!dayOH || dayOH.closed) return false;
      
      if (filters.openAtTime && dayOH) {
        const [h, m] = filters.openAtTime.split(':').map(Number);
        const t = h * 60 + m;
        let open = false;
        if (dayOH.lunchService) {
          const [oh, om] = dayOH.lunchService.opens.split(':').map(Number);
          const [ch, cm] = dayOH.lunchService.closes.split(':').map(Number);
          if (t >= oh * 60 + om && t <= ch * 60 + cm) open = true;
        }
        if (dayOH.dinnerService && !open) {
          const [oh, om] = dayOH.dinnerService.opens.split(':').map(Number);
          const [ch, cm] = dayOH.dinnerService.closes.split(':').map(Number);
          if (t >= oh * 60 + om && t <= ch * 60 + cm) open = true;
        }
        if (!open) return false;
      }
    }
    
    if (filters.incompleteOnly === true) {
      const completeness = getCompletenessScore(restaurant);
      if (completeness.score >= 100) return false;
    }
    return true;
  });
  
  const handleAddRestaurant = async (newRestaurant: Restaurant) => {
    if (activeWorkplace) {
      newRestaurant.workplaceId = activeWorkplace.id;
      await addRestaurant(newRestaurant);
      setIsAddFormOpen(false);
      toast.success(`${newRestaurant.name} a été ajouté`);
    } else {
      toast.error("Veuillez d'abord ajouter un lieu de travail");
    }
  };
  
  const handleRemoveRestaurant = async (id: string) => {
    await removeRestaurant(id);
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedRestaurant = async (updatedRestaurant: Restaurant) => {
    await editRestaurant(updatedRestaurant);
  };
  
  const handleAddWorkplace = async (newWorkplace: Workplace) => {
    await addWorkplace(newWorkplace);
  };
  
  const handleSelectWorkplace = async (workplace: Workplace) => {
    await selectWorkplace(workplace);
  };
  
  const handleEditWorkplace = async (updatedWorkplace: Workplace) => {
    await editWorkplace(updatedWorkplace);
  };
  
  const handleDeleteWorkplace = async (id: string) => {
    const wp = workplaces.find(w => w.id === id);
    if (wp?.isActive) {
      toast.error("Vous ne pouvez pas supprimer le lieu de travail actif");
      return;
    }
    await removeWorkplace(id);
  };
  
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  
  const handleSaveFilters = (filters: SavedFilter[]) => setSavedFilters(filters);
  
  const toggleAdvancedFilters = () => setShowAdvancedFilters(!showAdvancedFilters);
  
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    toast.info("Filtres réinitialisés");
  };

  useEffect(() => {
    const checkScroll = () => setShowScrollButton(window.scrollY > 300);
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("savedFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        {showScrollButton && (
          <Button variant="secondary" size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-xl shadow-md bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 animate-fade-in"
            onClick={scrollToTop}>
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
        

        
        <section className="my-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <FavoriteFilters
              currentFilters={filters}
              onFilterSelect={setFilters}
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilters}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filteredRestaurants.length} résultat{filteredRestaurants.length !== 1 ? 's' : ''}
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleResetFilters}
                  className="h-8 flex items-center gap-1 text-xs">
                  <FilterX className="h-3.5 w-3.5" /> Réinitialiser
                </Button>
              </div>
              <Button
                variant={showAdvancedFilters ? "default" : "outline"} size="sm"
                onClick={toggleAdvancedFilters}
                className="h-8 flex items-center gap-1 text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showAdvancedFilters ? "Masquer les filtres" : "Filtres avancés"}
              </Button>
            </div>
          </div>
        </section>
        
        <section className="my-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:flex-1">
              <WheelOfFortune restaurants={filteredRestaurants} officeAddress={activeWorkplace?.address || ""} />
            </div>
            {showAdvancedFilters && (
              <div className="w-full md:w-80">
                <div className="md:sticky md:top-8">
                  <FilterPanel filters={filters} onFiltersChange={setFilters} />
                </div>
              </div>
            )}
          </div>
        </section>
        
        <Separator className="my-10" />
        
        <section className="my-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nos restaurants</h2>
          <RestaurantList
            restaurants={filteredRestaurants}
            onRemove={handleRemoveRestaurant}
            onEdit={handleEditRestaurant}
            officeAddress={activeWorkplace?.address}
          />
        </section>

        <Separator className="my-10" />

        <section className="mb-32">
          <Button
            variant="outline"
            onClick={() => setShowWorkplaces(!showWorkplaces)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-dashed border-2 border-gray-300 text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Lieux de travail</span>
            {activeWorkplace && (
              <Badge variant="secondary" className="ml-1 text-xs">{activeWorkplace.name}</Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showWorkplaces ? "rotate-180" : ""}`} />
          </Button>
          {showWorkplaces && (
            <div className="mt-4 animate-fade-in">
              <WorkplaceSelector
                workplaces={workplaces}
                onAddWorkplace={handleAddWorkplace}
                onSelectWorkplace={handleSelectWorkplace}
                onEditWorkplace={handleEditWorkplace}
                onDeleteWorkplace={handleDeleteWorkplace}
              />
            </div>
          )}
        </section>

        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <Button onClick={() => setIsAddFormOpen(true)}
            className="shadow-lg shadow-orange-500/20 font-semibold px-8 py-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white"
            size="lg">
            <Plus className="mr-2 h-5 w-5" /> Ajouter un restaurant
          </Button>
        </div>

        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un restaurant</DialogTitle>
              <DialogDescription>Renseignez les informations du restaurant.</DialogDescription>
            </DialogHeader>
            {activeWorkplace ? (
              <RestaurantForm onAdd={handleAddRestaurant} activeWorkplace={activeWorkplace} />
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg bg-card">
                <p className="text-muted-foreground">Ajoutez d'abord un lieu de travail.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>



        <RestaurantEditDialog
          restaurant={editingRestaurant}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveEditedRestaurant}
        />
      </div>
    </div>
  );
};

export default Index;
