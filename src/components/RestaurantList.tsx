
import React from "react";
import { Restaurant } from "@/types/restaurant";
import RestaurantCard from "@/components/RestaurantCard";

interface RestaurantListProps {
  restaurants: Restaurant[];
  onRemove: (id: string) => void;
  onEdit: (restaurant: Restaurant) => void;
  onView: (restaurant: Restaurant) => void;
  officeAddress?: string;
}

const RestaurantList: React.FC<RestaurantListProps> = ({
  restaurants,
  onRemove,
  onEdit,
  onView,
  officeAddress,
}) => {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-lg bg-card">
        <p className="text-muted-foreground">
          Aucun restaurant ne correspond à vos critères.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant.id}
          restaurant={restaurant}
          onRemove={onRemove}
          onEdit={onEdit}
              onView={onView}
          officeAddress={officeAddress}
        />
      ))}
    </div>
  );
};

export default RestaurantList;
