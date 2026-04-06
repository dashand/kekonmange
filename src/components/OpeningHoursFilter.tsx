
import React from "react";
import { DayOfWeek, getDayName, getDayHourLabel } from "@/types/restaurant";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OpeningHoursFilterProps {
  selectedDay: DayOfWeek | null;
  selectedTime: string | null;
  onDayChange: (day: DayOfWeek | null) => void;
  onTimeChange: (time: string | null) => void;
}

const OpeningHoursFilter: React.FC<OpeningHoursFilterProps> = ({
  selectedDay,
  selectedTime,
  onDayChange,
  onTimeChange,
}) => {
  const isFiltering = selectedDay !== null;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(e.target.value || null);
  };

  const handleClearFilters = () => {
    onDayChange(null);
    onTimeChange(null);
  };

  const today = new Date().getDay() as DayOfWeek;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Filtrer par horaires</Label>
        {isFiltering && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-7 px-2 text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Jour</Label>
        <Select
          value={selectedDay?.toString() || "all"}
          onValueChange={(value) => onDayChange(value === "all" ? null : parseInt(value) as DayOfWeek)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionner un jour" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les jours</SelectItem>
            <SelectItem value={today.toString()}>{getDayName(today)} (aujourd'hui)</SelectItem>
            {Array.from({ length: 7 }).map((_, i) => {
              const day = i as DayOfWeek;
              if (day === today) return null;
              return (
                <SelectItem key={day} value={day.toString()}>
                  {getDayName(day)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {selectedDay !== null && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Heure</Label>
          <Input
            type="time"
            value={selectedTime || ""}
            onChange={handleTimeChange}
            className="w-full"
          />
        </div>
      )}

      {isFiltering && (
        <div className="pt-2">
          <Badge variant="time" className="w-full justify-center py-1.5">
            <Clock className="mr-2 h-3.5 w-3.5" />
            {getDayHourLabel(selectedDay, selectedTime)}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default OpeningHoursFilter;
