import React, { useState } from "react";
import { Workplace } from "@/types/restaurant";
import { MapPin, Plus, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface WorkplaceSelectorProps {
  workplaces: Workplace[];
  onAddWorkplace: (workplace: Workplace) => void;
  onSelectWorkplace: (workplace: Workplace) => void;
  onEditWorkplace: (workplace: Workplace) => void;
  onDeleteWorkplace: (id: string) => void;
}

const WorkplaceSelector: React.FC<WorkplaceSelectorProps> = ({
  workplaces, onAddWorkplace, onSelectWorkplace, onEditWorkplace, onDeleteWorkplace,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newWorkplaceName, setNewWorkplaceName] = useState("");
  const [newWorkplaceAddress, setNewWorkplaceAddress] = useState("");
  const [editingWorkplace, setEditingWorkplace] = useState<Workplace | null>(null);

  const handleAddWorkplace = () => {
    if (!newWorkplaceName.trim() || !newWorkplaceAddress.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    const newWorkplace: Workplace = {
      id: "",
      name: newWorkplaceName.trim(),
      address: newWorkplaceAddress.trim(),
      isActive: workplaces.length === 0,
    };
    onAddWorkplace(newWorkplace);
    setNewWorkplaceName("");
    setNewWorkplaceAddress("");
    setIsAddDialogOpen(false);
    toast.success(`"${newWorkplaceName}" a été ajouté`);
  };

  const handleEditWorkplace = () => {
    if (!editingWorkplace || !editingWorkplace.name.trim() || !editingWorkplace.address.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    onEditWorkplace(editingWorkplace);
    setIsEditDialogOpen(false);
    toast.success(`"${editingWorkplace.name}" a été mis à jour`);
  };

  const openEditDialog = (workplace: Workplace) => {
    setEditingWorkplace({ ...workplace });
    setIsEditDialogOpen(true);
  };

  const confirmDeleteWorkplace = (workplace: Workplace) => {
    if (workplace.isActive) {
      toast.error("Vous ne pouvez pas supprimer le lieu de travail actif");
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${workplace.name}" ? Tous les restaurants associés seront également supprimés.`)) {
      onDeleteWorkplace(workplace.id);
      toast.success(`"${workplace.name}" a été supprimé`);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Lieux de travail</h2>
          <p className="text-xs text-gray-400">Sélectionnez votre bureau pour voir les restaurants à proximité</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {workplaces.map((workplace) => (
          <div 
            key={workplace.id} 
            className={"rounded-2xl border p-4 cursor-pointer transition-all " + (
              workplace.isActive 
                ? "border-orange-200 bg-orange-50/50 shadow-sm ring-1 ring-orange-100" 
                : "border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md"
            )}
            onClick={() => !workplace.isActive && onSelectWorkplace(workplace)}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2.5 min-w-0">
                <div className={"mt-0.5 p-1.5 rounded-lg " + (workplace.isActive ? "bg-orange-100" : "bg-gray-50")}>
                  {workplace.isActive 
                    ? <Check className="h-3.5 w-3.5 text-orange-600" /> 
                    : <MapPin className="h-3.5 w-3.5 text-gray-400" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-gray-800 truncate">{workplace.name}</h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{workplace.address}</p>
                  {workplace.isActive && (
                    <span className="inline-block text-[10px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md mt-2">Lieu actif</span>
                  )}
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" 
                  className="h-7 w-7 rounded-lg text-gray-300 hover:text-gray-600"
                  onClick={(e) => { e.stopPropagation(); openEditDialog(workplace); }}>
                  <Pencil className="h-3 w-3" />
                </Button>
                {!workplace.isActive && (
                  <Button variant="ghost" size="icon" 
                    className="h-7 w-7 rounded-lg text-gray-300 hover:text-red-500"
                    onClick={(e) => { e.stopPropagation(); confirmDeleteWorkplace(workplace); }}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {workplaces.length === 0 && (
          <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 col-span-full">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Ajoutez un lieu de travail pour commencer.</p>
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un lieu de travail</DialogTitle>
            <DialogDescription>Ajoutez un bureau pour organiser vos restaurants.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du lieu</Label>
              <Input id="name" placeholder="Ex: Bureau principal" className="rounded-xl"
                value={newWorkplaceName} onChange={(e) => setNewWorkplaceName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" placeholder="Ex: 15 rue du Commerce, 75015 Paris" className="rounded-xl"
                value={newWorkplaceAddress} onChange={(e) => setNewWorkplaceAddress(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleAddWorkplace} className="rounded-xl bg-orange-500 hover:bg-orange-600">Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le lieu</DialogTitle>
            <DialogDescription>Modifiez les informations du lieu de travail.</DialogDescription>
          </DialogHeader>
          {editingWorkplace && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du lieu</Label>
                <Input id="edit-name" className="rounded-xl" value={editingWorkplace.name}
                  onChange={(e) => setEditingWorkplace({...editingWorkplace, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <Input id="edit-address" className="rounded-xl" value={editingWorkplace.address}
                  onChange={(e) => setEditingWorkplace({...editingWorkplace, address: e.target.value})} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">Annuler</Button>
            <Button onClick={handleEditWorkplace} className="rounded-xl bg-orange-500 hover:bg-orange-600">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkplaceSelector;
