import React, { useState } from "react";
import {
  Restaurant,
  getDayName,
  getCurrentDay,
  getSpicyLevelLabel, getCompletenessScore
} from "@/types/restaurant";
import {
  Trash2, MapPin, ShoppingBag, Leaf, Edit,
  ChevronLeft, ChevronRight, Flame, Phone,
  Moon, Euro, Ticket, CalendarCheck, BookOpen,
  Gift, AlertCircle, CheckCircle2, UtensilsCrossed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import OpeningHoursBadge from "@/components/OpeningHoursBadge";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onRemove: (id: string) => void;
  onEdit: (restaurant: Restaurant) => void;
  onView: (restaurant: Restaurant) => void;
}

const CUISINE_META: Record<string, { emoji: string; color: string; bg: string }> = {
  "français": { emoji: "🥐", color: "text-blue-600", bg: "bg-blue-50" },
  "italien": { emoji: "🍕", color: "text-red-500", bg: "bg-red-50" },
  "japonais": { emoji: "🍣", color: "text-pink-500", bg: "bg-pink-50" },
  "chinois": { emoji: "🥡", color: "text-amber-600", bg: "bg-amber-50" },
  "indien": { emoji: "🍛", color: "text-yellow-600", bg: "bg-yellow-50" },
  "mexicain": { emoji: "🌮", color: "text-lime-600", bg: "bg-lime-50" },
  "libanais": { emoji: "🧆", color: "text-emerald-600", bg: "bg-emerald-50" },
  "fast-food": { emoji: "🍔", color: "text-orange-500", bg: "bg-orange-50" },
  "autre": { emoji: "🍽️", color: "text-gray-500", bg: "bg-gray-50" },
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onRemove, onEdit, onView }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const hasPhotos = restaurant.menuPhotos && restaurant.menuPhotos.length > 0;
  const currentDay = getCurrentDay();
  const completeness = getCompletenessScore(restaurant);
  const cuisineMeta = CUISINE_META[restaurant.foodType] || CUISINE_META["autre"];

  const handleRemove = () => {
    onRemove(restaurant.id);
    toast.success(`${restaurant.name} a été supprimé`);
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const distanceColor = restaurant.distance <= 300
    ? "text-emerald-500" : restaurant.distance <= 700
    ? "text-orange-500" : "text-red-400";

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

  const priceColor = restaurant.priceRange === "€" ? "text-emerald-500 bg-emerald-50"
    : restaurant.priceRange === "€€" ? "text-blue-500 bg-blue-50"
    : restaurant.priceRange === "€€€" ? "text-orange-500 bg-orange-50"
    : "text-red-500 bg-red-50";

  return (
    <div className="h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden animate-scale-in group cursor-pointer" onClick={() => onView(restaurant)}>
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
        {/* Header with initial badge */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
              style={{ backgroundColor: restaurant.color || '#F97316' }}
            >
              {restaurant.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-gray-900 truncate">{restaurant.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[11px] ${cuisineMeta.bg} ${cuisineMeta.color} px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-1`}>
                  <span>{cuisineMeta.emoji}</span> {restaurant.foodType}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon"
              className="h-8 w-8 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50"
              onClick={(e) => { e.stopPropagation(); onEdit(restaurant); }}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon"
              className="h-8 w-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Distance & Address */}
        <div className="mt-2.5 space-y-1">
          <div className={`flex items-center gap-1.5 text-xs ${distanceColor}`}>
            <MapPin className="h-3.5 w-3.5" />
            <span className="font-medium">{formatDistance(restaurant.distance)}</span>
          </div>
          {restaurant.address && (
            <p className="text-xs text-gray-400 ml-5 truncate">{restaurant.address}</p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {restaurant.priceRange && (
            <span className={`text-[11px] ${priceColor} px-2 py-1 rounded-md font-semibold inline-flex items-center gap-1`}>
              <Euro className="h-3 w-3" />{restaurant.priceRange}
            </span>
          )}
          {restaurant.takeaway && (
            <span className="text-[11px] bg-orange-50 text-orange-500 px-2 py-1 rounded-md font-medium inline-flex items-center gap-1">
              <ShoppingBag className="h-3 w-3" /> À emporter
            </span>
          )}
          {restaurant.vegetarianOption && (
            <span className="text-[11px] bg-emerald-50 text-emerald-500 px-2 py-1 rounded-md font-medium inline-flex items-center gap-1">
              <Leaf className="h-3 w-3" /> Végétarien
            </span>
          )}
          {restaurant.halalOption && (
            <span className="text-[11px] bg-sky-50 text-sky-500 px-2 py-1 rounded-md font-medium inline-flex items-center gap-1">
              <Moon className="h-3 w-3" /> Halal
            </span>
          )}
          {restaurant.spicyLevel && restaurant.spicyLevel !== "none" && (
            <span className={`text-[11px] px-2 py-1 rounded-md font-medium inline-flex items-center gap-1 ${
              restaurant.spicyLevel === "hot" ? "bg-red-100 text-red-600"
              : restaurant.spicyLevel === "medium" ? "bg-orange-50 text-orange-600"
              : "bg-yellow-50 text-yellow-600"
            }`}>
              <Flame className="h-3 w-3" /> {getSpicyLevelLabel(restaurant.spicyLevel)}
            </span>
          )}
          {restaurant.restaurantTickets && restaurant.restaurantTickets !== "none" && (
            <span className="text-[11px] bg-violet-50 text-violet-500 px-2 py-1 rounded-md font-medium inline-flex items-center gap-1">
              <Ticket className="h-3 w-3" /> {restaurant.restaurantTickets === "paper" ? "Ticket papier" : restaurant.restaurantTickets === "card" ? "Carte ticket resto" : "Ticket papier + carte"}
            </span>
          )}
          {restaurant.reservationType && restaurant.reservationType !== "notAvailable" && (
            <span className={`text-[11px] px-2 py-1 rounded-md font-medium inline-flex items-center gap-1 ${
              restaurant.reservationType === "required" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
            }`}>
              <CalendarCheck className="h-3 w-3" />
              {restaurant.reservationType === "required" ? "Réservation obligatoire" : "Réservation conseillée"}
            </span>
          )}
        </div>

        {/* Phone */}
        {restaurant.phoneNumber && (
          <a
            href={`tel:${restaurant.phoneNumber}`}
            className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{restaurant.phoneNumber}</span>
          </a>
        )}

        <OpeningHoursBadge openingHours={restaurant.openingHours} />



        {/* Promos du jour */}
        {hasCurrentDayPromotion && (
          <div className="mt-3 p-2.5 rounded-xl bg-orange-50 border border-orange-100">
            <p className="font-semibold text-orange-600 text-[11px] uppercase tracking-wide mb-0.5 inline-flex items-center gap-1">
              <Gift className="h-3.5 w-3.5" /> Promo du jour
            </p>
            {currentDayPromotions!.map(promo => (
              <p key={promo.id} className="text-xs text-orange-700 ml-5">
                {promo.description}{promo.discount ? ` (${promo.discount})` : ''}
              </p>
            ))}
          </div>
        )}

        {/* Autres promos */}
        {allPromotions.length > 0 &&
         (!currentDayPromotions || currentDayPromotions.length < allPromotions.length) && (
          <div className="mt-2 p-2.5 rounded-xl bg-gray-50">
            <p className="font-medium text-gray-400 text-[11px] uppercase tracking-wide mb-0.5 inline-flex items-center gap-1">
              <Gift className="h-3.5 w-3.5" /> Autres promos
            </p>
            {allPromotions
              .filter(promo => !currentDayPromotions?.find(cp => cp.id === promo.id))
              .map(promo => (
                <p key={promo.id} className="text-xs text-gray-500 ml-5">
                  {promo.description}
                  {promo.dayOfWeek !== null && <span className="text-gray-400"> · {getDayName(promo.dayOfWeek)}</span>}
                </p>
              ))}
          </div>
        )}

        {restaurant.menuInfo && (
          <div className="mt-2 p-2.5 rounded-xl bg-gray-50">
            <p className="text-xs text-gray-500 inline-flex items-start gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span><span className="font-medium text-gray-600">Menu :</span> {restaurant.menuInfo}</span>
            </p>
          </div>
        )}

        {/* Score de complétude */}
        {completeness.score < 100 && (
          <div className="mt-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-gray-500 inline-flex items-center gap-1">
                {completeness.score >= 70
                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  : <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                }
                Fiche {completeness.score}% complète
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit(restaurant); }}
                className="text-[11px] font-semibold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
              >
                <Edit className="h-3 w-3" /> Compléter
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
      </div>
    </div>
  );
};

export default RestaurantCard;
