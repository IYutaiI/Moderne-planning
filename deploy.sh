#!/bin/bash

# ================================================
# Script de déploiement pour LoL Team Scheduler
# VPS OVH / Debian / Ubuntu
# ================================================

set -e

echo "🎮 Déploiement de LoL Team Scheduler..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker non trouvé. Installation...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker installé !${NC}"
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Docker Compose non trouvé. Installation...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker-compose-plugin
    echo -e "${GREEN}Docker Compose installé !${NC}"
fi

# Créer les dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p data
mkdir -p nginx/ssl
mkdir -p certbot/www
mkdir -p certbot/conf

# Arrêter les anciens conteneurs si ils existent
echo "🛑 Arrêt des anciens conteneurs..."
docker compose down 2>/dev/null || true

# Construire et démarrer
echo "🔨 Construction de l'image..."
docker compose build

echo "🚀 Démarrage des conteneurs..."
docker compose up -d

# Vérifier que tout fonctionne
echo "⏳ Attente du démarrage..."
sleep 5

if curl -s http://localhost:3001/api/stats > /dev/null; then
    echo -e "${GREEN}✅ Déploiement réussi !${NC}"
    echo ""
    echo "📍 L'application est accessible sur:"
    echo "   - http://localhost:3001"
    echo "   - http://$(hostname -I | awk '{print $1}'):3001"
    echo ""
    echo "📊 Commandes utiles:"
    echo "   - Voir les logs: docker compose logs -f"
    echo "   - Arrêter: docker compose down"
    echo "   - Redémarrer: docker compose restart"
else
    echo -e "${RED}❌ Erreur lors du déploiement${NC}"
    echo "Vérifiez les logs avec: docker compose logs"
    exit 1
fi

# Instructions pour SSL
echo ""
echo -e "${YELLOW}📜 Pour activer HTTPS avec Let's Encrypt:${NC}"
echo "1. Configurez votre domaine DNS vers l'IP du serveur"
echo "2. Modifiez nginx/nginx.conf avec votre domaine"
echo "3. Exécutez:"
echo "   docker compose --profile with-nginx up -d"
echo "   docker compose run certbot certonly --webroot -w /var/www/certbot -d votre-domaine.com"
