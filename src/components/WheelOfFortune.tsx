
import React, { useState, useRef, useEffect } from "react";
import { Restaurant } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { Play, X, MapPin, ShoppingBag, Building, Clock, Utensils, Percent, Flame } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getSpicyLevelLabel } from "@/types/restaurant";
import OpeningHoursBadge from "@/components/OpeningHoursBadge";

interface WheelOfFortuneProps {
  restaurants: Restaurant[];
  officeAddress?: string;
}

const WheelOfFortune: React.FC<WheelOfFortuneProps> = ({ restaurants, officeAddress }) => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const slotMachineRef = useRef<HTMLDivElement>(null);

  // Function to start the slot machine
  const spinWheel = () => {
    if (restaurants.length === 0) {
      toast.error("Ajoutez au moins un restaurant pour lancer la machine");
      return;
    }
    
    if (spinning) return;
    
    setWinner(null);
    setSpinning(true);
    
    // Pick a random restaurant
    const randomIndex = Math.floor(Math.random() * restaurants.length);
    const selectedRestaurant = restaurants[randomIndex];
    
    // Animate the slot machine
    if (slotMachineRef.current) {
      // Reset the animation by removing and re-adding the class
      slotMachineRef.current.classList.remove("animate-spin-slot");
      void slotMachineRef.current.offsetWidth; // Force reflow to reset animation
      slotMachineRef.current.classList.add("animate-spin-slot");
    }
    
    // Show the result after animation completes
    setTimeout(() => {
      setWinner(selectedRestaurant);
      setDialogOpen(true);
      setSpinning(false);
      
      toast.success("Résultat trouvé !");
    }, 3000); // Match this with the CSS animation duration
  };

  if (restaurants.length === 0) {
    return (
      <div className="w-full aspect-square max-w-[500px] mx-auto flex flex-col items-center justify-center p-8 rounded-full border-2 border-dashed border-amber-300/40 bg-amber-50/40 text-muted-foreground animate-fade-in">
        <p className="text-center text-sm">
          Ajoutez des restaurants pour lancer la machine.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[500px] mx-auto relative animate-fade-in">
        <div className="slot-machine-container p-6 bg-gradient-to-br from-amber-800 to-amber-950 rounded-lg shadow-2xl border-4 border-yellow-600">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-amber-200">Machine à Restaurant</h2>
          </div>
          
          {/* Slot machine window */}
          <div className="slot-machine-window bg-white overflow-hidden rounded-lg border-8 border-amber-600 relative">
            <div 
              ref={slotMachineRef}
              className="slot-machine-reel p-3 bg-amber-50"
            >
              {restaurants.map((restaurant, index) => (
                <div 
                  key={restaurant.id}
                  className="slot-restaurant p-4 my-2 rounded-lg border border-amber-200 bg-amber-100"
                  style={{
                    transform: spinning ? "translateY(0)" : "translateY(0)",
                  }}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white font-bold"
                      style={{ 
                        backgroundColor: restaurant.color || FOOD_COLORS[index % FOOD_COLORS.length]
                      }}
                    >
                      {restaurant.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-800">{restaurant.name}</h3>
                      <p className="text-xs text-amber-600">Cuisine {restaurant.foodType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Final result highlight overlay */}
            <div className="absolute inset-0 border-y-4 border-yellow-400 pointer-events-none top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"></div>
          </div>
          
          {/* Slot machine handle */}
          <div className="mt-6 flex justify-center">
            <Button
              disabled={spinning}
              onClick={spinWheel}
              variant="food"
              className="px-8 py-6 rounded-lg flex items-center justify-center text-lg shadow-lg"
            >
              {spinning ? "En cours..." : "Lancer !"}
              {!spinning && <Play className="h-6 w-6 text-white ml-2" />}
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md food-card">
          <DialogHeader>
            <DialogTitle className="text-xl text-center text-amber-800">
              Aujourd'hui, vous mangez...
            </DialogTitle>
            <DialogDescription className="text-center">
              La machine a choisi votre restaurant pour vous !
            </DialogDescription>
          </DialogHeader>
          
          {winner && (
            <div className="p-6 flex flex-col items-center">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-md"
                style={{ 
                  backgroundColor: winner.color || FOOD_COLORS[restaurants.indexOf(winner) % FOOD_COLORS.length]
                }}
              >
                <span className="text-white font-bold text-2xl">
                  {winner.name.charAt(0)}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-2 text-amber-800">{winner.name}</h2>
              <p className="text-muted-foreground mb-4">Cuisine {winner.foodType}</p>
              
              {winner.address && (
                <p className="text-sm text-center mb-4">{winner.address}</p>
              )}
              
              <div className="flex flex-wrap gap-2 justify-center">
                {winner.takeaway && (
                  <span className="text-sm bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1 text-amber-700 border border-amber-200">
                    <ShoppingBag className="h-3 w-3" />
                    À emporter
                  </span>
                )}
                
                {winner.vegetarianOption && (
                  <span className="text-sm bg-green-100 px-3 py-1 rounded-full flex items-center gap-1 text-green-700 border border-green-200">
                    <span className="h-3 w-3">🥗</span>
                    Végétarien
                  </span>
                )}
                
                {winner.halalOption && (
                  <span className="text-sm bg-blue-100 px-3 py-1 rounded-full flex items-center gap-1 text-blue-700 border border-blue-200">
                    <span className="h-3 w-3">🍖</span>
                    Halal
                  </span>
                )}
              </div>
              
              {winner.menuInfo && (
                <div className="w-full mt-4 p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <h3 className="font-medium mb-2 text-amber-800">Informations sur le menu</h3>
                  <p className="text-sm">{winner.menuInfo}</p>
                </div>
              )}
              
              {/* Restaurant information card */}
              <div className="w-full mt-6 p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                <h3 className="font-medium mb-3 text-center text-amber-800">Fiche restaurant</h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Distance information */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">
                      {winner.distance < 1000
                        ? `${winner.distance} mètres de votre lieu de travail`
                        : `${(winner.distance / 1000).toFixed(1)} km de votre lieu de travail`}
                    </span>
                  </div>
                  
                  {/* Cuisine type */}
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-sm">Cuisine {winner.foodType}</span>
                  </div>
                  
                  {/* Opening hours */}
                  {winner.openingHours && winner.openingHours.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Horaires :</span>
                        <OpeningHoursBadge openingHours={winner.openingHours} currentDay={true} />
                      </div>
                    </div>
                  )}
                  
                  {/* Price range */}
                  {winner.priceRange && (
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 shrink-0 font-medium">€</span>
                      <span className="text-sm">Gamme de prix : {winner.priceRange}</span>
                    </div>
                  )}
                  
                  {/* Spicy level */}
                  {winner.spicyLevel && winner.spicyLevel !== "none" && (
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-500 shrink-0" />
                      <span className="text-sm">Niveau d'épice : {getSpicyLevelLabel(winner.spicyLevel)}</span>
                    </div>
                  )}
                  
                  {/* Promotions */}
                  {winner.promotions && winner.promotions.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Percent className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium">Promotions :</span>
                        <ul className="text-sm list-disc ml-4 mt-1">
                          {winner.promotions.slice(0, 2).map((promo) => (
                            <li key={promo.id}>{promo.description}</li>
                          ))}
                          {winner.promotions.length > 2 && (
                            <li className="text-amber-600">+ {winner.promotions.length - 2} autres</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Fermer
                </Button>
                
                <Button
                  variant="food"
                  className="flex-1"
                  onClick={() => {
                    setDialogOpen(false);
                  }}
                >
                  OK
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Array of warm food-themed colors
const FOOD_COLORS = [
  "#FF7043", // Deep Orange
  "#FF9800", // Orange
  "#FFC107", // Amber
  "#FFEB3B", // Yellow
  "#CDDC39", // Lime
  "#8BC34A", // Light Green
  "#FF5252", // Red Accent
  "#FF4081", // Pink Accent
  "#E040FB", // Purple Accent
  "#7C4DFF", // Deep Purple Accent
  "#448AFF", // Blue Accent
  "#18FFFF", // Cyan Accent
];

export default WheelOfFortune;
