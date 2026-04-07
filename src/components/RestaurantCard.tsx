import React, { useState } from "react";
import { 
  Restaurant, 
  getDayName, 
  getCurrentDay, 
  getSpicyLevelLabel, getCompletenessScore
} from "@/types/restaurant";
import { 
  Trash2, MapPin, ShoppingBag, Leaf, Edit, 
  ChevronLeft, ChevronRight, Percent, Flame 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import OpeningHoursBadge from "@/components/OpeningHoursBadge";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onRemove: (id: string) => void;
  onEdit: (restaurant: Restaurant) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onRemove, onEdit }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const hasPhotos = restaurant.menuPhotos && restaurant.menuPhotos.length > 0;
  const currentDay = getCurrentDay();
  const completeness = getCompletenessScore(restaurant);
  
  const handleRemove = () => {
    onRemove(restaurant.id);
    toast.success(`${restaurant.name} a été supprimé`);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.menuPhotos) {
      setCurrentPhotoIndex((prev) => prev === restaurant.menuPhotos!.length - 1 ? 0 : prev + 1);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.menuPhotos) {
      setCurrentPhotoIndex((prev) => prev === 0 ? restaurant.menuPhotos!.length - 1 : prev - 1);
    }
  };

  const currentDayPromotions = restaurant.promotions?.filter(
    promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay
  );
  const hasCurrentDayPromotion = currentDayPromotions && currentDayPromotions.length > 0;
  const allPromotions = restaurant.promotions || [];

  return (
    <div className="h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden animate-scale-in group">
      {/* Color accent bar */}
      <div className="h-1.5" style={{ backgroundColor: restaurant.color || '#F97316' }} />
      
      {hasPhotos && (
        <div className="relative w-full h-44">
          <img 
            src={restaurant.menuPhotos![currentPhotoIndex]} 
            alt={`Menu de ${restaurant.name}`} 
            className="w-full h-full object-cover"
          />
          {restaurant.menuPhotos!.length > 1 && (
            <>
              <Button variant="ghost" size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white h-7 w-7 rounded-full shadow-sm"
                onClick={prevPhoto}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white h-7 w-7 rounded-full shadow-sm"
                onClick={nextPhoto}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
                {currentPhotoIndex + 1}/{restaurant.menuPhotos!.length}
              </span>
            </>
          )}
        </div>
      )}
      
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-gray-900 truncate">{restaurant.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              <span>{formatDistance(restaurant.distance)}</span>
              <span className="text-gray-200">·</span>
              <span>{restaurant.foodType}</span>
            </div>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" 
              className="h-8 w-8 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50"
              onClick={() => onEdit(restaurant)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" 
              className="h-8 w-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
              onClick={handleRemove}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {restaurant.address && (
          <p className="text-xs text-gray-400 mt-2 truncate">{restaurant.address}</p>
        )}
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {restaurant.priceRange && (
            <span className="text-[11px] bg-gray-50 text-gray-500 px-2 py-1 rounded-md font-medium">{restaurant.priceRange}</span>
          )}
          {restaurant.takeaway && (
            <span className="text-[11px] bg-orange-50 text-orange-500 px-2 py-1 rounded-md font-medium">À emporter</span>
          )}
          {restaurant.vegetarianOption && (
            <span className="text-[11px] bg-emerald-50 text-emerald-500 px-2 py-1 rounded-md font-medium">Végétarien</span>
          )}
          {restaurant.halalOption && (
            <span className="text-[11px] bg-sky-50 text-sky-500 px-2 py-1 rounded-md font-medium">Halal</span>
          )}
          {restaurant.spicyLevel && restaurant.spicyLevel !== "none" && (
            <span className="text-[11px] bg-red-50 text-red-500 px-2 py-1 rounded-md font-medium">{getSpicyLevelLabel(restaurant.spicyLevel)}</span>
          )}
        </div>
        
        <OpeningHoursBadge openingHours={restaurant.openingHours} />

        {/* Score de completude */}
        {completeness.score < 100 && (
          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500">Fiche {completeness.score}% complète</span>
              <button
                type="button"
                onClick={() => onEdit(restaurant)}
                className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors"
              >
                Compléter
              </button>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={"h-full rounded-full transition-all " + (completeness.score >= 70 ? "bg-emerald-400" : completeness.score >= 40 ? "bg-orange-400" : "bg-red-400")}
                style={{ width: `${completeness.score}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Manque : {completeness.missing.slice(0, 3).join(", ")}{completeness.missing.length > 3 ? "..." : ""}
            </p>
          </div>
        )}
        
        {/* Promos du jour */}
        {hasCurrentDayPromotion && (
          <div className="mt-3 p-2.5 rounded-xl bg-orange-50 border border-orange-100">
            <p className="font-semibold text-orange-600 text-[11px] uppercase tracking-wide mb-0.5">Promo du jour</p>
            {currentDayPromotions!.map(promo => (
              <p key={promo.id} className="text-xs text-orange-700">
                {promo.description}{promo.discount ? ` (${promo.discount})` : ''}
              </p>
            ))}
          </div>
        )}
        
        {/* Autres promos */}
        {allPromotions.length > 0 && 
         (!currentDayPromotions || currentDayPromotions.length < allPromotions.length) && (
          <div className="mt-2 p-2.5 rounded-xl bg-gray-50">
            <p className="font-medium text-gray-400 text-[11px] uppercase tracking-wide mb-0.5">Autres promos</p>
            {allPromotions
              .filter(promo => !currentDayPromotions?.find(cp => cp.id === promo.id))
              .map(promo => (
                <p key={promo.id} className="text-xs text-gray-500">
                  {promo.description}
                  {promo.dayOfWeek !== null && <span className="text-gray-400"> · {getDayName(promo.dayOfWeek)}</span>}
                </p>
              ))}
          </div>
        )}
        
        {restaurant.menuInfo && (
          <div className="mt-2 p-2.5 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-500"><span className="font-medium text-gray-600">Menu :</span> {restaurant.menuInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
