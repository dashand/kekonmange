import React, { useState } from "react";
import { Utensils, Building2, Edit2, Check, X, Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface HeaderProps {
  instanceName?: string;
  instanceCode?: string;
  onUpdateName?: (name: string) => Promise<void>;
  onSwitchInstance?: () => void;
  nickname?: string;
  onChangeNickname?: () => void;
}

const Header: React.FC<HeaderProps> = ({ instanceName, instanceCode, onUpdateName, onSwitchInstance, nickname, onChangeNickname }) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(instanceName || "");

  const handleSave = async () => {
    if (editName.trim() && onUpdateName) {
      await onUpdateName(editName.trim());
      toast.success("Nom mis à jour");
    }
    setEditing(false);
  };

  const copyCode = () => {
    if (instanceCode) {
      navigator.clipboard.writeText(instanceCode);
      toast.success("Code copié !");
    }
  };

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

      {instanceName && (
        <div className="flex items-center gap-2 mt-1 mb-2">
          {editing ? (
            <div className="flex items-center gap-1.5">
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-7 text-sm w-48 text-center"
                autoFocus
                onKeyDown={e => e.key === "Enter" && handleSave()}
              />
              <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500" onClick={handleSave}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                <Building2 className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-sm font-semibold text-gray-700">{instanceName}</span>
                <button onClick={() => { setEditName(instanceName); setEditing(true); }}
                  className="text-gray-300 hover:text-gray-500 transition-colors ml-1">
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
              <button onClick={copyCode}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copier le code d'instance">
                <span className="text-[11px] font-mono">{instanceCode}</span>
                <Copy className="h-3 w-3" />
              </button>
              {onSwitchInstance && (
                <button onClick={onSwitchInstance}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                  title="Changer d'instance">
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {nickname && (
        <button onClick={onChangeNickname}
          className="text-[11px] text-gray-400 hover:text-orange-500 transition-colors mt-1"
          title="Changer de pseudo">
          Connecté en tant que <span className="font-semibold text-gray-600">{nickname}</span>
        </button>
      )}

      <p className="text-gray-400 text-center max-w-md text-sm">
        Enregistrez vos restaurants favoris et laissez le hasard choisir pour vous.
      </p>
    </header>
  );
};

export default Header;
