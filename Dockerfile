# Multi-stage build pour LoL Team Scheduler

# Stage 1: Build du frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Installer les dépendances pour better-sqlite3
RUN apk add --no-cache python3 make g++

# Copier le backend
COPY backend/package*.json ./
RUN npm ci --only=production

COPY backend/ ./

# Créer le dossier data pour SQLite
RUN mkdir -p /app/data

# Copier le build du frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3001

# Exposer le port
EXPOSE 3001

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

# Démarrer l'application
CMD ["node", "src/index.js"]
