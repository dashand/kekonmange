import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import RestaurantForm from "@/components/RestaurantForm";
import RestaurantList from "@/components/RestaurantList";
import FilterPanel from "@/components/FilterPanel";
import FavoriteFilters from "@/components/FavoriteFilters";
import WheelOfFortune from "@/components/WheelOfFortune";
import RestaurantEditDialog from "@/components/RestaurantEditDialog";
import WorkplaceSelector from "@/components/WorkplaceSelector";
import DataTransferPanel from "@/components/DataTransferPanel";
import PlaceSearch, { PlaceResult } from "@/components/PlaceSearch";
import { 
  Restaurant, 
  FilterOptions, 
  defaultFilters, 
  Workplace, 
  getCurrentDay, 
  SavedFilter,
  defaultSavedFilters,
  getRandomColor
} from "@/types/restaurant";
import { v4 as uuidv4 } from "uuid";
import { ChevronUp, Plus, Share2, FilterX, SlidersHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { importData, importDataFromUrl } from "@/utils/dataTransfer";

const Index = () => {
  // État pour les lieux de travail
  const [workplaces, setWorkplaces] = useState<Workplace[]>(() => {
    const saved = localStorage.getItem("workplaces");
    if (saved) {
      return JSON.parse(saved);
    }
    
    const savedOfficeAddress = localStorage.getItem("officeAddress");
    if (savedOfficeAddress && savedOfficeAddress.trim()) {
      return [
        {
          id: uuidv4(),
          name: "Mon bureau",
          address: savedOfficeAddress,
          isActive: true
        }
      ];
    }
    
    return [];
  });

  // On récupère le lieu de travail actif
  const activeWorkplace = workplaces.find(wp => wp.isActive) || null;
  
  // État pour les restaurants
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem("restaurants");
    if (saved) {
      const parsedRestaurants = JSON.parse(saved);
      
      if (activeWorkplace) {
        return parsedRestaurants.map((r: Restaurant) => {
          const restaurantWithDefaults = {
            ...r,
            restaurantTickets: r.restaurantTickets || "none",
            priceRange: r.priceRange || "€",
            reservationType: r.reservationType || "notAvailable",
            phoneOrderAllowed: r.phoneOrderAllowed || false,
            spicyLevel: r.spicyLevel || "none",
          };
          
          return restaurantWithDefaults.workplaceId ? restaurantWithDefaults : { 
            ...restaurantWithDefaults, 
            workplaceId: activeWorkplace.id 
          };
        });
      }
      
      return parsedRestaurants.map((r: Restaurant) => ({
        ...r,
        restaurantTickets: r.restaurantTickets || "none",
        priceRange: r.priceRange || "€",
        reservationType: r.reservationType || "notAvailable",
        phoneOrderAllowed: r.phoneOrderAllowed || false,
        spicyLevel: r.spicyLevel || "none",
      }));
    }
    return [];
  });
  
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem("savedFilters");
    return saved ? JSON.parse(saved) : defaultSavedFilters;
  });
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // State pour contrôler la visibilité du formulaire d'ajout
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  // State pour contrôler la visibilité du panneau de partage
  const [isDataTransferOpen, setIsDataTransferOpen] = useState(false);
  
  // State pour contrôler la visibilité du moteur de recherche
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Récupérer uniquement les restaurants du lieu de travail actif
  const activeWorkplaceRestaurants = activeWorkplace 
    ? restaurants.filter(r => r.workplaceId === activeWorkplace.id)
    : [];
  
  // Filtrer les restaurants en fonction des critères
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
      const hasPromoToday = restaurant.promotions?.some(
        promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay
      );
      if (!hasPromoToday) return false;
    } else if (filters.hasCurrentPromotion === false) {
      const currentDay = getCurrentDay();
      const hasPromoToday = restaurant.promotions?.some(
        promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay
      );
      if (hasPromoToday) return false;
    }
    
    if (filters.spicyLevel.length > 0) {
      if (!restaurant.spicyLevel || !filters.spicyLevel.includes(restaurant.spicyLevel)) {
        return false;
      }
    }
    
    if (filters.openOnDay !== null && restaurant.openingHours) {
      const dayOpeningHours = restaurant.openingHours.find(oh => oh.dayOfWeek === filters.openOnDay);
      if (!dayOpeningHours || dayOpeningHours.closed) return false;
      
      if (filters.openAtTime && dayOpeningHours) {
        const [hours, minutes] = filters.openAtTime.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        
        let isOpenAtRequestedTime = false;
        
        if (dayOpeningHours.lunchService) {
          const [openHours, openMinutes] = dayOpeningHours.lunchService.opens.split(':').map(Number);
          const openTimeInMinutes = openHours * 60 + openMinutes;
          
          const [closeHours, closeMinutes] = dayOpeningHours.lunchService.closes.split(':').map(Number);
          const closeTimeInMinutes = closeHours * 60 + closeMinutes;
          
          if (timeInMinutes >= openTimeInMinutes && timeInMinutes <= closeTimeInMinutes) {
            isOpenAtRequestedTime = true;
          }
        }
        
        if (dayOpeningHours.dinnerService && !isOpenAtRequestedTime) {
          const [openHours, openMinutes] = dayOpeningHours.dinnerService.opens.split(':').map(Number);
          const openTimeInMinutes = openHours * 60 + openMinutes;
          
          const [closeHours, closeMinutes] = dayOpeningHours.dinnerService.closes.split(':').map(Number);
          const closeTimeInMinutes = closeHours * 60 + closeMinutes;
          
          if (timeInMinutes >= openTimeInMinutes && timeInMinutes <= closeTimeInMinutes) {
            isOpenAtRequestedTime = true;
          }
        }
        
        if (!isOpenAtRequestedTime) {
          return false;
        }
      }
    }
    
    return true;
  });
  
  const handleAddRestaurant = (newRestaurant: Restaurant) => {
    if (activeWorkplace) {
      newRestaurant.workplaceId = activeWorkplace.id;
      setRestaurants([...restaurants, newRestaurant]);
      setIsAddFormOpen(false);
      toast.success(`${newRestaurant.name} a été ajouté à votre liste`);
    } else {
      toast.error("Veuillez d'abord ajouter un lieu de travail");
    }
  };
  
  const handleRemoveRestaurant = (id: string) => {
    setRestaurants(restaurants.filter((r) => r.id !== id));
  };

  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedRestaurant = (updatedRestaurant: Restaurant) => {
    setRestaurants(
      restaurants.map((r) => (r.id === updatedRestaurant.id ? updatedRestaurant : r))
    );
  };
  
  const handleAddWorkplace = (newWorkplace: Workplace) => {
    if (newWorkplace.isActive) {
      const updatedWorkplaces = workplaces.map(wp => ({
        ...wp,
        isActive: false
      }));
      setWorkplaces([...updatedWorkplaces, newWorkplace]);
    } else {
      setWorkplaces([...workplaces, newWorkplace]);
    }
  };
  
  const handleSelectWorkplace = (workplace: Workplace) => {
    const updatedWorkplaces = workplaces.map(wp => ({
      ...wp,
      isActive: wp.id === workplace.id
    }));
    setWorkplaces(updatedWorkplaces);
  };
  
  const handleEditWorkplace = (updatedWorkplace: Workplace) => {
    setWorkplaces(workplaces.map(wp => 
      wp.id === updatedWorkplace.id ? updatedWorkplace : wp
    ));
  };
  
  const handleDeleteWorkplace = (id: string) => {
    const workplaceToDelete = workplaces.find(wp => wp.id === id);
    if (workplaceToDelete?.isActive) {
      toast.error("Vous ne pouvez pas supprimer le lieu de travail actif");
      return;
    }
    
    setRestaurants(restaurants.filter(r => r.workplaceId !== id));
    setWorkplaces(workplaces.filter(wp => wp.id !== id));
  };
  
  const handleImportData = (data: { workplaces: Workplace[]; restaurants: Restaurant[] }) => {
    setWorkplaces(data.workplaces);
    setRestaurants(data.restaurants);
  };
  
  const handleImportFile = (file: File) => {
    importData(file, handleImportData, workplaces, restaurants);
  };
  
  const handleImportFromUrl = async (url: string) => {
    await importDataFromUrl(url, handleImportData, workplaces, restaurants);
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  const handleSaveFilters = (filters: SavedFilter[]) => {
    setSavedFilters(filters);
  };
  
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  
  const handleResetFilters = () => {
    setFilters(defaultFilters);
    toast.info("Filtres réinitialisés");
  };
  
  const handleSelectPlace = (place: PlaceResult) => {
    // Conversion des horaires d'ouverture de l'API Google vers notre format
    const openingHours = place.opening_hours?.periods?.map(period => {
      // Convertir le format horaire de HHMM à HH:MM
      const formatTimeString = (timeStr: string): string => {
        return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
      };
      
      // Créer le service de midi ou du soir selon l'heure
      const openHour = parseInt(period.open.time.substring(0, 2));
      const closeHour = parseInt(period.close.time.substring(0, 2));
      
      return {
        dayOfWeek: period.open.day as any,
        closed: false,
        // Si ouvert avant 15h, c'est le service midi
        ...(openHour < 15 ? {
          lunchService: {
            opens: formatTimeString(period.open.time),
            closes: formatTimeString(period.close.time)
          }
        } : {}),
        // Si ouvert après 15h, c'est le service du soir
        ...(openHour >= 15 ? {
          dinnerService: {
            opens: formatTimeString(period.open.time),
            closes: formatTimeString(period.close.time)
          }
        } : {})
      };
    });
    
    // Convertir le niveau de prix de Google (0-4) en notre format (€-€€€€)
    const convertPriceLevel = (level?: number): "€" | "€€" | "€€€" | "€€€€" => {
      if (level === undefined) return "€";
      switch(level) {
        case 0: return "€";
        case 1: return "€";
        case 2: return "€€";
        case 3: return "€€€";
        case 4: return "€€€€";
        default: return "€";
      }
    };
    
    const newRestaurant: Restaurant = {
      id: uuidv4(),
      name: place.name,
      address: place.formatted_address || place.vicinity,
      foodType: "autre",
      color: getRandomColor(),
      distance: 0,
      takeaway: place.takeout || false,
      vegetarianOption: place.vegetarian || false,
      halalOption: place.halal || false,
      restaurantTickets: "none",
      priceRange: convertPriceLevel(place.price_level),
      reservationType: "notAvailable",
      phoneOrderAllowed: false,
      spicyLevel: "none",
      workplaceId: activeWorkplace?.id || "",
      phoneNumber: place.formatted_phone_number || place.international_phone_number || "",
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      openingHours: openingHours
    };

    setRestaurants([...restaurants, newRestaurant]);
    setIsSearchOpen(false);
    toast.success(`${place.name} a été ajouté à votre liste`);
  };

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);
  
  useEffect(() => {
    localStorage.setItem("restaurants", JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem("workplaces", JSON.stringify(workplaces));
    const activeWorkplace = workplaces.find(wp => wp.isActive);
    if (activeWorkplace) {
      localStorage.setItem("officeAddress", activeWorkplace.address);
    }
  }, [workplaces]);
  
  useEffect(() => {
    localStorage.setItem("savedFilters", JSON.stringify(savedFilters));
  }, [savedFilters]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/50">
      <div className="container mx-auto px-4 py-8">
        <Header />
        
        {showScrollButton && (
          <Button
            variant="secondary"
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-md animate-fade-in"
            onClick={scrollToTop}
          >
            <ChevronUp className="h-5 w-5" />
          </Button>
        )}
        
        <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs"
          >
            <Search className="h-3.5 w-3.5" />
            Rechercher
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDataTransferOpen(true)}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            Partage
          </Button>
        </div>
        
        <section className="my-6">
          <WorkplaceSelector
            workplaces={workplaces}
            onAddWorkplace={handleAddWorkplace}
            onSelectWorkplace={handleSelectWorkplace}
            onEditWorkplace={handleEditWorkplace}
            onDeleteWorkplace={handleDeleteWorkplace}
          />
        </section>
        
        <section className="my-6">
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <FavoriteFilters
              currentFilters={filters}
              onFilterSelect={setFilters}
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilters}
            />
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {filteredRestaurants.length} résultat{filteredRestaurants.length !== 1 ? 's' : ''}
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResetFilters}
                  className="h-8 flex items-center gap-1 text-xs"
                >
                  <FilterX className="h-3.5 w-3.5" />
                  Réinitialiser
                </Button>
              </div>
              
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                onClick={toggleAdvancedFilters}
                className="h-8 flex items-center gap-1 text-xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {showAdvancedFilters ? "Masquer les filtres" : "Filtres avancés"}
              </Button>
            </div>
          </div>
        </section>
        
        <section className="my-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:flex-1">
              <WheelOfFortune 
                restaurants={filteredRestaurants} 
                officeAddress={activeWorkplace?.address || ""}
              />
            </div>
            
            {showAdvancedFilters && (
              <div className="w-full md:w-80">
                <div className="md:sticky md:top-8">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
        
        <Separator className="my-10" />
        
        <section className="my-6">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                <span>Mes restaurants</span>
              </h2>
              <RestaurantList
                restaurants={filteredRestaurants}
                onRemove={handleRemoveRestaurant}
                onEdit={handleEditRestaurant}
              />
            </div>
          </div>
        </section>

        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <Button 
            onClick={() => setIsAddFormOpen(true)}
            className="shadow-lg font-semibold px-6 py-6 rounded-full"
            variant="food"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Ajouter un restaurant
          </Button>
        </div>

        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
          <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un restaurant</DialogTitle>
              <DialogDescription>
                Renseignez les informations du restaurant que vous souhaitez ajouter à votre liste.
              </DialogDescription>
            </DialogHeader>
            {activeWorkplace ? (
              <RestaurantForm 
                onAdd={handleAddRestaurant} 
                activeWorkplace={activeWorkplace}
              />
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg bg-card">
                <p className="text-muted-foreground">
                  Veuillez d'abord ajouter un lieu de travail pour enregistrer des restaurants.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isDataTransferOpen} onOpenChange={setIsDataTransferOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Partage de données</DialogTitle>
              <DialogDescription>
                Exportez vos données pour les sauvegarder ou les partager, et importez celles d'autres utilisateurs.
              </DialogDescription>
            </DialogHeader>
            <DataTransferPanel 
              workplaces={workplaces} 
              restaurants={restaurants} 
              onImport={handleImportData}
              asDialog={true}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Rechercher un restaurant</DialogTitle>
              <DialogDescription>
                Recherchez un restaurant à proximité pour l'ajouter à votre liste.
              </DialogDescription>
            </DialogHeader>
            {activeWorkplace ? (
              <PlaceSearch
                workplace={activeWorkplace}
                onSelectPlace={handleSelectPlace}
              />
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg bg-card">
                <p className="text-muted-foreground">
                  Veuillez d'abord ajouter un lieu de travail pour rechercher des restaurants.
                </p>
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
