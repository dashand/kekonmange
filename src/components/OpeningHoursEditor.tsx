
import React, { useState } from "react";
import { DayOfWeek, OpeningHours, getDayName } from "@/types/restaurant";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Sun, Moon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OpeningHoursEditorProps {
  openingHours: OpeningHours[];
  onChange: (openingHours: OpeningHours[]) => void;
}

const defaultOpeningHours: OpeningHours[] = [
  { dayOfWeek: 0, closed: true, lunchService: { opens: "12:00", closes: "14:00" } },  // Dimanche
  { dayOfWeek: 1, closed: false, lunchService: { opens: "12:00", closes: "14:00" } }, // Lundi
  { dayOfWeek: 2, closed: false, lunchService: { opens: "12:00", closes: "14:00" } }, // Mardi
  { dayOfWeek: 3, closed: false, lunchService: { opens: "12:00", closes: "14:00" } }, // Mercredi
  { dayOfWeek: 4, closed: false, lunchService: { opens: "12:00", closes: "14:00" } }, // Jeudi
  { dayOfWeek: 5, closed: false, lunchService: { opens: "12:00", closes: "14:00" } }, // Vendredi
  { dayOfWeek: 6, closed: true, lunchService: { opens: "12:00", closes: "14:00" }, dinnerService: { opens: "19:00", closes: "22:00" } },  // Samedi
];

// Convertit l'ancien format vers le nouveau format
const convertLegacyFormat = (hours: any[]): OpeningHours[] => {
  if (!hours.length) return defaultOpeningHours;
  
  // Vérifie si nous avons déjà le nouveau format
  const firstHour = hours[0];
  if (firstHour.lunchService || firstHour.dinnerService) {
    return hours as OpeningHours[];
  }
  
  // Convertir l'ancien format vers le nouveau
  return hours.map(hour => ({
    dayOfWeek: hour.dayOfWeek,
    closed: hour.closed,
    lunchService: !hour.closed ? { opens: hour.opens, closes: hour.closes } : undefined
  }));
};

const OpeningHoursEditor: React.FC<OpeningHoursEditorProps> = ({ 
  openingHours = [], 
  onChange 
}) => {
  // Initialize with default hours if none provided, or convert from old format
  const [hours, setHours] = useState<OpeningHours[]>(() => {
    if (openingHours.length === 0) return defaultOpeningHours;
    
    // Convert from legacy format if needed
    const convertedHours = convertLegacyFormat(openingHours);
    
    // Ensure we have exactly 7 days
    if (convertedHours.length === 7) return convertedHours;
    
    // Initialize with default and merge with provided hours
    const initialHours = [...defaultOpeningHours];
    
    // Override with any provided hours
    convertedHours.forEach(providedHour => {
      const index = initialHours.findIndex(h => h.dayOfWeek === providedHour.dayOfWeek);
      if (index !== -1) {
        initialHours[index] = providedHour;
      }
    });
    
    return initialHours;
  });

  const handleDayOpenChange = (dayOfWeek: DayOfWeek, isClosed: boolean) => {
    const newHours = hours.map(hour => {
      if (hour.dayOfWeek === dayOfWeek) {
        return { ...hour, closed: isClosed };
      }
      return hour;
    });
    
    setHours(newHours);
    onChange(newHours);
  };

  const handleServiceTimeChange = (
    dayOfWeek: DayOfWeek, 
    serviceType: 'lunchService' | 'dinnerService', 
    field: 'opens' | 'closes', 
    value: string
  ) => {
    const newHours = hours.map(hour => {
      if (hour.dayOfWeek === dayOfWeek) {
        return { 
          ...hour, 
          [serviceType]: { 
            ...hour[serviceType], 
            [field]: value 
          } 
        };
      }
      return hour;
    });
    
    setHours(newHours);
    onChange(newHours);
  };

  const handleToggleService = (
    dayOfWeek: DayOfWeek, 
    serviceType: 'lunchService' | 'dinnerService',
    isEnabled: boolean
  ) => {
    const newHours = hours.map(hour => {
      if (hour.dayOfWeek === dayOfWeek) {
        if (isEnabled) {
          // Enable service with default hours
          const defaultHours = serviceType === 'lunchService' 
            ? { opens: "12:00", closes: "14:00" } 
            : { opens: "19:00", closes: "22:00" };
            
          return { ...hour, [serviceType]: defaultHours };
        } else {
          // Disable service
          const newHour = { ...hour };
          delete newHour[serviceType];
          return newHour;
        }
      }
      return hour;
    });
    
    setHours(newHours);
    onChange(newHours);
  };

  return (
    <div className="space-y-3">
      {hours
        .sort((a, b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek))
        .map((hour) => (
          <Card key={hour.dayOfWeek} className={hour.closed ? "opacity-70" : ""}>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{getDayName(hour.dayOfWeek)}</Label>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`open-${hour.dayOfWeek}`} className="text-sm">
                      {hour.closed ? "Fermé" : "Ouvert"}
                    </Label>
                    <Switch
                      id={`open-${hour.dayOfWeek}`}
                      checked={!hour.closed}
                      onCheckedChange={(checked) => 
                        handleDayOpenChange(hour.dayOfWeek, !checked)
                      }
                    />
                  </div>
                </div>
                
                {!hour.closed && (
                  <div className="space-y-4">
                    {/* Service du midi */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Sun className="h-4 w-4 text-amber-500" />
                          <Label className="text-sm font-medium">Service du midi</Label>
                        </div>
                        
                        <Switch
                          id={`lunch-${hour.dayOfWeek}`}
                          checked={!!hour.lunchService}
                          onCheckedChange={(checked) => 
                            handleToggleService(hour.dayOfWeek, 'lunchService', checked)
                          }
                        />
                      </div>
                      
                      {hour.lunchService && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="time"
                              value={hour.lunchService.opens}
                              onChange={(e) => 
                                handleServiceTimeChange(hour.dayOfWeek, 'lunchService', 'opens', e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="time"
                              value={hour.lunchService.closes}
                              onChange={(e) => 
                                handleServiceTimeChange(hour.dayOfWeek, 'lunchService', 'closes', e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Separator className="my-1" />
                    
                    {/* Service du soir */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Moon className="h-4 w-4 text-indigo-400" />
                          <Label className="text-sm font-medium">Service du soir</Label>
                        </div>
                        
                        <Switch
                          id={`dinner-${hour.dayOfWeek}`}
                          checked={!!hour.dinnerService}
                          onCheckedChange={(checked) => 
                            handleToggleService(hour.dayOfWeek, 'dinnerService', checked)
                          }
                        />
                      </div>
                      
                      {hour.dinnerService && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="time"
                              value={hour.dinnerService.opens}
                              onChange={(e) => 
                                handleServiceTimeChange(hour.dayOfWeek, 'dinnerService', 'opens', e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                              type="time"
                              value={hour.dinnerService.closes}
                              onChange={(e) => 
                                handleServiceTimeChange(hour.dayOfWeek, 'dinnerService', 'closes', e.target.value)
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};

export default OpeningHoursEditor;
