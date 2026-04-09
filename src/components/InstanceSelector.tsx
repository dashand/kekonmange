import React, { useState } from "react";
import { useInstance } from "@/contexts/InstanceContext";
import { Building2, Plus, LogIn, Trash2, ArrowRight, AlertTriangle, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const InstanceSelector: React.FC = () => {
  const { knownInstances, joinInstance, createInstance, removeInstance } = useInstance();
  const [mode, setMode] = useState<"home" | "join" | "create">("home");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length !== 6) {
      toast.error("Le code doit contenir exactement 6 caractères hexadécimaux");
      return;
    }
    setLoading(true);
    try {
      await joinInstance(code.trim());
      window.location.reload();
    } catch {
      toast.error("Instance introuvable. Vérifiez le code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Veuillez saisir un nom d'entreprise");
      return;
    }
    setLoading(true);
    try {
      await createInstance(name.trim());
      window.location.reload();
    } catch (e) {
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Kekon<span className="text-orange-500">Mange</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Choisissez ou créez une instance pour votre entreprise
          </p>
        </div>

        {mode === "home" && (
          <div className="space-y-4">
            {/* Known instances */}
            {knownInstances.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vos instances</p>
                {knownInstances.map(inst => (
                  <div key={inst.code} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{inst.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{inst.code}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-red-500"
                      onClick={() => removeInstance(inst.code)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <button
                      className="h-9 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md"
                      onClick={async () => { await joinInstance(inst.code); window.location.reload(); }}>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode("join")}
                className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-center space-y-2"
              >
                <LogIn className="h-6 w-6 text-blue-500 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">Rejoindre</p>
                <p className="text-[11px] text-gray-400">Avec un code existant</p>
              </button>
              <button
                onClick={() => setMode("create")}
                className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all text-center space-y-2"
              >
                <Plus className="h-6 w-6 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-gray-700">Nouvelle instance</p>
                <p className="text-[11px] text-gray-400">Créer pour votre entreprise</p>
              </button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="text-xs">
                Les instances non consultées depuis plus de <strong>6 mois</strong> sont automatiquement supprimées avec toutes leurs données.
              </p>
            </div>
          </div>
        )}

        {mode === "join" && (
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800">Rejoindre une instance</h2>
            </div>
            <p className="text-xs text-gray-400">Saisissez le code à 6 caractères fourni par votre entreprise</p>
            <Input
              placeholder="Ex: A1B2C3"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 6))}
              className="font-mono text-center text-lg tracking-widest"
              maxLength={6}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setMode("home"); setCode(""); }}>
                Retour
              </Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={handleJoin} disabled={loading || code.length !== 6}>
                {loading ? "Connexion..." : "Rejoindre"}
              </Button>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold text-gray-800">Nouvelle instance</h2>
            </div>
            <p className="text-xs text-gray-400">Un code unique sera généré automatiquement. Partagez-le avec vos collègues.</p>
            <Input
              placeholder="Nom de l'entreprise"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setMode("home"); setName(""); }}>
                Retour
              </Button>
              <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleCreate} disabled={loading || !name.trim()}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstanceSelector;
