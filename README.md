# 🍴 KekonMange

Application web collaborative pour gérer vos restaurants favoris autour du bureau et laisser le hasard choisir pour vous.

## Fonctionnalités

### Gestion des restaurants
- **Fiches détaillées** — Nom, cuisine, adresse, distance, prix, téléphone, horaires, promotions, photos
- **Recherche OSM** — Autocomplete depuis OpenStreetMap avec cache hebdomadaire
- **Score de complétude** — Indicateur visuel des informations manquantes, filtre "À compléter"
- **Auto-save** — Sauvegarde automatique à chaque modification (debounce 800ms)
- **Vue détaillée** — Clic sur une fiche pour voir toutes les infos, carte OSM et itinéraire piéton
- **Site web & réservation** — Liens directs vers le menu en ligne et la page de réservation

### Machine à restaurant
- **Roulette animée** — Slot machine avec animation CSS fluide
- **Popup enrichi** — Résultat avec toutes les infos : horaires du jour, promos, carte, itinéraire piéton depuis le bureau

### Filtres
- **Filtres avancés** — Cuisine, distance, prix, options (végétarien, halal, à emporter, pimenté...)
- **Filtres favoris** — Sauvegarde de combinaisons personnalisées (localStorage)
- **Filtre "À compléter"** — Pour encourager la complétion des fiches

### Multi-tenant
- **Instances par entreprise** — Code hexadécimal à 6 caractères (ex: `A1B2C3`)
- **Sélecteur d'instance** — Rejoindre, créer ou switcher entre instances
- **Partage simple** — Communiquer le code à ses collègues
- **Auto-purge** — Les instances inactives depuis 6 mois sont automatiquement supprimées (cron trimestriel)

### Collaboration
- **Temps réel** — Données synchronisées entre tous les utilisateurs via SSE (PocketBase)
- **Sans authentification** — Accès ouvert style wiki
- **Multi-bureaux** — Gestion de plusieurs lieux de travail avec restaurants associés

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide icons |
| Backend | PocketBase 0.25 (SQLite, API REST, temps réel SSE) |
| Cartographie | OpenStreetMap (Overpass API, Nominatim, iframe embed) |
| Serveur web | Caddy (reverse proxy + fichiers statiques) |
| Hébergement | LXC Debian 12 sur Proxmox |

## Architecture

```
src/
├── contexts/
│   └── InstanceContext.tsx    # Gestion multi-tenant (instances par entreprise)
├── hooks/
│   └── use-pocketbase.ts     # Hook React pour CRUD + abonnements temps réel
├── services/
│   ├── pocketbase.ts         # Client PocketBase (mapping, CRUD, subscriptions)
│   └── osm.ts                # Intégration OpenStreetMap (geocoding, Overpass, cache)
├── types/
│   └── restaurant.ts         # Types, interfaces, helpers (Restaurant, Workplace, Instance, filtres)
├── pages/
│   └── Index.tsx              # Page principale (filtres, liste, roulette)
├── components/
│   ├── Header.tsx             # En-tête avec nom d'instance et actions
│   ├── InstanceSelector.tsx   # Écran de sélection/création d'instance
│   ├── RestaurantCard.tsx     # Carte restaurant (vue synthétique avec badges)
│   ├── RestaurantViewDialog.tsx # Dialog lecture seule (vue complète + carte OSM)
│   ├── RestaurantEditDialog.tsx # Dialog édition avec auto-save
│   ├── RestaurantForm.tsx     # Formulaire d'ajout avec autocomplete OSM
│   ├── RestaurantList.tsx     # Liste triée des restaurants
│   ├── WheelOfFortune.tsx     # Roulette slot machine
│   ├── FilterPanel.tsx        # Panneau de filtres avancés
│   ├── FavoriteFilters.tsx    # Gestion des filtres favoris
│   ├── WorkplaceSelector.tsx  # Sélecteur de lieu de travail
│   ├── OsmAutocomplete.tsx    # Autocomplete restaurant via OSM
│   ├── OsmMiniMap.tsx         # Mini carte OSM avec itinéraire
│   ├── OpeningHoursBadge.tsx  # Badge horaires d'ouverture
│   ├── OpeningHoursEditor.tsx # Éditeur d'horaires
│   ├── PhotoUploader.tsx      # Upload de photos
│   └── restaurant/
│       ├── BasicInfoFields.tsx # Champs principaux du formulaire
│       └── OptionFields.tsx    # Champs options du formulaire
└── App.tsx                    # Point d'entrée (providers, routing)
```

## Installation

### Prérequis

- Node.js 18+
- PocketBase 0.25+

### Développement local

```bash
git clone git@github.com:dashand/kekonmange.git
cd kekonmange
npm install
npm run dev
```

### Production

```bash
npm run build
# Servir le dossier dist/ avec un serveur web (Caddy, Nginx...)
# Configurer un reverse proxy pour /api/* vers PocketBase (port 8090)
```

### Configuration PocketBase

#### Collections requises

**instances**
- `code` (text, unique) — Code hexa 6 caractères
- `name` (text) — Nom de l'entreprise
- `lastAccessedAt` (date) — Dernière consultation

**workplaces**
- `name` (text), `address` (text), `isActive` (bool)
- `instance` (relation → instances)

**restaurants**
- `name` (text), `foodType` (text), `color` (text)
- `address` (text), `menuInfo` (text), `menuPhotos` (json)
- `takeaway` (bool), `vegetarianOption` (bool), `halalOption` (bool)
- `distance` (number), `priceRange` (text), `spicyLevel` (text)
- `restaurantTickets` (text), `reservationType` (text)
- `phoneOrderAllowed` (bool), `phoneNumber` (text)
- `website` (url), `reservationUrl` (url)
- `promotions` (json), `openingHours` (json), `location` (json)
- `isExample` (bool)
- `workplace` (relation → workplaces)
- `instance` (relation → instances)

**osm_cache**
- `key` (text, unique) — Clé de cache (coordonnées)
- `data` (json) — Résultats Overpass
- `fetchedAt` (date) — Date de récupération (TTL 7 jours)

#### Règles d'accès API

Toutes les collections doivent avoir les règles list, view, create, update et delete ouvertes (chaîne vide) pour permettre l'accès sans authentification.

### Configuration Caddy (exemple)

```
kekonmange.example.com {
    handle /api/* {
        reverse_proxy localhost:8090
    }
    handle {
        root * /opt/kekonmange/dist
        file_server
        try_files {path} /index.html
    }
}
```

### Cron de purge

Un script de purge automatique supprime les instances inactives depuis plus de 6 mois. Il est installé en cron trimestriel :

```bash
# Exécution le 1er jour tous les 3 mois à 3h du matin
0 3 1 */3 * /opt/kekonmange/scripts/purge-instances.sh >> /var/log/purge-instances.log 2>&1
```

## Contribuer

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails.

## Licence

[AGPL-3.0](LICENSE) — KekonMange v1.0 by [slalanne](https://www.linkedin.com/in/slalanne/)
