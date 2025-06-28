#!/bin/bash
set -e

# Build customer PWA
cd apps/customer-pwa
npm install
npm run build
cd ../..

# Build staff dashboard
cd apps/staff-dashboard
npm install
npm run build
cd ../..

# Generate Prisma client
npx prisma generate

# Copy built files to public directory
mkdir -p public
cp -r apps/customer-pwa/dist/* public/
mkdir -p public/staff
cp -r apps/staff-dashboard/dist/* public/staff/

echo "Build completed successfully"