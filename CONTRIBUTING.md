# Contribuer à KekonMange

Merci de votre intérêt pour KekonMange ! Ce guide vous aidera à comprendre le fonctionnement du code et à contribuer efficacement.

## Démarrage rapide

```bash
git clone git@github.com:dashand/kekonmange.git
cd kekonmange
npm install
npm run dev
```

Le serveur de développement démarre sur `http://localhost:5173`. Assurez-vous d'avoir PocketBase qui tourne sur le port 8090.

## Architecture du code

### Flux de données

```
InstanceContext (multi-tenant)
  └── usePocketBase(instanceId)
        ├── getWorkplaces(instanceId) ──→ PocketBase API
        ├── getRestaurants(instanceId) ──→ PocketBase API
        └── subscriptions SSE ──→ mise à jour temps réel
```

1. **InstanceContext** gère l'instance active (entreprise). Le code et l'instance active sont stockés en `localStorage`.
2. **usePocketBase** est le hook central. Il charge les données filtrées par instance, gère les mutations (ajout, modification, suppression) et s'abonne aux mises à jour temps réel via SSE.
3. **Les composants** reçoivent les données via props depuis `Index.tsx`.

### Conventions

- **Pas d'authentification** : l'app est ouverte, style wiki. Toute la sécurité repose sur la connaissance du code d'instance.
- **Auto-save** : le dialog d'édition sauvegarde automatiquement avec un debounce de 800ms. Pas de bouton "Enregistrer".
- **Temps réel** : les mutations (ajout, modification) ne mettent pas à jour le state local manuellement — c'est l'abonnement SSE qui gère pour éviter les doublons.
- **Cache OSM** : les résultats Overpass sont mis en cache 7 jours côté PocketBase (collection `osm_cache`) et en mémoire côté client pour éviter les refetch à chaque ouverture de dialog.

### Fichiers clés à connaître

| Fichier | Rôle |
|---------|------|
| `src/contexts/InstanceContext.tsx` | Gestion du multi-tenant. Créer/rejoindre/switcher les instances. |
| `src/hooks/use-pocketbase.ts` | Hook principal : CRUD + abonnements temps réel, filtré par instance. |
| `src/services/pocketbase.ts` | Client PocketBase : mapping entre les records PB et les types TypeScript. |
| `src/services/osm.ts` | Intégration OpenStreetMap : geocoding (Nominatim), recherche restaurants (Overpass), cache. |
| `src/types/restaurant.ts` | Tous les types, interfaces et helpers (filtres, complétude, horaires...). |
| `src/pages/Index.tsx` | Page principale : orchestre filtres, liste, roulette, dialogs. |
| `src/components/RestaurantCard.tsx` | Carte synthétique d'un restaurant avec badges colorés. |
| `src/components/WheelOfFortune.tsx` | Roulette slot machine : animation CSS pure via ref DOM (pas de setState pendant l'animation). |

### Ajouter un champ à un restaurant

1. Ajouter le champ dans l'interface `Restaurant` (`src/types/restaurant.ts`)
2. Ajouter le mapping dans `mapRecordToRestaurant()` (`src/services/pocketbase.ts`)
3. Ajouter le champ dans le formulaire (`src/components/restaurant/BasicInfoFields.tsx` ou `OptionFields.tsx`)
4. Ajouter le champ au schéma zod dans `RestaurantEditDialog.tsx` et `RestaurantForm.tsx`
5. Ajouter le champ dans la collection PocketBase (via l'admin UI ou l'API)
6. Optionnel : afficher dans `RestaurantCard.tsx`, `RestaurantViewDialog.tsx`, `WheelOfFortune.tsx`

### Ajouter un filtre

1. Ajouter le champ dans `FilterOptions` (`src/types/restaurant.ts`)
2. Ajouter la valeur par défaut dans `defaultFilters`
3. Ajouter la logique de filtrage dans `filteredRestaurants` (`src/pages/Index.tsx`)
4. Ajouter le contrôle UI dans `FilterPanel.tsx`

### Points d'attention

- **Slot machine** : l'animation utilise `useMemo` pour un reel stable et des manipulations DOM directes via `ref`. Ne pas utiliser `setState` pendant l'animation sinon React re-rend et l'animation disparaît.
- **Doublons** : ne jamais ajouter manuellement au state après une mutation PocketBase. L'abonnement SSE s'en charge.
- **OSM** : respecter les limites d'usage de Nominatim et Overpass (pas plus d'1 requête/seconde). Le cache hebdomadaire est là pour ça.
- **Instance** : tous les workplaces et restaurants doivent avoir un champ `instance` renseigné, sinon ils n'apparaîtront dans aucune instance.

## Proposer un changement

1. Fork le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Commit avec un message clair
4. Push et créer une Pull Request

## Licence

En contribuant, vous acceptez que vos contributions soient sous licence [AGPL-3.0](LICENSE).
