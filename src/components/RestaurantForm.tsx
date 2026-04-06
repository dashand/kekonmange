
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Restaurant,
  Promotion,
  DayOfWeek,
  OpeningHours,
  getRandomColor
} from "@/types/restaurant";
import { SaveIcon, Clock } from "lucide-react";
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
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import OpeningHoursEditor from "@/components/OpeningHoursEditor";
import BasicInfoFields from "@/components/restaurant/BasicInfoFields";
import OptionFields from "@/components/restaurant/OptionFields";
import PromotionEditor from "@/components/restaurant/PromotionEditor";

interface RestaurantFormProps {
  onAdd: (restaurant: Restaurant) => void;
  activeWorkplace: {
    id: string;
    name: string;
    address: string;
    isActive: boolean;
  };
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

const RestaurantForm: React.FC<RestaurantFormProps> = ({ onAdd, activeWorkplace }) => {
  const [menuPhotos, setMenuPhotos] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      foodType: "français",
      address: "",
      menuInfo: "",
      takeaway: false,
      vegetarianOption: false,
      halalOption: false,
      distance: 500,
      restaurantTickets: "none",
      priceRange: "€",
      reservationType: "notAvailable",
      phoneOrderAllowed: false,
      phoneNumber: "",
      spicyLevel: "none",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const newRestaurant: Restaurant = {
      id: uuidv4(),
      name: values.name,
      foodType: values.foodType,
      color: getRandomColor(),
      address: values.address || undefined,
      menuInfo: values.menuInfo || undefined,
      takeaway: values.takeaway,
      vegetarianOption: values.vegetarianOption,
      halalOption: values.halalOption,
      distance: values.distance,
      workplaceId: activeWorkplace.id,
      menuPhotos: menuPhotos.length > 0 ? menuPhotos : undefined,
      restaurantTickets: values.restaurantTickets,
      priceRange: values.priceRange,
      reservationType: values.reservationType,
      phoneOrderAllowed: values.phoneOrderAllowed,
      phoneNumber: values.phoneNumber || undefined,
      promotions: promotions.length > 0 ? promotions : undefined,
      spicyLevel: values.spicyLevel,
      openingHours: openingHours.length > 0 ? openingHours : undefined,
    };

    onAdd(newRestaurant);
  };

  return (
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
        
        {/* Section des horaires d'ouverture */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-base flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              Horaires d'ouverture
            </h3>
            <p className="text-sm text-muted-foreground">
              Définissez les jours et heures d'ouverture du restaurant
            </p>
          </div>
          <div className="mt-3">
            <OpeningHoursEditor 
              openingHours={openingHours} 
              onChange={setOpeningHours} 
            />
          </div>
        </div>

        <OptionFields form={form} />

        <Button className="w-full" variant="food" type="submit">
          Ajouter le restaurant
        </Button>
      </form>
    </Form>
  );
};

export default RestaurantForm;
