
import React from "react";
import { FoodType, PriceRange, RestaurantTicketType, ReservationType, SpicyLevel } from "@/types/restaurant";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Euro, TicketCheck, Building, PhoneCall, Flame } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

const foodTypes: FoodType[] = [
  "français", "italien", "japonais", "chinois", "indien", 
  "mexicain", "libanais", "fast-food", "autre",
];

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom du restaurant</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Le Bistrot du Coin" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="foodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de cuisine</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de cuisine" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {foodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="distance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Distance (en mètres)</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium">
                    {field.value < 1000
                      ? `${field.value} mètres`
                      : `${(field.value / 1000).toFixed(1)} km`}
                  </span>
                </div>
                <FormControl>
                  <Slider
                    min={50}
                    max={5000}
                    step={50}
                    defaultValue={[field.value]}
                    value={[field.value]}
                    onValueChange={(value) => {
                      field.onChange(value[0]);
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Fourchette de prix
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la fourchette de prix" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="€">€ (10€ et moins)</SelectItem>
                  <SelectItem value="€€">€€ (10€ à 20€)</SelectItem>
                  <SelectItem value="€€€">€€€ (20€ à 30€)</SelectItem>
                  <SelectItem value="€€€€">€€€€ (30€ et plus)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="restaurantTickets"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <TicketCheck className="h-4 w-4" />
                Tickets restaurant
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type de tickets" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Pas de prise en charge</SelectItem>
                  <SelectItem value="paper">Ticket restaurant (chèque)</SelectItem>
                  <SelectItem value="card">Ticket restaurant (carte)</SelectItem>
                  <SelectItem value="both">Ticket restaurant (carte et chèque)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="spicyLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Niveau de piment
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le niveau de piment" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Non pimenté</SelectItem>
                <SelectItem value="light">Légèrement pimenté</SelectItem>
                <SelectItem value="medium">Réchauffe en hiver</SelectItem>
                <SelectItem value="hot">Porte de l'enfer</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse du restaurant</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 12 rue du Commerce, 75015 Paris" {...field} />
            </FormControl>
            <FormDescription>
              Adresse complète du restaurant
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Numéro de téléphone</FormLabel>
            <FormControl>
              <Input placeholder="Ex: 01 23 45 67 89" {...field} />
            </FormControl>
            <FormDescription>
              Numéro de téléphone du restaurant
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="menuInfo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Informations sur le menu</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Ex: Menu du jour à 15€, plat signature: entrecôte..." 
                className="min-h-24 resize-y"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Détails sur les spécialités, prix, ou menus disponibles
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoFields;
