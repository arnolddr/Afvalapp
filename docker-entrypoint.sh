#!/bin/sh
set -e

echo "Database migraties uitvoeren..."
npx prisma migrate deploy

echo "App starten..."
exec npm start
