import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Restaurant, 
  Promotion,
  OpeningHours
} from "@/types/restaurant";
import { 
  SaveIcon, 
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoUploader from "@/components/PhotoUploader";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères.",
  }),
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

const RestaurantEditDialog: React.FC<RestaurantEditDialogProps> = ({
  restaurant,
  open,
  onOpenChange,
  onSave,
}) => {
  const [menuPhotos, setMenuPhotos] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: restaurant?.name || "",
      foodType: restaurant?.foodType || "français",
      address: restaurant?.address || "",
      menuInfo: restaurant?.menuInfo || "",
      takeaway: restaurant?.takeaway || false,
      vegetarianOption: restaurant?.vegetarianOption || false,
      halalOption: restaurant?.halalOption || false,
      distance: restaurant?.distance || 500,
      restaurantTickets: restaurant?.restaurantTickets || "none",
      priceRange: restaurant?.priceRange || "€",
      reservationType: restaurant?.reservationType || "notAvailable",
      phoneOrderAllowed: restaurant?.phoneOrderAllowed || false,
      phoneNumber: restaurant?.phoneNumber || "",
      spicyLevel: restaurant?.spicyLevel || "none",
    },
  });

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
        spicyLevel: restaurant.spicyLevel || "none",
      });
      
      setMenuPhotos(restaurant.menuPhotos || []);
      setPromotions(restaurant.promotions || []);
      setOpeningHours(restaurant.openingHours || []);
    }
  }, [restaurant, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!restaurant) return;

    const updatedRestaurant: Restaurant = {
      ...restaurant,
      name: values.name,
      foodType: values.foodType,
      address: values.address,
      menuInfo: values.menuInfo,
      takeaway: values.takeaway,
      vegetarianOption: values.vegetarianOption,
      halalOption: values.halalOption,
      distance: values.distance,
      menuPhotos: menuPhotos.length > 0 ? menuPhotos : undefined,
      restaurantTickets: values.restaurantTickets,
      priceRange: values.priceRange,
      reservationType: values.reservationType,
      phoneOrderAllowed: values.phoneOrderAllowed,
      phoneNumber: values.phoneNumber,
      promotions: promotions.length > 0 ? promotions : undefined,
      spicyLevel: values.spicyLevel,
      openingHours: openingHours.length > 0 ? openingHours : undefined,
    };

    onSave(updatedRestaurant);
    toast.success(`${values.name} a été mis à jour`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le restaurant</DialogTitle>
          <DialogDescription>
            Modifiez les informations du restaurant.
          </DialogDescription>
        </DialogHeader>

        {restaurant && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <BasicInfoFields form={form} />
              
              <div className="space-y-2">
                <FormLabel>Photos des menus</FormLabel>
                <PhotoUploader 
                  photos={menuPhotos} 
                  onChange={setMenuPhotos} 
                />
                <FormDescription>
                  Ajoutez des photos des menus ou des plats proposés
                </FormDescription>
              </div>

              {/* Section de gestion des promotions */}
              <PromotionEditor 
                promotions={promotions} 
                onChange={setPromotions} 
              />

              {/* Add Opening Hours Editor section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horaires d'ouverture
                  </CardTitle>
                  <CardDescription>
                    Définissez les jours et heures d'ouverture du restaurant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OpeningHoursEditor 
                    openingHours={openingHours} 
                    onChange={setOpeningHours} 
                  />
                </CardContent>
              </Card>

              <OptionFields form={form} />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button variant="food" type="submit">
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantEditDialog;
