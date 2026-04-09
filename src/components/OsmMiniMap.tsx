import React from "react";
import { ExternalLink, Navigation } from "lucide-react";

interface OsmMiniMapProps {
  lat: number;
  lon: number;
  name?: string;
  fromAddress?: string;
  className?: string;
}

const OsmMiniMap: React.FC<OsmMiniMapProps> = ({ lat, lon, name, fromAddress, className = "" }) => {
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
  const directionsUrl = fromAddress
    ? `https://www.openstreetmap.org/directions?from=${encodeURIComponent(fromAddress)}&to=${lat},${lon}&engine=fossgis_osrm_foot`
    : `https://www.openstreetmap.org/directions?to=${lat},${lon}&engine=fossgis_osrm_foot`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.003},${lat - 0.002},${lon + 0.003},${lat + 0.002}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className={`rounded-xl overflow-hidden border border-gray-100 ${className}`}>
      <iframe
        src={embedUrl}
        className="w-full h-[130px] border-0"
        loading="lazy"
        title={name ? `Carte de ${name}` : "Carte"}
      />
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
