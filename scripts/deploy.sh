#!/bin/bash
set -e

PROD_HOST="prod"
PROD_DIR="/opt/kekonmange"

echo "[1/4] Vérification de l'état git local..."
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "ERREUR : des modifications non committées sont présentes. Commitez ou stashez avant de déployer."
    exit 1
fi

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
if [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
    echo "ERREUR : la branche locale n'est pas synchronisée avec origin. Faites git push avant de déployer."
    exit 1
fi

COMMIT=$(git rev-parse --short HEAD)
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "    Commit : $COMMIT (branche $BRANCH)"

echo "[2/4] Connexion à la prod ($PROD_HOST)..."
ssh "$PROD_HOST" "cd $PROD_DIR && git fetch origin"

PROD_COMMIT=$(ssh "$PROD_HOST" "cd $PROD_DIR && git rev-parse HEAD")
if [ "$LOCAL" = "$PROD_COMMIT" ]; then
    echo "    La prod est déjà à jour ($COMMIT). Rien à faire."
    exit 0
fi

echo "[3/4] Mise à jour du code sur la prod..."
ssh "$PROD_HOST" "cd $PROD_DIR && git pull origin $BRANCH"

echo "[4/4] Build du frontend sur la prod..."
ssh "$PROD_HOST" "cd $PROD_DIR && npm run build"

echo ""
echo "Déploiement terminé."
echo "  Commit déployé : $COMMIT"
echo "  URL            : http://192.168.0.105"
