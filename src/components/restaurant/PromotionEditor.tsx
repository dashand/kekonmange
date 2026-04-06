
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Promotion, DayOfWeek, getDayName } from "@/types/restaurant";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Percent, Euro, Plus, Trash } from "lucide-react";
import { toast } from "sonner";

interface PromotionEditorProps {
  promotions: Promotion[];
  onChange: (promotions: Promotion[]) => void;
}

const PromotionEditor: React.FC<PromotionEditorProps> = ({ promotions, onChange }) => {
  const [newPromotion, setNewPromotion] = useState<{
    description: string;
    dayOfWeek: string;
    discount: string;
  }>({
    description: "",
    dayOfWeek: "-1", // -1 pour "Tous les jours"
    discount: "",
  });

  const handleAddPromotion = () => {
    if (!newPromotion.description.trim()) {
      toast.error("Veuillez entrer une description pour la promotion");
      return;
    }

    const dayOfWeekValue = newPromotion.dayOfWeek === "-1" 
      ? null 
      : parseInt(newPromotion.dayOfWeek) as DayOfWeek;

    const promotion: Promotion = {
      id: uuidv4(),
      description: newPromotion.description.trim(),
      dayOfWeek: dayOfWeekValue,
      discount: newPromotion.discount.trim() || undefined,
    };

    onChange([...promotions, promotion]);
    setNewPromotion({
      description: "",
      dayOfWeek: "-1",
      discount: "",
    });

    toast.success("Promotion ajoutée");
  };

  const handleRemovePromotion = (id: string) => {
    onChange(promotions.filter(promo => promo.id !== id));
    toast.success("Promotion supprimée");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Percent className="h-4 w-4" />
          Promotions
        </CardTitle>
        <CardDescription>
          Ajoutez des promotions ou réductions pour ce restaurant
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {promotions.length > 0 ? (
            <div className="space-y-2">
              {promotions.map((promo) => (
                <div 
                  key={promo.id} 
                  className="flex items-start justify-between p-3 rounded-md border bg-background"
                >
                  <div>
                    <p className="font-medium">{promo.description}</p>
                    <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-muted-foreground">
                      {promo.discount && (
                        <span className="flex items-center gap-1">
                          <Euro className="h-3.5 w-3.5" />
                          {promo.discount}
                        </span>
                      )}
                      <span>
                        {promo.dayOfWeek !== null 
                          ? getDayName(promo.dayOfWeek)
                          : "Tous les jours"}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemovePromotion(promo.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 border border-dashed rounded-md">
              <p className="text-muted-foreground">
                Aucune promotion définie pour ce restaurant
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-sm font-medium">Ajouter une promotion</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={newPromotion.description}
                onChange={(e) => setNewPromotion({...newPromotion, description: e.target.value})}
                placeholder="Ex: Menu du midi à prix réduit"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Réduction</label>
              <Input
                value={newPromotion.discount}
                onChange={(e) => setNewPromotion({...newPromotion, discount: e.target.value})}
                placeholder="Ex: 10%, 5€, etc."
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Jour</label>
            <Select
              value={newPromotion.dayOfWeek}
              onValueChange={(value) => setNewPromotion({...newPromotion, dayOfWeek: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le jour de la semaine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">Tous les jours</SelectItem>
                <SelectItem value="1">Lundi</SelectItem>
                <SelectItem value="2">Mardi</SelectItem>
                <SelectItem value="3">Mercredi</SelectItem>
                <SelectItem value="4">Jeudi</SelectItem>
                <SelectItem value="5">Vendredi</SelectItem>
                <SelectItem value="6">Samedi</SelectItem>
                <SelectItem value="0">Dimanche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="outline"
          className="gap-1"
          onClick={handleAddPromotion}
        >
          <Plus className="h-4 w-4" />
          Ajouter la promotion
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromotionEditor;
