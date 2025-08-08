#!/bin/bash

# 🚀 Script Deployment Otomatis ke Vercel
# Jalankan dengan: bash deploy-vercel.sh

echo "🚀 Starting LMS Deployment to Vercel..."
echo "==========================================="

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build production
echo "🔨 Building production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors first."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "🎉 Deployment completed!"
echo "==========================================="
echo "📋 Next steps:"
echo "1. Setup environment variables in Vercel dashboard"
echo "2. Configure AWS resources"
echo "3. Setup iPaymu webhook URLs"
echo "4. Test your application"
echo "==========================================="
echo "📖 See DEPLOYMENT-GUIDE.md for detailed instructions"