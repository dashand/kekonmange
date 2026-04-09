import React, { useState, useRef, useMemo } from "react";
import { Restaurant } from "@/types/restaurant";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Utensils, Play, Phone, ShoppingBag, Leaf, Moon, Flame, Euro, Ticket, CalendarCheck, Gift, BookOpen, Navigation, Globe, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getSpicyLevelLabel, getCurrentDay, getDayName } from "@/types/restaurant";
import OpeningHoursBadge from "@/components/OpeningHoursBadge";
import OsmMiniMap from "@/components/OsmMiniMap";

interface WheelOfFortuneProps {
  restaurants: Restaurant[];
  officeAddress?: string;
}

const ITEM_HEIGHT = 64;
const VISIBLE_ITEMS = 3;
const SPIN_DURATION = 3000;
const REEL_REPEATS = 30;

const WheelOfFortune: React.FC<WheelOfFortuneProps> = ({ restaurants, officeAddress }) => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);

  // Pre-build a long reel (stable, only changes when restaurants change)
  const reel = useMemo(() => {
    if (restaurants.length === 0) return [];
    const items: Restaurant[] = [];
    for (let i = 0; i < REEL_REPEATS; i++) {
      items.push(...restaurants);
    }
    return items;
  }, [restaurants]);

  const spinWheel = () => {
    if (restaurants.length === 0) {
      toast.error("Ajoutez au moins un restaurant pour lancer la machine");
      return;
    }
    if (spinning || !reelRef.current) return;

    setSpinning(true);
    setWinner(null);

    const selectedIndex = Math.floor(Math.random() * restaurants.length);
    const selectedRestaurant = restaurants[selectedIndex];

    // Pick a target position far into the reel (not at the very end to leave margin)
    const targetRepeat = REEL_REPEATS - 3;
    const targetIdx = targetRepeat * restaurants.length + selectedIndex;
    const centerOffset = Math.floor(VISIBLE_ITEMS / 2);
    const targetPx = (targetIdx - centerOffset) * ITEM_HEIGHT;

    const el = reelRef.current;
    // Reset instantly
    el.style.transition = "none";
    el.style.transform = "translateY(0px)";
    void el.offsetHeight; // force reflow

    // Animate
    el.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.1, 0.7, 0.3, 1)`;
    el.style.transform = `translateY(-${targetPx}px)`;

    setTimeout(() => {
      setWinner(selectedRestaurant);
      setDialogOpen(true);
      setSpinning(false);
    }, SPIN_DURATION + 300);
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
        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-md">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-1">Machine à restaurant</p>
            <h2 className="text-lg font-bold text-gray-800">Où mange-t-on aujourd'hui ?</h2>
          </div>

          <div
            className="relative rounded-2xl border border-gray-100 bg-gray-50"
            style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT, overflow: "hidden" }}
          >
            <div ref={reelRef}>
              {reel.map((restaurant, index) => (
                <div
                  key={`reel-${index}`}
                  className="flex items-center px-3 mx-1 rounded-xl bg-white border border-gray-100"
                  style={{ height: ITEM_HEIGHT - 8, marginTop: 4, marginBottom: 4 }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 text-white font-semibold text-sm shrink-0"
                    style={{ backgroundColor: restaurant.color || FOOD_COLORS[index % FOOD_COLORS.length] }}
                  >
                    {restaurant.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{restaurant.name}</h3>
                    <p className="text-xs text-gray-400 truncate">{restaurant.foodType}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Gradients */}
            <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-10" />

            {/* Selection indicator */}
            <div
              className="absolute inset-x-2 pointer-events-none z-20 border-2 border-orange-400 rounded-xl"
              style={{ top: Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT, height: ITEM_HEIGHT }}
            />
          </div>

          <div className="mt-5">
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
                  style={{ backgroundColor: winner.color || FOOD_COLORS[0] }}
                >
                  {winner.name.charAt(0)}
                </div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">Vous mangez chez</p>
                <h2 className="text-2xl font-extrabold text-gray-900">{winner.name}</h2>
                <p className="text-sm text-gray-500 mt-1">{winner.foodType}</p>
              </div>

              <div className="px-6 pb-6 space-y-3">
                {/* Adresse et distance */}
                {winner.address && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <span>{winner.address}</span>
                      <span className={"ml-2 font-semibold " + (winner.distance <= 300 ? "text-emerald-500" : winner.distance <= 700 ? "text-orange-500" : "text-red-400")}>
                        ({winner.distance < 1000 ? `${winner.distance}m` : `${(winner.distance / 1000).toFixed(1)}km`})
                      </span>
                    </div>
                  </div>
                )}

                {/* Téléphone */}
                {winner.phoneNumber && (
                  <a href={`tel:${winner.phoneNumber}`} className="flex items-center gap-2.5 text-sm text-gray-600 hover:text-orange-500 transition-colors">
                    <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                    <span>{winner.phoneNumber}</span>
                  </a>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {winner.priceRange && (
                    <span className={"text-xs px-2.5 py-1 rounded-lg font-semibold inline-flex items-center gap-1 " + (winner.priceRange === "€" ? "text-emerald-500 bg-emerald-50" : winner.priceRange === "€€" ? "text-blue-500 bg-blue-50" : winner.priceRange === "€€€" ? "text-orange-500 bg-orange-50" : "text-red-500 bg-red-50")}>
                      <Euro className="h-3.5 w-3.5" />{winner.priceRange}
                    </span>
                  )}
                  {winner.takeaway && (
                    <span className="text-xs bg-orange-50 text-orange-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" /> À emporter
                    </span>
                  )}
                  {winner.vegetarianOption && (
                    <span className="text-xs bg-emerald-50 text-emerald-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                      <Leaf className="h-3.5 w-3.5" /> Végétarien
                    </span>
                  )}
                  {winner.halalOption && (
                    <span className="text-xs bg-sky-50 text-sky-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                      <Moon className="h-3.5 w-3.5" /> Halal
                    </span>
                  )}
                  {winner.spicyLevel && winner.spicyLevel !== "none" && (
                    <span className={"text-xs px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1 " + (winner.spicyLevel === "hot" ? "bg-red-100 text-red-600" : winner.spicyLevel === "medium" ? "bg-orange-50 text-orange-600" : "bg-yellow-50 text-yellow-600")}>
                      <Flame className="h-3.5 w-3.5" /> {getSpicyLevelLabel(winner.spicyLevel)}
                    </span>
                  )}
                  {winner.restaurantTickets && winner.restaurantTickets !== "none" && (
                    <span className="text-xs bg-violet-50 text-violet-500 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                      <Ticket className="h-3.5 w-3.5" /> {winner.restaurantTickets === "paper" ? "Ticket papier" : winner.restaurantTickets === "card" ? "Carte ticket resto" : "Papier + carte"}
                    </span>
                  )}
                  {winner.reservationType && winner.reservationType !== "notAvailable" && (
                    <span className={"text-xs px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1 " + (winner.reservationType === "required" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500")}>
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {winner.reservationType === "required" ? "Résa obligatoire" : "Résa conseillée"}
                    </span>
                  )}
                  {winner.phoneOrderAllowed && (
                    <span className="text-xs bg-cyan-50 text-cyan-600 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" /> Commande par tél.
                    </span>
                  )}
                </div>

                {/* Horaires du jour */}
                {winner.openingHours && winner.openingHours.length > 0 && (() => {
                  const today = getCurrentDay();
                  const todayHours = winner.openingHours!.find(oh => oh.dayOfWeek === today);
                  return (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-1 inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-orange-400" /> Aujourd'hui ({getDayName(today)})
                      </p>
                      {!todayHours || todayHours.closed ? (
                        <p className="text-sm text-red-500 font-medium ml-5">Fermé</p>
                      ) : (
                        <p className="text-sm text-gray-600 ml-5">
                          {todayHours.lunchService && <span>Midi : {todayHours.lunchService.opens}–{todayHours.lunchService.closes}</span>}
                          {todayHours.lunchService && todayHours.dinnerService && <span className="mx-1.5 text-gray-300">·</span>}
                          {todayHours.dinnerService && <span>Soir : {todayHours.dinnerService.opens}–{todayHours.dinnerService.closes}</span>}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Promos du jour */}
                {winner.promotions && winner.promotions.length > 0 && (() => {
                  const today = getCurrentDay();
                  const todayPromos = winner.promotions!.filter(p => p.dayOfWeek === null || p.dayOfWeek === today);
                  if (todayPromos.length === 0) return null;
                  return (
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <p className="font-semibold text-orange-600 text-xs uppercase tracking-wide mb-1 inline-flex items-center gap-1">
                        <Gift className="h-3.5 w-3.5" /> Promo du jour
                      </p>
                      {todayPromos.map((promo) => (
                        <p key={promo.id} className="text-sm text-orange-700 ml-5">
                          {promo.description}{promo.discount ? ` (${promo.discount})` : ''}
                        </p>
                      ))}
                    </div>
                  );
                })()}

                {/* Menu */}
                {winner.menuInfo && (
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-600 inline-flex items-start gap-2">
                      <BookOpen className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      <span><span className="font-medium text-gray-700">Menu :</span> {winner.menuInfo}</span>
                    </p>
                  </div>
                )}

                {/* Liens web */}
                {(winner.website || winner.reservationUrl) && (
                  <div className="flex flex-wrap gap-2">
                    {winner.website && (
                      <a href={winner.website} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium">
                        <Globe className="h-4 w-4" /> Menu en ligne
                      </a>
                    )}
                    {winner.reservationUrl && (
                      <a href={winner.reservationUrl} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-sm font-medium">
                        <CalendarCheck className="h-4 w-4" /> Réserver
                      </a>
                    )}
                  </div>
                )}

                {/* Carte OSM */}
                {winner.location && winner.location.lat && winner.location.lng && (
                  <OsmMiniMap
                    lat={winner.location.lat}
                    lon={winner.location.lng}
                    name={winner.name}
                    fromAddress={officeAddress}
                  />
                )}

                <Button
                  onClick={() => setDialogOpen(false)}
                  className="w-full py-5 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white mt-2"
                >
                  🍽️ Bon appétit !
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
