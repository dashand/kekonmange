import React from "react";
import { 
  FilterOptions, 
  FoodType, 
  RestaurantTicketType, 
  PriceRange, 
  ReservationType,
  SpicyLevel,
  getSpicyLevelLabel 
} from "@/types/restaurant";
import { 
  Filter, 
  MapPin, 
  ShoppingBag, 
  Leaf, 
  TicketCheck, 
  Euro, 
  Building, 
  PhoneCall,
  Percent,
  Flame,
  Calendar,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import OpeningHoursFilter from "@/components/OpeningHoursFilter";

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

const foodTypes: FoodType[] = [
  "français",
  "italien",
  "japonais",
  "chinois",
  "indien",
  "mexicain",
  "libanais",
  "fast-food",
  "autre",
];

const restaurantTicketTypes: { value: RestaurantTicketType; label: string }[] = [
  { value: "none", label: "Pas de prise en charge" },
  { value: "paper", label: "Ticket restaurant (chèque)" },
  { value: "card", label: "Ticket restaurant (carte)" },
  { value: "both", label: "Ticket restaurant (carte et chèque)" },
];

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: "€", label: "€ (10€ et moins)" },
  { value: "€€", label: "€€ (10€ à 20€)" },
  { value: "€€€", label: "€€€ (20€ à 30€)" },
  { value: "€€€€", label: "€€€€ (30€ et plus)" },
];

const reservationTypes: { value: ReservationType; label: string }[] = [
  { value: "required", label: "Réservation obligatoire" },
  { value: "recommended", label: "Réservation recommandée" },
  { value: "notAvailable", label: "Pas de réservation" },
];

const spicyLevels: { value: SpicyLevel; label: string }[] = [
  { value: "none", label: "Non pimenté" },
  { value: "light", label: "Légèrement pimenté" },
  { value: "medium", label: "Réchauffe en hiver" },
  { value: "hot", label: "Porte de l'enfer" },
];

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange }) => {
  const toggleFoodType = (type: FoodType) => {
    const newFoodTypes = filters.foodTypes.includes(type)
      ? filters.foodTypes.filter((t) => t !== type)
      : [...filters.foodTypes, type];
    
    onFiltersChange({
      ...filters,
      foodTypes: newFoodTypes,
    });
  };

  const toggleFilter = (key: "takeaway" | "vegetarianOption" | "halalOption" | "phoneOrderAllowed" | "hasCurrentPromotion") => {
    onFiltersChange({
      ...filters,
      [key]: filters[key] === true ? null : filters[key] === null ? false : true,
    });
  };

  const toggleRestaurantTicket = (type: RestaurantTicketType) => {
    onFiltersChange({
      ...filters,
      restaurantTickets: filters.restaurantTickets === type ? null : type,
    });
  };

  const togglePriceRange = (price: PriceRange) => {
    const newPriceRanges = filters.priceRange.includes(price)
      ? filters.priceRange.filter((p) => p !== price)
      : [...filters.priceRange, price];
    
    onFiltersChange({
      ...filters,
      priceRange: newPriceRanges,
    });
  };

  const toggleSpicyLevel = (level: SpicyLevel) => {
    const newSpicyLevels = filters.spicyLevel.includes(level)
      ? filters.spicyLevel.filter((l) => l !== level)
      : [...filters.spicyLevel, level];
    
    onFiltersChange({
      ...filters,
      spicyLevel: newSpicyLevels,
    });
  };

  const toggleReservationType = (type: ReservationType) => {
    onFiltersChange({
      ...filters,
      reservationType: filters.reservationType === type ? null : type,
    });
  };

  const getLabelForFilter = (value: boolean | null): string => {
    if (value === null) return "Tous";
    return value ? "Oui" : "Non";
  };

  const resetFilters = () => {
    onFiltersChange({
      maxDistance: 1500,
      takeaway: null,
      vegetarianOption: null,
      halalOption: null,
      foodTypes: [],
      restaurantTickets: null,
      priceRange: [],
      reservationType: null,
      phoneOrderAllowed: null,
      hasCurrentPromotion: null,
      spicyLevel: [],
    });
  };

  return (
    <Card className="w-full shadow-sm glass animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtrer les restaurants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>Distance maximale</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-normal">Distance maximale</Label>
                  </div>
                  <span className="text-sm font-medium">
                    {filters.maxDistance < 1000
                      ? `${filters.maxDistance} m`
                      : `${(filters.maxDistance / 1000).toFixed(1)} km`}
                  </span>
                </div>
                <Slider
                  min={100}
                  max={5000}
                  step={100}
                  value={[filters.maxDistance]}
                  onValueChange={(value) => {
                    onFiltersChange({
                      ...filters,
                      maxDistance: value[0],
                    });
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2">
            <AccordionTrigger>Options disponibles</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-4 py-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-normal">À emporter</Label>
                    </div>
                    <Badge 
                      variant={filters.takeaway !== null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("takeaway")}
                    >
                      {getLabelForFilter(filters.takeaway)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-normal">Option végétarienne</Label>
                    </div>
                    <Badge 
                      variant={filters.vegetarianOption !== null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("vegetarianOption")}
                    >
                      {getLabelForFilter(filters.vegetarianOption)}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">Option halal</Label>
                    <Badge 
                      variant={filters.halalOption !== null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("halalOption")}
                    >
                      {getLabelForFilter(filters.halalOption)}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-normal">Commande par téléphone</Label>
                    </div>
                    <Badge 
                      variant={filters.phoneOrderAllowed !== null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("phoneOrderAllowed")}
                    >
                      {getLabelForFilter(filters.phoneOrderAllowed)}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-normal">Promotion du jour</Label>
                    </div>
                    <Badge 
                      variant={filters.hasCurrentPromotion !== null ? "promotional" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleFilter("hasCurrentPromotion")}
                    >
                      {getLabelForFilter(filters.hasCurrentPromotion)}
                    </Badge>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3">
            <AccordionTrigger>Type de cuisine</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 py-2">
                {foodTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={filters.foodTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFoodType(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <TicketCheck className="h-4 w-4" />
                Tickets restaurant
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 py-2">
                {restaurantTicketTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.restaurantTickets === type.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleRestaurantTicket(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Fourchette de prix
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 py-2">
                {priceRanges.map((price) => (
                  <Badge
                    key={price.value}
                    variant={filters.priceRange.includes(price.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePriceRange(price.value)}
                  >
                    {price.label}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Réservation
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 py-2">
                {reservationTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={filters.reservationType === type.value ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleReservationType(type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Niveau de piment
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-2 py-2">
                {spicyLevels.map((level) => (
                  <Badge
                    key={level.value}
                    variant={filters.spicyLevel.includes(level.value) ? "spicy" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSpicyLevel(level.value)}
                  >
                    {level.label}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Horaires d'ouverture
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="py-2">
                <OpeningHoursFilter 
                  selectedDay={filters.openOnDay}
                  selectedTime={filters.openAtTime}
                  onDayChange={(day) => {
                    onFiltersChange({
                      ...filters,
                      openOnDay: day
                    });
                  }}
                  onTimeChange={(time) => {
                    onFiltersChange({
                      ...filters,
                      openAtTime: time
                    });
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={resetFilters}
        >
          Réinitialiser les filtres
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;

