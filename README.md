# 🍴 KekonMange

Application web collaborative pour gérer vos restaurants favoris autour du bureau et laisser le hasard choisir pour vous.

## Fonctionnalités

- **Machine à restaurant** — Roulette aléatoire parmi vos restaurants filtrés
- **Fiches restaurant** — Nom, cuisine, distance, prix, horaires, promotions, photos
- **Score de complétude** — Indicateur visuel des informations manquantes
- **Filtres avancés** — Par type de cuisine, distance, prix, options (végétarien, halal, à emporter...)
- **Filtres favoris** — Sauvegarde de combinaisons de filtres personnalisées (localStorage)
- **Lieux de travail** — Gestion de plusieurs bureaux avec restaurants associés
- **Collaboratif** — Données partagées en temps réel entre tous les utilisateurs (PocketBase)
- **Pas d'authentification** — Style wiki, ouvert à tous

## Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | PocketBase 0.25 (SQLite, API REST, temps réel SSE) |
| Serveur web | Caddy (reverse proxy + fichiers statiques) |
| Hébergement | LXC Debian 12 sur Proxmox |

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
# Servir le dossier dist/ avec un serveur web
# Configurer PocketBase sur /api/*
```

### Collections PocketBase

L'application nécessite deux collections :

**workplaces**
- `name` (text)
- `address` (text)
- `isActive` (bool)

**restaurants**
- `name` (text), `foodType` (text), `color` (text)
- `address` (text), `menuInfo` (text), `menuPhotos` (json)
- `takeaway` (bool), `vegetarianOption` (bool), `halalOption` (bool)
- `distance` (number), `priceRange` (text), `spicyLevel` (text)
- `restaurantTickets` (text), `reservationType` (text)
- `phoneOrderAllowed` (bool), `phoneNumber` (text)
- `promotions` (json), `openingHours` (json), `location` (json)
- `workplace` (relation vers workplaces)

Les deux collections doivent avoir les règles d'accès API ouvertes (list, view, create, update, delete).

## Licence

[MIT](LICENSE)
