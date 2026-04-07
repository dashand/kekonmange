import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Restaurant, Promotion, OpeningHours, getRandomColor
} from "@/types/restaurant";
import { Clock, ChevronDown, Camera, Percent, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoUploader from "@/components/PhotoUploader";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import OpeningHoursEditor from "@/components/OpeningHoursEditor";
import BasicInfoFields from "@/components/restaurant/BasicInfoFields";
import OptionFields from "@/components/restaurant/OptionFields";
import PromotionEditor from "@/components/restaurant/PromotionEditor";
import OsmAutocomplete from "@/components/OsmAutocomplete";
import type { OsmRestaurant } from "@/services/osm";

interface RestaurantFormProps {
  onAdd: (restaurant: Restaurant) => void;
  activeWorkplace: { id: string; name: string; address: string; isActive: boolean; };
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  foodType: z.string(),
  address: z.string().optional(),
  menuInfo: z.string().optional(),
  takeaway: z.boolean().default(false),
  vegetarianOption: z.boolean().default(false),
  halalOption: z.boolean().default(false),
  distance: z.number().min(50).max(5000),
  restaurantTickets: z.enum(["none", "paper", "card", "both"] as const).default("none"),
  priceRange: z.enum(["€", "€€", "€€€", "€€€€"] as const).default("€"),
  reservationType: z.enum(["required", "recommended", "notAvailable"] as const).default("notAvailable"),
  phoneOrderAllowed: z.boolean().default(false),
  phoneNumber: z.string().optional(),
  spicyLevel: z.enum(["none", "light", "medium", "hot"] as const).default("none"),
});

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, subtitle, defaultOpen = false, children, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-500">{icon}</div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-800">{title}</p>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
          {badge && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">{badge}</span>}
        </div>
        <ChevronDown className={"h-4 w-4 text-gray-400 transition-transform " + (isOpen ? "rotate-180" : "")} />
      </button>
      {isOpen && <div className="px-4 pb-4 pt-0">{children}</div>}
    </div>
  );
};

const RestaurantForm: React.FC<RestaurantFormProps> = ({ onAdd, activeWorkplace }) => {
  const [menuPhotos, setMenuPhotos] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  
  const mapOsmCuisine = (cuisine?: string): string => {
    if (!cuisine) return "autre";
    const c = cuisine.toLowerCase().split(";")[0].trim();
    const map: Record<string, string> = {
      french: "français", italian: "italien", pizza: "italien",
      japanese: "japonais", sushi: "japonais", chinese: "chinois",
      indian: "indien", mexican: "mexicain", lebanese: "libanais",
      burger: "fast-food", kebab: "fast-food", sandwich: "fast-food",
    };
    for (const [key, val] of Object.entries(map)) {
      if (c.includes(key)) return val;
    }
    return "autre";
  };

  const handleOsmSelect = (osm: OsmRestaurant) => {
    form.setValue("name", osm.name);
    form.setValue("foodType", mapOsmCuisine(osm.cuisine));
    if (osm.address) form.setValue("address", osm.address);
    if (osm.phone) form.setValue("phoneNumber", osm.phone);
    if (osm.distance) form.setValue("distance", Math.min(Math.max(Math.round(osm.distance / 50) * 50, 50), 5000));
    if (osm.vegetarian) form.setValue("vegetarianOption", true);
    if (osm.halal) form.setValue("halalOption", true);
    if (osm.takeaway) form.setValue("takeaway", true);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", foodType: "français", address: "", menuInfo: "",
      takeaway: false, vegetarianOption: false, halalOption: false,
      distance: 500, restaurantTickets: "none", priceRange: "€",
      reservationType: "notAvailable", phoneOrderAllowed: false,
      phoneNumber: "", spicyLevel: "none",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newRestaurant: Restaurant = {
      id: "", name: values.name, foodType: values.foodType,
      color: getRandomColor(), address: values.address || undefined,
      menuInfo: values.menuInfo || undefined, takeaway: values.takeaway,
      vegetarianOption: values.vegetarianOption, halalOption: values.halalOption,
      distance: values.distance, workplaceId: activeWorkplace.id,
      menuPhotos: menuPhotos.length > 0 ? menuPhotos : undefined,
      restaurantTickets: values.restaurantTickets, priceRange: values.priceRange,
      reservationType: values.reservationType, phoneOrderAllowed: values.phoneOrderAllowed,
      phoneNumber: values.phoneNumber || undefined,
      promotions: promotions.length > 0 ? promotions : undefined,
      spicyLevel: values.spicyLevel,
      openingHours: openingHours.length > 0 ? openingHours : undefined,
    };
    onAdd(newRestaurant);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Recherche OSM */}
        <div className="rounded-2xl border border-orange-100 bg-orange-50/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">Recherche rapide</p>
              <p className="text-xs text-gray-400">Trouvez un restaurant à proximité pour pré-remplir la fiche</p>
            </div>
          </div>
          <OsmAutocomplete
            workplaceId={activeWorkplace.id}
            workplaceAddress={activeWorkplace.address}
            onSelect={handleOsmSelect}
          />
        </div>

        {/* Section principale - toujours visible */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">Informations essentielles</p>
              <p className="text-xs text-gray-400">Nom, cuisine, distance et prix</p>
            </div>
          </div>
          <BasicInfoFields form={form} />
        </div>

        {/* Options - toujours visible car rapide */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-orange-50 text-orange-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">Options et services</p>
              <p className="text-xs text-gray-400">Réservation, à emporter, végétarien...</p>
            </div>
          </div>
          <OptionFields form={form} />
        </div>

        {/* Sections repliables */}
        <CollapsibleSection
          title="Photos"
          icon={<Camera className="h-4 w-4" />}
          subtitle="Ajoutez des photos du menu ou des plats"
          badge={menuPhotos.length > 0 ? `${menuPhotos.length} photo${menuPhotos.length > 1 ? 's' : ''}` : undefined}
        >
          <PhotoUploader photos={menuPhotos} onChange={setMenuPhotos} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Promotions"
          icon={<Percent className="h-4 w-4" />}
          subtitle="Réductions et offres spéciales"
          badge={promotions.length > 0 ? `${promotions.length} promo${promotions.length > 1 ? 's' : ''}` : undefined}
        >
          <PromotionEditor promotions={promotions} onChange={setPromotions} />
        </CollapsibleSection>

        <CollapsibleSection
          title="Horaires d'ouverture"
          icon={<Clock className="h-4 w-4" />}
          subtitle="Jours et heures d'ouverture"
          badge={openingHours.length > 0 ? "Configuré" : undefined}
        >
          <OpeningHoursEditor openingHours={openingHours} onChange={setOpeningHours} />
        </CollapsibleSection>

        <Button 
          type="submit"
          className="w-full py-6 rounded-2xl text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
        >
          Ajouter le restaurant
        </Button>
      </form>
    </Form>
  );
};

export default RestaurantForm;
