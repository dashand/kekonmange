
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, X, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ 
  photos = [], 
  onChange, 
  maxPhotos = 3 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Vérifier si on ne dépasse pas le nombre max de photos
    if (photos.length + files.length > maxPhotos) {
      toast.error(`Vous ne pouvez pas ajouter plus de ${maxPhotos} photos`);
      return;
    }

    setIsUploading(true);
    
    try {
      const newPhotos = [...photos];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Vérifier le type et la taille du fichier
        if (!file.type.startsWith("image/")) {
          toast.error(`Le fichier "${file.name}" n'est pas une image valide`);
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB max
          toast.error(`L'image "${file.name}" est trop volumineuse (max 5MB)`);
          continue;
        }
        
        // Convertir en base64
        const base64 = await convertToBase64(file);
        newPhotos.push(base64 as string);
      }
      
      onChange(newPhotos);
    } catch (error) {
      toast.error("Erreur lors du téléchargement de l'image");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      // Réinitialiser le champ de fichier
      e.target.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="relative group w-24 h-24 rounded-md overflow-hidden border"
          >
            <img 
              src={photo} 
              alt={`Menu ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemovePhoto(index)}
              className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label className="w-24 h-24 flex flex-col items-center justify-center gap-1 border border-dashed rounded-md bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
              multiple
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Ajouter
            </span>
          </label>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {photos.length} / {maxPhotos} photos (max 5MB par image)
      </p>
    </div>
  );
};

export default PhotoUploader;
