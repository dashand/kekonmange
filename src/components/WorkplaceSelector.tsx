
import React, { useState } from "react";
import { Workplace } from "@/types/restaurant";
import { v4 as uuidv4 } from "uuid";
import { Building, Plus, Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  workplaces,
  onAddWorkplace,
  onSelectWorkplace,
  onEditWorkplace,
  onDeleteWorkplace,
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
      id: uuidv4(),
      name: newWorkplaceName.trim(),
      address: newWorkplaceAddress.trim(),
      isActive: workplaces.length === 0, // Le premier lieu est actif par défaut
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
        <h2 className="text-xl font-semibold">Lieux de travail</h2>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {workplaces.map((workplace) => (
          <Card 
            key={workplace.id} 
            className={`cursor-pointer hover:shadow-md transition-all ${workplace.isActive ? "border-primary" : "border-border"}`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-start">
                <span className="flex items-center gap-2">
                  {workplace.isActive && <Check className="h-4 w-4 text-primary" />}
                  {workplace.name}
                </span>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                    onClick={() => openEditDialog(workplace)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {!workplace.isActive && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => confirmDeleteWorkplace(workplace)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                <Building className="h-3.5 w-3.5" />
                {workplace.address}
              </p>
              {!workplace.isActive && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => onSelectWorkplace(workplace)}
                >
                  Sélectionner
                </Button>
              )}
              {workplace.isActive && (
                <p className="text-xs text-primary font-medium mt-2">Lieu de travail actif</p>
              )}
            </CardContent>
          </Card>
        ))}

        {workplaces.length === 0 && (
          <div className="text-center py-6 border border-dashed rounded-lg bg-card col-span-full">
            <p className="text-muted-foreground">
              Aucun lieu de travail enregistré. Ajoutez-en un pour commencer.
            </p>
          </div>
        )}
      </div>

      {/* Dialog d'ajout de lieu de travail */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un lieu de travail</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau lieu de travail pour organiser vos restaurants.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du lieu</Label>
              <Input
                id="name"
                placeholder="Ex: Bureau principal"
                value={newWorkplaceName}
                onChange={(e) => setNewWorkplaceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse complète</Label>
              <Input
                id="address"
                placeholder="Ex: 15 rue du Commerce, 75015 Paris"
                value={newWorkplaceAddress}
                onChange={(e) => setNewWorkplaceAddress(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddWorkplace}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification de lieu de travail */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le lieu de travail</DialogTitle>
            <DialogDescription>
              Modifiez les informations du lieu de travail.
            </DialogDescription>
          </DialogHeader>

          {editingWorkplace && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nom du lieu</Label>
                <Input
                  id="edit-name"
                  placeholder="Ex: Bureau principal"
                  value={editingWorkplace.name}
                  onChange={(e) => setEditingWorkplace({...editingWorkplace, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse complète</Label>
                <Input
                  id="edit-address"
                  placeholder="Ex: 15 rue du Commerce, 75015 Paris"
                  value={editingWorkplace.address}
                  onChange={(e) => setEditingWorkplace({...editingWorkplace, address: e.target.value})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditWorkplace}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkplaceSelector;
