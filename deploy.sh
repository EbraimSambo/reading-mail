#!/bin/bash
set -e

HOST=$1
USER=$2
PASS=$3

if [ -z "$HOST" ] || [ -z "$USER" ] || [ -z "$PASS" ]; then
  echo "Uso: ./deploy.sh <host> <user> <password>"
  exit 1
fi

echo "=== Build imagem ==="
docker build -t mail-app .

echo "=== Salvar imagem ==="
docker save mail-app | gzip > mail-app.tar.gz

echo "=== Enviar para servidor ==="
sshpass -p "$PASS" scp -o StrictHostKeyChecking=no mail-app.tar.gz "$USER@$HOST:~/mail-app.tar.gz"

echo "=== Deploy no servidor ==="
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$USER@$HOST" << 'EOF'
  mkdir -p ~/mail-data
  touch ~/mail-data/db.sqlite
  docker load < mail-app.tar.gz
  docker stop mail 2>/dev/null || true
  docker rm mail 2>/dev/null || true
  docker run -d \
    --name mail \
    --restart unless-stopped \
    -p 3007:3007 \
    mail-app
  rm mail-app.tar.gz
  echo "Deploy concluido"
EOF

rm mail-app.tar.gz
echo "=== Done ==="
