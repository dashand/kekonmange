import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

interface NicknamePromptProps {
  onSubmit: (nickname: string) => void;
}

const NicknamePrompt: React.FC<NicknamePromptProps> = ({ onSubmit }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <User className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">Comment tu t'appelles ?</h2>
            <p className="text-sm text-gray-500">Pour savoir qui ajoute et modifie les restos</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ton prénom ou pseudo"
            maxLength={30}
            autoFocus
            className="text-center text-lg"
          />
          <Button type="submit" disabled={!value.trim()} className="w-full bg-orange-500 hover:bg-orange-600">
            C'est parti !
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NicknamePrompt;
