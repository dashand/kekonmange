import React, { useState, useEffect, useRef } from "react";
import { OsmRestaurant, getOsmRestaurants, searchOsmRestaurants } from "@/services/osm";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface OsmAutocompleteProps {
  workplaceId: string;
  workplaceAddress: string;
  onSelect: (restaurant: OsmRestaurant) => void;
}

// In-memory cache to avoid refetching on every dialog open
const memoryCache: Record<string, { restaurants: OsmRestaurant[]; cacheDate: string }> = {};

const OsmAutocomplete: React.FC<OsmAutocompleteProps> = ({ workplaceId, workplaceAddress, onSelect }) => {
  const [query, setQuery] = useState("");
  const [osmData, setOsmData] = useState<OsmRestaurant[]>([]);
  const [results, setResults] = useState<OsmRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [cacheDate, setCacheDate] = useState<string | undefined>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load OSM data on mount (use memory cache first)
  useEffect(() => {
    if (!workplaceId || !workplaceAddress) return;
    if (memoryCache[workplaceId]) {
      setOsmData(memoryCache[workplaceId].restaurants);
      setCacheDate(memoryCache[workplaceId].cacheDate);
      setFromCache(true);
      return;
    }
    loadOsmData();
  }, [workplaceId, workplaceAddress]);

  const loadOsmData = async () => {
    setLoading(true);
    try {
      const { restaurants, fromCache: cached, cacheDate: date } = await getOsmRestaurants(
        workplaceId, workplaceAddress
      );
      setOsmData(restaurants);
      setFromCache(cached);
      setCacheDate(date);
      memoryCache[workplaceId] = { restaurants, cacheDate: date || "" };
      if (!cached) {
        toast.success(`${restaurants.length} restaurants trouvés autour de votre bureau`);
      }
    } catch (err: any) {
      console.error("OSM fetch error:", err);
      toast.error("Impossible de charger les restaurants à proximité");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    delete memoryCache[workplaceId];
    loadOsmData();
  };

  // Search within loaded data
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setResults(searchOsmRestaurants(osmData, query));
  }, [query, osmData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (r: OsmRestaurant) => {
    onSelect(r);
    setQuery(r.name);
    setIsOpen(false);
  };

  const formatCacheDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={loading ? "Chargement des restaurants..." : "Rechercher un restaurant à proximité..."}
          className="pl-10 pr-10"
          disabled={loading}
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-orange-500" />}
      </div>

      {osmData.length > 0 && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Database className="h-3 w-3" />
            {osmData.length} restaurants · données du {formatCacheDate(cacheDate)}
            {fromCache && " (cache)"}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            className="text-[10px] text-orange-500 hover:text-orange-600 flex items-center gap-0.5"
          >
            <RefreshCw className="h-3 w-3" /> Actualiser
          </button>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.osmId}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{r.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {r.cuisine && <span className="text-xs text-gray-500">{r.cuisine}</span>}
                    {r.address && (
                      <span className="text-xs text-gray-400 flex items-center gap-0.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />{r.address}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 ml-2 shrink-0">{r.distance}m</span>
              </div>
              <div className="flex gap-1.5 mt-1">
                {r.phone && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Tél</span>}
                {r.openingHours && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Horaires</span>}
                {r.vegetarian && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">Végé</span>}
                {r.halal && <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded">Halal</span>}
                {r.takeaway && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Emporter</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && osmData.length > 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
          <p className="text-sm text-gray-400">Aucun restaurant trouvé pour "{query}"</p>
          <p className="text-xs text-gray-300 mt-1">Vous pouvez le saisir manuellement</p>
        </div>
      )}
    </div>
  );
};

export default OsmAutocomplete;
