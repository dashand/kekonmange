import React from "react";
import { Utensils } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="w-full py-10 px-4 flex flex-col items-center justify-center animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-3 rounded-2xl bg-orange-50 text-orange-500">
          <Utensils className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Kekon<span className="text-orange-500">Mange</span>
        </h1>
      </div>
      <p className="text-gray-400 text-center max-w-md text-sm">
        Enregistrez vos restaurants favoris et laissez le hasard choisir pour vous.
      </p>
    </header>
  );
};

export default Header;
