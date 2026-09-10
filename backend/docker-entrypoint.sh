#!/bin/sh
set -eu

# Add locally-installed CLI tools (tsx, prisma, etc.) to PATH so they can be
# called without npx in the seed and migration steps below.
export PATH="$PWD/node_modules/.bin:$PATH"

echo "[nivaaran] Running Prisma migrations..."
prisma migrate deploy

echo "[nivaaran] Seeding districts and blocks..."
tsx prisma/seeds/districts.ts

echo "[nivaaran] Seeding RBAC roles and permissions..."
tsx prisma/seeds/rbac.ts

echo "[nivaaran] Seeding demo users and challenges..."
tsx prisma/seeds/demo.ts

echo "[nivaaran] Starting backend server..."
exec node dist/index.js
