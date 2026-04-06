
import React from "react";
import { Utensils } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 flex flex-col items-center justify-center animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          <Utensils className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">KekonMange</h1>
      </div>
      <p className="text-muted-foreground text-center max-w-lg text-balance">
        Enregistrez vos restaurants préférés et laissez la chance décider où vous allez manger aujourd'hui
      </p>
    </header>
  );
};

export default Header;
