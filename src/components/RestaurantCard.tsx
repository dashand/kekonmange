import React, { useState, useRef } from "react";
import { 
  Restaurant, 
  getDayName, 
  getCurrentDay, 
  DayOfWeek, 
  getSpicyLevelLabel
} from "@/types/restaurant";
import { 
  Trash2, 
  MapPin, 
  Utensils, 
  ShoppingBag, 
  Leaf, 
  Edit, 
  Image, 
  ChevronLeft, 
  ChevronRight, 
  Percent, 
  Flame 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  
  const handleRemove = () => {
    onRemove(restaurant.id);
    toast.success(`${restaurant.name} a été supprimé`);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.menuPhotos) {
      setCurrentPhotoIndex((prev) => 
        prev === restaurant.menuPhotos!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (restaurant.menuPhotos) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? restaurant.menuPhotos!.length - 1 : prev - 1
      );
    }
  };

  const hasCurrentDayPromotion = restaurant.promotions?.some(
    promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay
  );

  const currentDayPromotions = restaurant.promotions?.filter(
    promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay
  );

  const allPromotions = restaurant.promotions || [];

  const getSpicyBadgeClass = () => {
    if (!restaurant.spicyLevel || restaurant.spicyLevel === "none") return "";
    
    switch (restaurant.spicyLevel) {
      case "light":
        return "bg-yellow-500";
      case "medium":
        return "bg-orange-500";
      case "hot":
        return "bg-red-600";
      default:
        return "";
    }
  };

  return (
    <div className={`h-full overflow-hidden bg-card glass animate-scale-in ${hasCurrentDayPromotion ? 'relative' : ''}`}>
      {hasCurrentDayPromotion && (
        <div className="absolute top-2 right-2 z-10 animate-pulse">
          <Badge variant="promotional" className="bg-red-500 text-white px-3 py-1 shadow-lg">
            <Percent className="h-3.5 w-3.5 mr-1" />
            Promo du jour
          </Badge>
        </div>
      )}
      
      {hasPhotos && (
        <div className="relative w-full h-48">
          <img 
            src={restaurant.menuPhotos![currentPhotoIndex]} 
            alt={`Menu de ${restaurant.name}`} 
            className="w-full h-full object-cover"
          />
          {restaurant.menuPhotos!.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-8 w-8 rounded-full"
                onClick={prevPhoto}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-8 w-8 rounded-full"
                onClick={nextPhoto}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {currentPhotoIndex + 1} / {restaurant.menuPhotos!.length}
              </div>
            </>
          )}
        </div>
      )}
      <CardContent className={`p-5 ${hasPhotos ? 'pt-4' : ''}`}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-medium text-lg">{restaurant.name}</h3>
            <div className="flex items-center text-muted-foreground text-sm gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>{formatDistance(restaurant.distance)}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => onEdit(restaurant)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Utensils className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{restaurant.foodType}</span>
          </div>
          
          {restaurant.address && (
            <div className="text-sm text-muted-foreground">
              <span>{restaurant.address}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {restaurant.takeaway && (
              <Badge variant="outline" className="flex items-center gap-1 bg-secondary">
                <ShoppingBag className="h-3 w-3" />
                <span className="text-xs">À emporter</span>
              </Badge>
            )}
            
            {restaurant.vegetarianOption && (
              <Badge variant="outline" className="flex items-center gap-1 bg-secondary">
                <Leaf className="h-3 w-3" />
                <span className="text-xs">Végétarien</span>
              </Badge>
            )}
            
            {restaurant.halalOption && (
              <Badge variant="outline" className="flex items-center gap-1 bg-secondary">
                <span className="text-xs">Halal</span>
              </Badge>
            )}
            
            {restaurant.spicyLevel && restaurant.spicyLevel !== "none" && (
              <Badge 
                variant="spicy" 
                className={`flex items-center gap-1 ${getSpicyBadgeClass()}`}
              >
                <Flame className="h-3 w-3" />
                <span className="text-xs">{getSpicyLevelLabel(restaurant.spicyLevel)}</span>
              </Badge>
            )}
          </div>
          
          <OpeningHoursBadge openingHours={restaurant.openingHours} />
          
          {currentDayPromotions && currentDayPromotions.length > 0 && (
            <div className="mt-3 text-sm bg-red-50 border border-red-200 p-3 rounded-md animate-pulse">
              <div className="flex items-center gap-2 text-red-600 font-semibold mb-1">
                <Percent className="h-4 w-4" />
                <span>Promotion{currentDayPromotions.length > 1 ? 's' : ''} du jour</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {currentDayPromotions.map(promo => (
                  <li key={promo.id} className="text-red-700">
                    {promo.description} {promo.discount && <span className="font-medium">({promo.discount})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {allPromotions.length > 0 && 
           (!currentDayPromotions || currentDayPromotions.length < allPromotions.length) && (
            <div className="mt-3 text-sm bg-secondary/30 p-3 rounded-md">
              <div className="flex items-center gap-2 text-muted-foreground font-semibold mb-1">
                <Percent className="h-4 w-4" />
                <span>Autres promotions</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {allPromotions
                  .filter(promo => !currentDayPromotions?.find(cp => cp.id === promo.id))
                  .map(promo => (
                    <li key={promo.id}>
                      {promo.description} {promo.discount && <span>({promo.discount})</span>}
                      {promo.dayOfWeek !== null && (
                        <span className="text-xs text-muted-foreground ml-1">
                          - {getDayName(promo.dayOfWeek)}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          
          {restaurant.menuInfo && (
            <div className="mt-3 text-sm bg-secondary/30 p-3 rounded-md">
              <strong>Menu :</strong> {restaurant.menuInfo}
            </div>
          )}
          
          {!hasPhotos && restaurant.menuInfo && (
            <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
              <Image className="h-3.5 w-3.5" />
              <span>Pas de photos disponibles</span>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default RestaurantCard;
