
import React, { useRef, useState } from "react";
import { Restaurant, Workplace } from "@/types/restaurant";
import { exportData, importData, importDataFromUrl } from "@/utils/dataTransfer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, Link } from "lucide-react";
import { toast } from "sonner";

interface DataTransferPanelProps {
  workplaces: Workplace[];
  restaurants: Restaurant[];
  onImport: (data: { workplaces: Workplace[]; restaurants: Restaurant[] }) => void;
  asDialog?: boolean; // Prop to indicate if it's shown in a dialog
}

const DataTransferPanel: React.FC<DataTransferPanelProps> = ({
  workplaces,
  restaurants,
  onImport,
  asDialog = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState<string>("");
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  const handleExport = () => {
    exportData(workplaces, restaurants);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      importData(files[0], onImport);
      // Réinitialiser l'input pour permettre de réimporter le même fichier
      event.target.value = "";
    }
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const handleImportFromUrl = async () => {
    if (urlInput.trim()) {
      await importDataFromUrl(urlInput, onImport);
      setUrlInput("");
      setShowUrlInput(false);
    } else {
      toast.error("Veuillez saisir une URL valide");
    }
  };

  const toggleUrlInput = () => {
    setShowUrlInput(!showUrlInput);
  };

  // Contenu commun pour les deux modes d'affichage
  const panelContent = (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <Button 
          onClick={handleExport} 
          variant="outline" 
          className="flex items-center justify-center gap-2 w-full"
        >
          <Download className="h-4 w-4" />
          Exporter mes données
        </Button>
        
        <Button 
          onClick={handleImportClick} 
          variant="outline" 
          className="flex items-center justify-center gap-2 w-full"
        >
          <Upload className="h-4 w-4" />
          Importer depuis un fichier
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </Button>
        
        <Button 
          onClick={toggleUrlInput} 
          variant="outline" 
          className="flex items-center justify-center gap-2 w-full"
        >
          <Link className="h-4 w-4" />
          Importer depuis une URL
        </Button>
        
        {showUrlInput && (
          <div className="space-y-2 p-2 border rounded-md bg-muted/20">
            <Label htmlFor="urlInput">URL du fichier JSON</Label>
            <div className="flex gap-2">
              <Input
                id="urlInput"
                value={urlInput}
                onChange={handleUrlInputChange}
                placeholder="https://example.com/data.json"
                className="flex-1"
              />
              <Button onClick={handleImportFromUrl} size="sm">
                Importer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If used in a dialog, don't wrap in a Card
  if (asDialog) {
    return panelContent;
  }

  // Default card view for non-dialog usage
  return (
    <Card>
      <CardHeader>
        <CardTitle>Partage de données</CardTitle>
        <CardDescription>
          Exportez vos données pour les sauvegarder ou les partager, et importez celles d'autres utilisateurs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {panelContent}
      </CardContent>
    </Card>
  );
};

export default DataTransferPanel;
