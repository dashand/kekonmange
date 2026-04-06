
import { Restaurant, Workplace, ExportData, EXPORT_VERSION } from "@/types/restaurant";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

/**
 * Génère un fichier d'export contenant les restaurants et lieux de travail
 */
export const exportData = (
  workplaces: Workplace[],
  restaurants: Restaurant[],
  filename = "restaurants-export.json"
): void => {
  try {
    const exportData: ExportData = {
      version: EXPORT_VERSION,
      date: new Date().toISOString(),
      workplaces,
      restaurants,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Données exportées avec succès");
  } catch (error) {
    console.error("Erreur lors de l'export des données:", error);
    toast.error("Erreur lors de l'export des données");
  }
};

/**
 * Vérifie si deux restaurants sont potentiellement des doublons
 * basé sur le nom et l'adresse (si disponible)
 */
const isDuplicateRestaurant = (resto1: Restaurant, resto2: Restaurant): boolean => {
  // Vérification du nom (insensible à la casse)
  const sameName = resto1.name.toLowerCase() === resto2.name.toLowerCase();
  
  // Si les deux restaurants ont une adresse, on compare aussi l'adresse
  if (resto1.address && resto2.address) {
    return sameName && resto1.address.toLowerCase() === resto2.address.toLowerCase();
  }
  
  // Si au moins un des restaurants n'a pas d'adresse, on se base uniquement sur le nom
  return sameName;
};

/**
 * Vérifie si deux lieux de travail sont potentiellement des doublons
 * basé sur le nom et l'adresse
 */
const isDuplicateWorkplace = (wp1: Workplace, wp2: Workplace): boolean => {
  const sameName = wp1.name.toLowerCase() === wp2.name.toLowerCase();
  const sameAddress = wp1.address.toLowerCase() === wp2.address.toLowerCase();
  
  // On considère comme doublon si le nom ET l'adresse sont identiques
  return sameName && sameAddress;
};

/**
 * Fusionne des données importées avec les données existantes
 * en évitant les doublons
 */
const mergeData = (
  existingWorkplaces: Workplace[],
  existingRestaurants: Restaurant[],
  importedWorkplaces: Workplace[],
  importedRestaurants: Restaurant[]
): { workplaces: Workplace[]; restaurants: Restaurant[]; stats: { added: { workplaces: number; restaurants: number }, skipped: { workplaces: number; restaurants: number } } } => {
  // Statistiques pour le rapport
  const stats = {
    added: { workplaces: 0, restaurants: 0 },
    skipped: { workplaces: 0, restaurants: 0 }
  };
  
  // Nouvelle liste de lieux de travail
  const newWorkplaces: Workplace[] = [...existingWorkplaces];
  
  // Map pour associer les anciens IDs aux nouveaux
  const workplaceIdMap = new Map<string, string>();
  
  // Traiter chaque lieu de travail importé
  for (const importedWp of importedWorkplaces) {
    // Vérifier s'il existe déjà un lieu de travail similaire
    const duplicate = existingWorkplaces.find(wp => isDuplicateWorkplace(wp, importedWp));
    
    if (duplicate) {
      // Si un doublon est trouvé, on garde le lieu existant mais on mémorise la correspondance d'ID
      workplaceIdMap.set(importedWp.id, duplicate.id);
      stats.skipped.workplaces++;
    } else {
      // Sinon, on ajoute le nouveau lieu avec un nouvel ID
      const newId = uuidv4();
      workplaceIdMap.set(importedWp.id, newId);
      
      newWorkplaces.push({
        ...importedWp,
        id: newId,
        isActive: false // On désactive tous les lieux de travail importés par défaut
      });
      
      stats.added.workplaces++;
    }
  }
  
  // Nouvelle liste de restaurants
  const newRestaurants: Restaurant[] = [...existingRestaurants];
  
  // Traiter chaque restaurant importé
  for (const importedResto of importedRestaurants) {
    // Ajuster la référence au lieu de travail avec la nouvelle ID
    const updatedResto = {
      ...importedResto,
      id: uuidv4(),
      workplaceId: workplaceIdMap.get(importedResto.workplaceId) || importedResto.workplaceId
    };
    
    // Vérifier s'il existe déjà un restaurant similaire
    const duplicate = existingRestaurants.find(resto => isDuplicateRestaurant(resto, updatedResto));
    
    if (duplicate) {
      stats.skipped.restaurants++;
    } else {
      newRestaurants.push(updatedResto);
      stats.added.restaurants++;
    }
  }
  
  return { 
    workplaces: newWorkplaces, 
    restaurants: newRestaurants,
    stats
  };
};

/**
 * Importe des données depuis un fichier JSON
 */
export const importData = (
  file: File,
  onSuccess: (data: { workplaces: Workplace[]; restaurants: Restaurant[] }) => void,
  existingWorkplaces: Workplace[] = [],
  existingRestaurants: Restaurant[] = []
): void => {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      if (!event.target?.result) {
        throw new Error("Impossible de lire le fichier");
      }
      
      const importedData = JSON.parse(event.target.result as string) as ExportData;
      
      // Vérification de la version
      if (!importedData.version || !importedData.workplaces || !importedData.restaurants) {
        throw new Error("Format de fichier invalide");
      }
      
      const hasMergeableData = existingWorkplaces.length > 0 || existingRestaurants.length > 0;
      
      if (hasMergeableData) {
        // Mode fusion
        const { workplaces, restaurants, stats } = mergeData(
          existingWorkplaces,
          existingRestaurants,
          importedData.workplaces,
          importedData.restaurants
        );
        
        onSuccess({ workplaces, restaurants });
        
        // Message de succès avec statistiques
        toast.success(
          `Données fusionnées avec succès: ${stats.added.workplaces} lieu(x) ajouté(s), ${stats.added.restaurants} restaurant(s) ajouté(s), ${stats.skipped.workplaces + stats.skipped.restaurants} élément(s) ignoré(s) (doublons)`
        );
      } else {
        // Mode import simple (comme avant)
        const workplaces = importedData.workplaces.map(wp => ({
          ...wp,
          id: uuidv4(),
          isActive: false
        }));
        
        const workplaceMap = new Map<string, string>();
        importedData.workplaces.forEach((wp, index) => {
          workplaceMap.set(wp.id, workplaces[index].id);
        });
        
        const restaurants = importedData.restaurants.map(resto => ({
          ...resto,
          id: uuidv4(),
          workplaceId: workplaceMap.get(resto.workplaceId) || resto.workplaceId
        }));
        
        onSuccess({ workplaces, restaurants });
        toast.success(`Données importées avec succès: ${workplaces.length} lieu(x) de travail et ${restaurants.length} restaurant(s)`);
      }
    } catch (error) {
      console.error("Erreur lors de l'import des données:", error);
      toast.error("Erreur lors de l'import: format de fichier invalide");
    }
  };
  
  reader.onerror = () => {
    toast.error("Erreur lors de la lecture du fichier");
  };
  
  reader.readAsText(file);
};

/**
 * Importe des données depuis une URL pointant vers un fichier JSON
 */
export const importDataFromUrl = async (
  url: string,
  onSuccess: (data: { workplaces: Workplace[]; restaurants: Restaurant[] }) => void,
  existingWorkplaces: Workplace[] = [],
  existingRestaurants: Restaurant[] = []
): Promise<void> => {
  try {
    // Vérifier si l'URL est valide
    if (!url || !url.trim()) {
      toast.error("Veuillez saisir une URL valide");
      return;
    }

    // Afficher un toast pour indiquer que l'importation est en cours
    toast.loading("Importation en cours...");

    // Récupérer le fichier à partir de l'URL
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const importedData = await response.json() as ExportData;
    
    // Vérification de la version
    if (!importedData.version || !importedData.workplaces || !importedData.restaurants) {
      throw new Error("Format de fichier invalide");
    }
    
    const hasMergeableData = existingWorkplaces.length > 0 || existingRestaurants.length > 0;
    
    if (hasMergeableData) {
      // Mode fusion
      const { workplaces, restaurants, stats } = mergeData(
        existingWorkplaces,
        existingRestaurants,
        importedData.workplaces,
        importedData.restaurants
      );
      
      onSuccess({ workplaces, restaurants });
      
      // Message de succès avec statistiques
      toast.dismiss();
      toast.success(
        `Données fusionnées avec succès: ${stats.added.workplaces} lieu(x) ajouté(s), ${stats.added.restaurants} restaurant(s) ajouté(s), ${stats.skipped.workplaces + stats.skipped.restaurants} élément(s) ignoré(s) (doublons)`
      );
    } else {
      // Mode import simple
      const workplaces = importedData.workplaces.map(wp => ({
        ...wp,
        id: uuidv4(),
        isActive: false
      }));
      
      const workplaceMap = new Map<string, string>();
      importedData.workplaces.forEach((wp, index) => {
        workplaceMap.set(wp.id, workplaces[index].id);
      });
      
      const restaurants = importedData.restaurants.map(resto => ({
        ...resto,
        id: uuidv4(),
        workplaceId: workplaceMap.get(resto.workplaceId) || resto.workplaceId
      }));
      
      onSuccess({ workplaces, restaurants });
      toast.dismiss();
      toast.success(`Données importées avec succès depuis l'URL: ${workplaces.length} lieu(x) de travail et ${restaurants.length} restaurant(s)`);
    }
  } catch (error) {
    console.error("Erreur lors de l'import des données depuis URL:", error);
    toast.dismiss();
    toast.error("Erreur lors de l'import depuis l'URL: format de fichier invalide ou URL inaccessible");
  }
};
