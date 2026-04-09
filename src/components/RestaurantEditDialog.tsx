import React, { useState, useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Restaurant,
  Promotion,
  OpeningHours
} from "@/types/restaurant";
import { Clock, Camera, Percent, UtensilsCrossed, ChevronDown, Loader2, Check } from "lucide-react";
import PhotoUploader from "@/components/PhotoUploader";
import {
  Form,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import OpeningHoursEditor from "@/components/OpeningHoursEditor";
import BasicInfoFields from "@/components/restaurant/BasicInfoFields";
import OptionFields from "@/components/restaurant/OptionFields";
import PromotionEditor from "@/components/restaurant/PromotionEditor";

interface RestaurantEditDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (restaurant: Restaurant) => void;
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
  website: z.string().optional(),
  reservationUrl: z.string().optional(),
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

const RestaurantEditDialog: React.FC<RestaurantEditDialogProps> = ({
  restaurant,
  open,
  onOpenChange,
  onSave,
}) => {
  const [menuPhotos, setMenuPhotos] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const hasChangesRef = useRef(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", foodType: "français", address: "", menuInfo: "",
      takeaway: false, vegetarianOption: false, halalOption: false,
      distance: 500, restaurantTickets: "none", priceRange: "€",
      reservationType: "notAvailable", phoneOrderAllowed: false,
      phoneNumber: "", website: "", reservationUrl: "", spicyLevel: "none",
    },
  });

  // Reset form when restaurant changes
  useEffect(() => {
    if (restaurant) {
      form.reset({
        name: restaurant.name,
        foodType: restaurant.foodType,
        address: restaurant.address || "",
        menuInfo: restaurant.menuInfo || "",
        takeaway: restaurant.takeaway,
        vegetarianOption: restaurant.vegetarianOption,
        halalOption: restaurant.halalOption,
        distance: restaurant.distance,
        restaurantTickets: restaurant.restaurantTickets || "none",
        priceRange: restaurant.priceRange || "€",
        reservationType: restaurant.reservationType || "notAvailable",
        phoneOrderAllowed: restaurant.phoneOrderAllowed || false,
        phoneNumber: restaurant.phoneNumber || "",
        website: restaurant.website || "",
        reservationUrl: restaurant.reservationUrl || "",
        spicyLevel: restaurant.spicyLevel || "none",
      });
      setMenuPhotos(restaurant.menuPhotos || []);
      setPromotions(restaurant.promotions || []);
      setOpeningHours(restaurant.openingHours || []);
      hasChangesRef.current = false;
      setSaved(false);
    }
  }, [restaurant, form]);

  // Build updated restaurant from current state
  const buildUpdatedRestaurant = useCallback((): Restaurant | null => {
    if (!restaurant) return null;
    const values = form.getValues();
    const result = formSchema.safeParse(values);
    if (!result.success) return null;

    return {
      ...restaurant,
      name: values.name,
      foodType: values.foodType,
      address: values.address || undefined,
      menuInfo: values.menuInfo || undefined,
      takeaway: values.takeaway,
      vegetarianOption: values.vegetarianOption,
      halalOption: values.halalOption,
      distance: values.distance,
      menuPhotos: menuPhotos.length > 0 ? menuPhotos : undefined,
      restaurantTickets: values.restaurantTickets,
      priceRange: values.priceRange,
      reservationType: values.reservationType,
      phoneOrderAllowed: values.phoneOrderAllowed,
      phoneNumber: values.phoneNumber || undefined,
      website: values.website || undefined,
      reservationUrl: values.reservationUrl || undefined,
      promotions: promotions.length > 0 ? promotions : undefined,
      spicyLevel: values.spicyLevel,
      openingHours: openingHours.length > 0 ? openingHours : undefined,
    };
  }, [restaurant, form, menuPhotos, promotions, openingHours]);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    hasChangesRef.current = true;
    setSaved(false);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const updated = buildUpdatedRestaurant();
      if (updated) {
        setSaving(true);
        onSave(updated);
        setTimeout(() => {
          setSaving(false);
          setSaved(true);
          hasChangesRef.current = false;
        }, 300);
      }
    }, 800);
  }, [buildUpdatedRestaurant, onSave]);

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      triggerAutoSave();
    });
    return () => subscription.unsubscribe();
  }, [form, triggerAutoSave]);

  // Watch non-form state changes (photos, promotions, openingHours)
  useEffect(() => {
    if (!restaurant) return;
    triggerAutoSave();
  }, [menuPhotos, promotions, openingHours, triggerAutoSave]);

  // Save on dialog close if needed
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && hasChangesRef.current) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const updated = buildUpdatedRestaurant();
      if (updated) {
        onSave(updated);
        toast.success(`${updated.name} a été mis à jour`);
      }
    }
    onOpenChange(isOpen);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Modifier le restaurant</DialogTitle>
              <DialogDescription>
                Les modifications sont sauvegardées automatiquement.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 text-xs mr-6">
              {saving && (
                <span className="text-orange-500 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Sauvegarde...
                </span>
              )}
              {saved && !saving && (
                <span className="text-emerald-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Sauvegardé
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {restaurant && (
          <Form {...form}>
            <div className="space-y-4">
              {/* Section principale */}
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

              {/* Options */}
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
                subtitle="Photos du menu ou des plats"
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
                defaultOpen={openingHours.length > 0}
              >
                <OpeningHoursEditor openingHours={openingHours} onChange={setOpeningHours} />
              </CollapsibleSection>
            </div>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantEditDialog;
