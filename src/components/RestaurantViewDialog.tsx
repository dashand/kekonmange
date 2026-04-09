import React from "react";
import {
  Restaurant, getDayName, getCurrentDay, getSpicyLevelLabel, getCompletenessScore
} from "@/types/restaurant";
import {
  MapPin, ShoppingBag, Leaf, Edit, Flame, Phone,
  Moon, Euro, Ticket, CalendarCheck, BookOpen,
  Gift, AlertCircle, CheckCircle2, X, ExternalLink, Navigation, Globe
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OsmMiniMap from "@/components/OsmMiniMap";
import OpeningHoursBadge from "@/components/OpeningHoursBadge";

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

interface RestaurantViewDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (restaurant: Restaurant) => void;
  officeAddress?: string;
}

const RestaurantViewDialog: React.FC<RestaurantViewDialogProps> = ({
  restaurant, open, onOpenChange, onEdit, officeAddress
}) => {
  if (!restaurant) return null;

  const currentDay = getCurrentDay();
  const completeness = getCompletenessScore(restaurant);
  const cuisineMeta = CUISINE_META[restaurant.foodType] || CUISINE_META["autre"];

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${meters} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const distanceColor = restaurant.distance <= 300
    ? "text-emerald-500" : restaurant.distance <= 700
    ? "text-orange-500" : "text-red-400";

  const priceColor = restaurant.priceRange === "€" ? "text-emerald-500 bg-emerald-50"
    : restaurant.priceRange === "€€" ? "text-blue-500 bg-blue-50"
    : restaurant.priceRange === "€€€" ? "text-orange-500 bg-orange-50"
    : "text-red-500 bg-red-50";

  const currentDayPromotions = restaurant.promotions?.filter(
    promo => promo.dayOfWeek === null || promo.dayOfWeek === currentDay
  );
  const allPromotions = restaurant.promotions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Color accent bar */}
        <div className="h-2" style={{ backgroundColor: restaurant.color || '#F97316' }} />

        {/* Photos */}
        {restaurant.menuPhotos && restaurant.menuPhotos.length > 0 && (
          <div className="w-full h-48 overflow-x-auto flex gap-1">
            {restaurant.menuPhotos.map((photo, i) => (
              <img key={i} src={photo} alt={`Photo ${i+1}`} className="h-full object-cover" />
            ))}
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: restaurant.color || '#F97316' }}
              >
                {restaurant.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900">{restaurant.name}</h2>
                <span className={`text-xs ${cuisineMeta.bg} ${cuisineMeta.color} px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1`}>
                  <span>{cuisineMeta.emoji}</span> {restaurant.foodType}
                </span>
              </div>
            </div>
            <Button
              variant="outline" size="sm"
              className="text-orange-500 border-orange-200 hover:bg-orange-50"
              onClick={() => { onOpenChange(false); onEdit(restaurant); }}
            >
              <Edit className="h-3.5 w-3.5 mr-1" /> Modifier
            </Button>
          </div>

          {/* Distance & Address */}
          <div className="space-y-1">
            <div className={`flex items-center gap-2 text-sm font-medium ${distanceColor}`}>
              <MapPin className="h-4 w-4" />
              <span>{formatDistance(restaurant.distance)}</span>
            </div>
            {restaurant.address && (
              <p className="text-sm text-gray-500 ml-6">{restaurant.address}</p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {restaurant.priceRange && (
              <span className={`text-xs ${priceColor} px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1`}>
                <Euro className="h-3.5 w-3.5" />{restaurant.priceRange}
              </span>
            )}
            {restaurant.takeaway && (
              <span className="text-xs bg-orange-50 text-orange-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" /> À emporter
              </span>
            )}
            {restaurant.vegetarianOption && (
              <span className="text-xs bg-emerald-50 text-emerald-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5" /> Végétarien
              </span>
            )}
            {restaurant.halalOption && (
              <span className="text-xs bg-sky-50 text-sky-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                <Moon className="h-3.5 w-3.5" /> Halal
              </span>
            )}
            {restaurant.spicyLevel && restaurant.spicyLevel !== "none" && (
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1 ${
                restaurant.spicyLevel === "hot" ? "bg-red-100 text-red-600"
                : restaurant.spicyLevel === "medium" ? "bg-orange-50 text-orange-600"
                : "bg-yellow-50 text-yellow-600"
              }`}>
                <Flame className="h-3.5 w-3.5" /> {getSpicyLevelLabel(restaurant.spicyLevel)}
              </span>
            )}
            {restaurant.restaurantTickets && restaurant.restaurantTickets !== "none" && (
              <span className="text-xs bg-violet-50 text-violet-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                <Ticket className="h-3.5 w-3.5" /> {restaurant.restaurantTickets === "paper" ? "Ticket papier" : restaurant.restaurantTickets === "card" ? "Carte ticket resto" : "Ticket papier + carte"}
              </span>
            )}
            {restaurant.reservationType && restaurant.reservationType !== "notAvailable" && (
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1 ${
                restaurant.reservationType === "required" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
              }`}>
                <CalendarCheck className="h-3.5 w-3.5" />
                {restaurant.reservationType === "required" ? "Réservation obligatoire" : "Réservation conseillée"}
              </span>
            )}
            {restaurant.phoneOrderAllowed && (
              <span className="text-xs bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Commande par tél.
              </span>
            )}
          </div>

          {/* Phone */}
          {restaurant.phoneNumber && (
            <a href={`tel:${restaurant.phoneNumber}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors">
              <Phone className="h-4 w-4" />
              <span>{restaurant.phoneNumber}</span>
            </a>
          )}

          {/* Opening hours */}
          {restaurant.openingHours && restaurant.openingHours.length > 0 && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs font-semibold text-gray-600 mb-2">Horaires d'ouverture</p>
              <div className="space-y-1">
                {restaurant.openingHours
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map(oh => (
                  <div key={oh.dayOfWeek} className={`flex items-center text-xs ${oh.dayOfWeek === currentDay ? 'font-semibold text-orange-600' : 'text-gray-500'}`}>
                    <span className="w-24">{getDayName(oh.dayOfWeek)}</span>
                    {oh.closed ? (
                      <span className="text-red-400">Fermé</span>
                    ) : (
                      <span>
                        {oh.lunchService && `${oh.lunchService.opens}–${oh.lunchService.closes}`}
                        {oh.lunchService && oh.dinnerService && ' · '}
                        {oh.dinnerService && `${oh.dinnerService.opens}–${oh.dinnerService.closes}`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Promos du jour */}
          {currentDayPromotions && currentDayPromotions.length > 0 && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
              <p className="font-semibold text-orange-600 text-xs uppercase tracking-wide mb-1 inline-flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" /> Promo du jour
              </p>
              {currentDayPromotions.map(promo => (
                <p key={promo.id} className="text-sm text-orange-700 ml-5">
                  {promo.description}{promo.discount ? ` (${promo.discount})` : ''}
                </p>
              ))}
            </div>
          )}

          {/* Autres promos */}
          {allPromotions.length > 0 &&
           (!currentDayPromotions || currentDayPromotions.length < allPromotions.length) && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="font-medium text-gray-500 text-xs uppercase tracking-wide mb-1 inline-flex items-center gap-1">
                <Gift className="h-3.5 w-3.5" /> Autres promos
              </p>
              {allPromotions
                .filter(promo => !currentDayPromotions?.find(cp => cp.id === promo.id))
                .map(promo => (
                  <p key={promo.id} className="text-sm text-gray-600 ml-5">
                    {promo.description}
                    {promo.dayOfWeek !== null && <span className="text-gray-400"> · {getDayName(promo.dayOfWeek)}</span>}
                    {promo.discount && <span className="text-orange-500 font-medium"> ({promo.discount})</span>}
                  </p>
                ))}
            </div>
          )}

          {/* Menu info */}
          {restaurant.menuInfo && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-sm text-gray-600 inline-flex items-start gap-2">
                <BookOpen className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <span><span className="font-medium text-gray-700">Menu :</span> {restaurant.menuInfo}</span>
              </p>
            </div>
          )}

          {/* Liens web */}
          {(restaurant.website || restaurant.reservationUrl) && (
            <div className="flex flex-wrap gap-2">
              {restaurant.website && (
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium">
                  <Globe className="h-4 w-4" /> Menu en ligne
                </a>
              )}
              {restaurant.reservationUrl && (
                <a href={restaurant.reservationUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-sm font-medium">
                  <CalendarCheck className="h-4 w-4" /> Réserver
                </a>
              )}
            </div>
          )}

          {/* Mini map OSM */}
          {restaurant.location && restaurant.location.lat && restaurant.location.lng && (
            <OsmMiniMap
              lat={restaurant.location.lat}
              lon={restaurant.location.lng}
              name={restaurant.name}
              fromAddress={officeAddress}
            />
          )}

          {/* Completeness */}
          {completeness.score < 100 && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-500 inline-flex items-center gap-1">
                  {completeness.score >= 70
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    : <AlertCircle className="h-4 w-4 text-orange-400" />
                  }
                  Fiche {completeness.score}% complète
                </span>
                <button
                  type="button"
                  onClick={() => { onOpenChange(false); onEdit(restaurant); }}
                  className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" /> Compléter
                </button>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={"h-full rounded-full transition-all " + (completeness.score >= 70 ? "bg-emerald-400" : completeness.score >= 40 ? "bg-orange-400" : "bg-red-400")}
                  style={{ width: `${completeness.score}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Manque : {completeness.missing.join(", ")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantViewDialog;
