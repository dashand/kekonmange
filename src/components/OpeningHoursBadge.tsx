
import React from "react";
import { OpeningHours, DayOfWeek, getDayName } from "@/types/restaurant";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface OpeningHoursBadgeProps {
  openingHours: OpeningHours[] | undefined;
  currentDay?: boolean;
}

const OpeningHoursBadge: React.FC<OpeningHoursBadgeProps> = ({ 
  openingHours, 
  currentDay = true 
}) => {
  if (!openingHours || openingHours.length === 0) {
    return null;
  }

  const today = new Date().getDay() as DayOfWeek;
  const displayDay = currentDay ? today : undefined;
  
  const todayHours = displayDay !== undefined 
    ? openingHours.find(h => h.dayOfWeek === displayDay)
    : undefined;

  const formatOpeningHours = (hours: OpeningHours) => {
    if (hours.closed) return "Fermé";
    
    let formattedHours = "";
    
    // Format lunch service if available
    if (hours.lunchService) {
      formattedHours += `${hours.lunchService.opens} - ${hours.lunchService.closes} (midi)`;
    }
    
    // Add separator if both services are available
    if (hours.lunchService && hours.dinnerService) {
      formattedHours += ", ";
    }
    
    // Format dinner service if available
    if (hours.dinnerService) {
      formattedHours += `${hours.dinnerService.opens} - ${hours.dinnerService.closes} (soir)`;
    }
    
    return formattedHours;
  };

  if (displayDay !== undefined && todayHours) {
    if (todayHours.closed) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          Fermé aujourd'hui
        </Badge>
      );
    }

    return (
      <Badge variant="time">
        <Clock className="mr-1 h-3 w-3" />
        Aujourd'hui: {formatOpeningHours(todayHours)}
      </Badge>
    );
  }

  // Si on ne montre pas seulement aujourd'hui ou si aujourd'hui n'est pas disponible
  // on affiche un résumé comme "Ouvert 5j/7"
  const openDays = openingHours.filter(h => !h.closed).length;
  
  return (
    <Badge variant={openDays > 0 ? "time" : "outline"} className={openDays === 0 ? "text-muted-foreground" : ""}>
      <Clock className="mr-1 h-3 w-3" />
      {openDays > 0 ? `Ouvert ${openDays}j/7` : "Fermé"}
    </Badge>
  );
};

export default OpeningHoursBadge;
