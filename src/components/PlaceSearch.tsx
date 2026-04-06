
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, InfoIcon } from 'lucide-react';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import GoogleMapsApiKeyAlert from './GoogleMapsApiKeyAlert';
import { toast } from "sonner";
import { DayOfWeek } from '@/types/restaurant';

// Types pour les résultats de recherche
export interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string; // adresse approximative
  formatted_address?: string; // adresse complète (disponible dans les détails)
  geometry: {
    location: {
      lat: number;
      lng: number;
    }
  };
  types: string[];
  formatted_phone_number?: string;
  international_phone_number?: string;
  opening_hours?: {
    periods?: {
      open: { day: number; time: string; };
      close: { day: number; time: string; };
    }[];
    weekday_text?: string[];
  };
  vegetarian?: boolean;
  takeout?: boolean;
  dine_in?: boolean;
  halal?: boolean;
  price_level?: number; // 0 à 4, correspondant à €, €€, €€€, €€€€
}

interface PlaceSearchProps {
  workplace: {
    address: string;
  } | null;
  onSelectPlace: (place: PlaceResult) => void;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({ workplace, onSelectPlace }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  
  // Charger l'API Google Maps
  useEffect(() => {
    // Vérifie si l'API est déjà chargée
    if (window.google && window.google.maps) {
      console.log("Google Maps API déjà chargée");
      initializeMap();
      return;
    }

    // Fonction pour charger l'API Google Maps
    const loadGoogleMapsApi = () => {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      console.log("Tentative de chargement de l'API avec la clé:", apiKey ? "Clé présente" : "Clé manquante");
    
      if (!apiKey) {
        console.error("Clé API Google Maps manquante");
        setApiKeyMissing(true);
        return;
      }
    
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API chargée avec succès");
        setGoogleMapsLoaded(true);
        initializeMap();
      };
      script.onerror = (e) => {
        console.error("Erreur lors du chargement de l'API Google Maps:", e);
        setError("Impossible de charger l'API Google Maps. Veuillez vérifier votre clé API.");
        setApiKeyMissing(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsApi();
  }, []);

  // Initialiser la carte une fois l'API chargée
  const initializeMap = () => {
    if (!mapContainerRef.current || !window.google) {
      console.error("Map container ou Google API non disponible");
      return;
    }

    try {
      // Créer une carte cachée (nécessaire pour le service Places)
      const mapOptions = {
        center: { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
        zoom: 15,
      };
      mapRef.current = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      
      // Initialiser les services Google Maps
      placesServiceRef.current = new window.google.maps.places.PlacesService(mapRef.current);
      geocoderRef.current = new window.google.maps.Geocoder();
      
      console.log("Map et services initialisés");

      // Si une adresse de lieu de travail est disponible, centrer la carte sur cette adresse
      if (workplace?.address) {
        console.log("Centrage de la carte sur l'adresse du lieu de travail:", workplace.address);
        geocodeWorkplaceAddress();
      }
    } catch (err) {
      console.error("Erreur lors de l'initialisation de la carte:", err);
      setError("Erreur lors de l'initialisation de la carte Google Maps");
    }
  };

  // Géocoder l'adresse du lieu de travail pour obtenir les coordonnées
  const geocodeWorkplaceAddress = () => {
    if (!geocoderRef.current || !workplace?.address) return;

    geocoderRef.current.geocode(
      { address: workplace.address },
      (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          console.log("Adresse géocodée avec succès:", workplace.address, location.toString());
          if (mapRef.current) {
            mapRef.current.setCenter(location);
          }
        } else {
          console.error("Erreur de géocodage:", status);
        }
      }
    );
  };

  // Rechercher des restaurants à proximité
  const searchNearbyRestaurants = () => {
    if (!placesServiceRef.current || !mapRef.current) {
      setError("Le service de recherche n'est pas disponible");
      return;
    }

    setLoading(true);
    setError(null);

    const center = mapRef.current.getCenter();
    if (!center) {
      setError("Impossible de déterminer la position de recherche");
      setLoading(false);
      return;
    }

    console.log("Recherche de restaurants avec la requête:", query);
    console.log("Position de recherche:", center.toString());

    const request: google.maps.places.TextSearchRequest = {
      query: query.trim() ? `${query} restaurant` : "restaurant",
      location: center,
      radius: 5000, // 5km
      type: 'restaurant'
    };

    placesServiceRef.current.textSearch(
      request,
      (results, status) => {
        setLoading(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          console.log("Résultats de la recherche:", results.length, "restaurants trouvés");
          
          // Convertir les résultats Google Maps en notre format
          const formattedResults = results.map(place => ({
            place_id: place.place_id || "",
            name: place.name || "",
            vicinity: place.vicinity || place.formatted_address || "",
            formatted_address: place.formatted_address,
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              }
            },
            types: place.types || [],
          }));
          
          setResults(formattedResults);
          
          if (formattedResults.length === 0) {
            toast.warning("Aucun restaurant trouvé", {
              description: "Essayez de modifier votre recherche ou d'élargir la zone."
            });
          }
        } else {
          console.error("Erreur lors de la recherche de restaurants:", status);
          setError(`Aucun restaurant trouvé (${status}). Veuillez essayer une autre recherche.`);
          setResults([]);
          
          toast.error("Erreur de recherche", {
            description: "Aucun restaurant trouvé. Veuillez essayer une autre recherche."
          });
        }
      }
    );
  };

  // Analyser les horaires d'ouverture de Google Maps en format utilisable
  const parseOpeningHours = (openingHours?: google.maps.places.PlaceOpeningHours) => {
    if (!openingHours || !openingHours.periods) return undefined;
    
    const periods = openingHours.periods;
    
    // Créer un tableau pour stocker nos formats d'heures d'ouverture
    const formattedHours: {
      periods?: {
        open: { day: number; time: string; };
        close: { day: number; time: string; };
      }[];
      weekday_text?: string[];
    } = {};
    
    formattedHours.periods = periods.map(period => ({
      open: {
        day: period.open.day,
        time: period.open.time
      },
      close: period.close ? {
        day: period.close.day,
        time: period.close.time
      } : {
        day: period.open.day,
        time: '2359' // Fin de journée par défaut si pas de fermeture spécifiée
      }
    }));
    
    formattedHours.weekday_text = openingHours.weekday_text;
    
    return formattedHours;
  };

  // Obtenir les détails d'un lieu sélectionné
  const getPlaceDetails = (placeId: string) => {
    if (!placesServiceRef.current) {
      setError("Le service de détails n'est pas disponible");
      return;
    }

    // Champs supplémentaires pour obtenir plus d'informations
    const request = {
      placeId: placeId,
      fields: [
        'name', 
        'formatted_address', 
        'formatted_phone_number', 
        'international_phone_number', 
        'geometry', 
        'types',
        'opening_hours',
        'price_level'
      ]
    };

    placesServiceRef.current.getDetails(
      request,
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          console.log("Détails du lieu récupérés:", place);
          
          // Trouver le résultat correspondant
          const resultWithDetails = results.find(r => r.place_id === placeId);
          if (resultWithDetails) {
            // Détecter les services spéciaux à partir des types
            const vegetarian = place.types?.includes('vegetarian') || false;
            const takeout = place.types?.includes('meal_takeaway') || place.types?.includes('takeout') || false;
            const dine_in = place.types?.includes('meal_delivery') || place.types?.includes('restaurant') || false;
            const halal = place.types?.includes('halal') || false;
            
            // Convertir les heures d'ouverture
            const opening_hours = parseOpeningHours(place.opening_hours);
            
            // Créer un résultat détaillé avec toutes les informations
            const updatedResult: PlaceResult = {
              ...resultWithDetails,
              formatted_address: place.formatted_address || resultWithDetails.vicinity,
              formatted_phone_number: place.formatted_phone_number,
              international_phone_number: place.international_phone_number,
              opening_hours: opening_hours,
              vegetarian: vegetarian,
              takeout: takeout,
              dine_in: dine_in,
              halal: halal,
              price_level: place.price_level
            };
            
            console.log("Résultat enrichi:", updatedResult);
            onSelectPlace(updatedResult);
          }
        } else {
          console.error("Impossible d'obtenir les détails du restaurant:", status);
          setError("Impossible d'obtenir les détails du restaurant");
        }
      }
    );
  };

  // Sélectionner un restaurant et récupérer ses détails
  const handleSelectPlace = async (place: PlaceResult) => {
    // Récupérer les détails du lieu
    getPlaceDetails(place.place_id);
  };

  if (apiKeyMissing) {
    return <GoogleMapsApiKeyAlert />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un restaurant..."
          className="flex-1"
        />
        <Button onClick={searchNearbyRestaurants} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Rechercher
        </Button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {results.length > 0 && (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {results.map((place) => (
            <Card 
              key={place.place_id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleSelectPlace(place)}
            >
              <CardContent className="p-3">
                <div className="font-medium">{place.name}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {place.vicinity}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Div caché pour initialiser le service Places */}
      <div 
        ref={mapContainerRef} 
        style={{ display: 'none', height: '200px', width: '200px' }}
        aria-hidden="true"
      />
    </div>
  );
};

export default PlaceSearch;
