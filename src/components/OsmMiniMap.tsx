import React from "react";
import { ExternalLink, Navigation } from "lucide-react";

interface OsmMiniMapProps {
  lat: number;
  lon: number;
  name?: string;
  className?: string;
}

const OsmMiniMap: React.FC<OsmMiniMapProps> = ({ lat, lon, name, className = "" }) => {
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
  const directionsUrl = `https://www.openstreetmap.org/directions?to=${lat},${lon}`;

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-100 ${className}`}>
      <a href={osmUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={`https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=17&size=400x150&markers=${lat},${lon},ol-marker`}
          alt={name ? `Carte de ${name}` : "Carte"}
          className="w-full h-[120px] object-cover hover:opacity-90 transition-opacity"
          loading="lazy"
        />
      </a>
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50">
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Voir sur OSM
        </a>
        <span className="text-gray-200 mx-1">·</span>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-orange-500 transition-colors"
        >
          <Navigation className="h-3 w-3" />
          Itinéraire
        </a>
      </div>
    </div>
  );
};

export default OsmMiniMap;
