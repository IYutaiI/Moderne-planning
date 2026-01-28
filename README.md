# LoL Team Scheduler

Application de planning moderne pour equipe League of Legends.

## Fonctionnalites

- **Dashboard** : Vue d'ensemble de l'equipe et des evenements
- **Gestion des membres** : Ajout/modification des joueurs avec role, rang, champions
- **Planning hebdomadaire** : Visualisation des evenements et disponibilites
- **Evenements** : Creation d'entrainements, matchs, tournois, reviews
- **Disponibilites** : Gestion des creneaux de chaque membre

## Stack technique

- **Frontend** : React 18, Vite, TailwindCSS, Lucide Icons
- **Backend** : Node.js, Express, SQLite (better-sqlite3)
- **Deploiement** : Docker, Docker Compose, Nginx

## Installation locale

```bash
# Cloner le repo
git clone <repo-url>
cd Moderne-planning

# Installer les dependances
npm run install:all

# Lancer en developpement
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:5173
- API : http://localhost:3001

## Deploiement sur VPS OVH

### Prerequis
- VPS avec Debian/Ubuntu
- Docker et Docker Compose

### Deploiement rapide

```bash
# Sur le VPS
git clone <repo-url>
cd Moderne-planning
chmod +x deploy.sh
./deploy.sh
```

### Deploiement manuel

```bash
# Construire et lancer
docker compose build
docker compose up -d

# Voir les logs
docker compose logs -f

# Arreter
docker compose down
```

### Configuration HTTPS (optionnel)

1. Configurer le DNS de votre domaine vers l'IP du VPS
2. Modifier `nginx/nginx.conf` avec votre domaine
3. Lancer avec Nginx :

```bash
docker compose --profile with-nginx up -d
docker compose run certbot certonly --webroot -w /var/www/certbot -d votre-domaine.com
```

## Structure du projet

```
Moderne-planning/
|-- backend/
|   |-- src/
|   |   +-- index.js      # API Express
|   |-- data/             # Base SQLite
|   +-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/   # Composants React
|   |   |-- pages/        # Pages de l'app
|   |   |-- App.jsx
|   |   +-- main.jsx
|   |-- public/
|   +-- package.json
|-- nginx/
|   +-- nginx.conf        # Config Nginx
|-- Dockerfile
|-- docker-compose.yml
|-- deploy.sh
+-- README.md
```

## API Endpoints

### Membres
- `GET /api/members` - Liste des membres
- `GET /api/members/:id` - Detail d'un membre
- `POST /api/members` - Creer un membre
- `PUT /api/members/:id` - Modifier un membre
- `DELETE /api/members/:id` - Supprimer un membre

### Disponibilites
- `GET /api/members/:id/availabilities` - Disponibilites d'un membre
- `POST /api/members/:id/availabilities` - Ajouter une disponibilite
- `DELETE /api/availabilities/:id` - Supprimer une disponibilite
- `GET /api/availabilities/team` - Vue equipe

### Evenements
- `GET /api/events` - Liste des evenements
- `GET /api/events/:id` - Detail d'un evenement
- `POST /api/events` - Creer un evenement
- `PUT /api/events/:id` - Modifier un evenement
- `DELETE /api/events/:id` - Supprimer un evenement

### Stats
- `GET /api/stats` - Statistiques dashboard
