#!/bin/bash

# Smart Inventory System - Vercel Deployment Script
echo "=== Smart Inventory System Deployment Script ==="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy Backend
echo "=== Deploying Backend ==="
cd backend

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "Error: vercel.json not found in backend directory"
    exit 1
fi

echo "Deploying backend to Vercel..."
vercel --prod --name smart-inventory-backend

# Get backend URL
BACKEND_URL=$(vercel ls --scope piy-jpgs-projects | grep smart-inventory-backend | awk '{print $3}')
echo "Backend deployed to: $BACKEND_URL"

# Update frontend environment variables
cd ../frontend

# Update .env.production with backend URL
echo "REACT_APP_API_URL=https://$BACKEND_URL" > .env.production
echo "REACT_APP_SOCKET_URL=https://$BACKEND_URL" >> .env.production
echo "REACT_APP_ENV=production" >> .env.production

echo "Updated frontend environment variables"

# Deploy Frontend
echo "=== Deploying Frontend ==="

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "Error: vercel.json not found in frontend directory"
    exit 1
fi

echo "Deploying frontend to Vercel..."
vercel --prod --name smart-inventory-frontend

# Get frontend URL
FRONTEND_URL=$(vercel ls --scope piy-jpgs-projects | grep smart-inventory-frontend | awk '{print $3}')
echo "Frontend deployed to: $FRONTEND_URL"

echo "=== Deployment Complete ==="
echo "Backend URL: https://$BACKEND_URL"
echo "Frontend URL: https://$FRONTEND_URL"
echo ""
echo "Next steps:"
echo "1. Test the application at https://$FRONTEND_URL"
echo "2. Set up environment variables in Vercel dashboard if needed"
echo "3. Configure custom domains if desired"
echo ""
echo "Note: Make sure to set these environment variables in Vercel dashboard:"
echo "- Backend: MONGODB_URI, JWT_SECRET"
echo "- Frontend: REACT_APP_API_URL, REACT_APP_SOCKET_URL"
