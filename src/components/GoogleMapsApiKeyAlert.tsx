
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2Icon, InfoIcon } from "lucide-react";

const GoogleMapsApiKeyAlert: React.FC = () => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  // Si API key est disponible, afficher un message de succès
  if (apiKey) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
        <CheckCircle2Icon className="h-4 w-4 mt-0.5 text-green-600" />
        <AlertTitle>Clé API configurée</AlertTitle>
        <AlertDescription>
          <p className="mt-1">
            La clé API Google Maps est configurée. Vous pouvez maintenant utiliser la recherche de restaurants.
          </p>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Si aucune clé API n'est disponible, afficher les instructions originales
  return (
    <Alert className="mb-4">
      <InfoIcon className="h-4 w-4 mt-0.5" />
      <AlertTitle>Configuration requise</AlertTitle>
      <AlertDescription>
        <p className="mt-1">
          Pour utiliser la fonctionnalité de recherche de restaurants, vous devez ajouter une clé API Google Maps. 
          Voici les étapes à suivre :
        </p>
        <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm">
          <li>Créez un projet sur la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console</a></li>
          <li>Activez l'API Places et l'API Maps JavaScript</li>
          <li>Créez une clé API avec les restrictions appropriées</li>
          <li>Ajoutez cette clé dans un fichier <code>.env.local</code> à la racine de votre projet avec la variable <code>GOOGLE_MAPS_API_KEY=votre_clé_api</code></li>
          <li>Redémarrez votre application</li>
        </ol>
      </AlertDescription>
    </Alert>
  );
};

export default GoogleMapsApiKeyAlert;
