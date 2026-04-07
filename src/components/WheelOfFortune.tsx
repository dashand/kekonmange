import React, { useState, useRef } from "react";
import { Restaurant } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { MapPin, ShoppingBag, Clock, Utensils, Percent, Flame, Play } from "lucide-react";
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

  const spinWheel = () => {
    if (restaurants.length === 0) {
      toast.error("Ajoutez au moins un restaurant pour lancer la machine");
      return;
    }
    if (spinning) return;
    
    setWinner(null);
    setSpinning(true);
    
    const randomIndex = Math.floor(Math.random() * restaurants.length);
    const selectedRestaurant = restaurants[randomIndex];
    
    if (slotMachineRef.current) {
      slotMachineRef.current.classList.remove("animate-spin-slot");
      void slotMachineRef.current.offsetWidth;
      slotMachineRef.current.classList.add("animate-spin-slot");
    }
    
    setTimeout(() => {
      setWinner(selectedRestaurant);
      setDialogOpen(true);
      setSpinning(false);
    }, 3000);
  };

  if (restaurants.length === 0) {
    return (
      <div className="w-full max-w-[480px] mx-auto flex flex-col items-center justify-center p-16 rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 animate-fade-in">
        <Utensils className="h-10 w-10 text-gray-300 mb-4" />
        <p className="text-center text-sm text-gray-400">
          Ajoutez des restaurants pour lancer la machine.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[480px] mx-auto relative animate-fade-in">
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 shadow-md">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-1">Machine à restaurant</p>
            <h2 className="text-lg font-bold text-gray-800">Où mange-t-on aujourd'hui ?</h2>
          </div>
          
          <div className="bg-gray-50 overflow-hidden rounded-2xl border border-gray-100 relative">
            <div 
              ref={slotMachineRef}
              className="p-2"
            >
              {restaurants.map((restaurant, index) => (
                <div 
                  key={restaurant.id}
                  className="p-3.5 my-1.5 rounded-xl bg-white border border-gray-100"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-white font-semibold text-sm"
                      style={{ backgroundColor: restaurant.color || FOOD_COLORS[index % FOOD_COLORS.length] }}
                    >
                      {restaurant.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm">{restaurant.name}</h3>
                      <p className="text-xs text-gray-400">{restaurant.foodType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute inset-0 border-y-2 border-orange-400/60 pointer-events-none top-1/2 transform -translate-y-1/2"></div>
          </div>
          
          <div className="mt-5 flex justify-center">
            <Button
              disabled={spinning}
              onClick={spinWheel}
              className={"w-full py-6 rounded-2xl text-base font-semibold transition-all " + (spinning 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98]"
              )}
            >
              {spinning ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  En cours...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Lancer la machine
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          {winner && (
            <>
              <div className="p-8 pb-4 text-center" style={{ backgroundColor: (winner.color || FOOD_COLORS[0]) + '12' }}>
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-lg"
                  style={{ backgroundColor: winner.color || FOOD_COLORS[restaurants.indexOf(winner) % FOOD_COLORS.length] }}
                >
                  {winner.name.charAt(0)}
                </div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">Vous mangez chez</p>
                <h2 className="text-2xl font-extrabold text-gray-900">{winner.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{winner.foodType}</p>
              </div>
              
              <div className="px-6 pb-6 space-y-3">
                {winner.address && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    <span>{winner.address}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2.5 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>
                    {winner.distance < 1000
                      ? `${winner.distance}m du bureau`
                      : `${(winner.distance / 1000).toFixed(1)}km du bureau`}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {winner.priceRange && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">{winner.priceRange}</span>
                  )}
                  {winner.takeaway && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-medium">À emporter</span>
                  )}
                  {winner.vegetarianOption && (
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg font-medium">Végétarien</span>
                  )}
                  {winner.halalOption && (
                    <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-medium">Halal</span>
                  )}
                  {winner.spicyLevel && winner.spicyLevel !== "none" && (
                    <span className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-lg font-medium">{getSpicyLevelLabel(winner.spicyLevel)}</span>
                  )}
                </div>
                
                {winner.openingHours && winner.openingHours.length > 0 && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <OpeningHoursBadge openingHours={winner.openingHours} currentDay={true} />
                  </div>
                )}
                
                {winner.promotions && winner.promotions.length > 0 && (
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                    <p className="font-semibold text-orange-700 text-xs mb-1">Promotions</p>
                    {winner.promotions.slice(0, 2).map((promo) => (
                      <p key={promo.id} className="text-orange-600 text-xs">{promo.description}</p>
                    ))}
                  </div>
                )}
                
                <Button
                  onClick={() => setDialogOpen(false)}
                  className="w-full py-5 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white mt-2"
                >
                  Bon appétit !
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const FOOD_COLORS = [
  "#F97316", "#8B5CF6", "#EC4899", "#06B6D4",
  "#10B981", "#F59E0B", "#EF4444", "#6366F1",
  "#14B8A6", "#F43F5E", "#A855F7", "#3B82F6",
];

export default WheelOfFortune;
