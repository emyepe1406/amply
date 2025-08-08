#!/bin/bash

# Script untuk setup environment variables di Vercel secara otomatis
# Pastikan sudah login ke Vercel dengan: npx vercel login

echo "🚀 Setting up Vercel environment variables..."

# Baca environment variables dari .env.production
if [ ! -f ".env.production" ]; then
    echo "❌ File .env.production tidak ditemukan!"
    exit 1
fi

# Function untuk add environment variable
add_env_var() {
    local var_name=$1
    local var_value=$(grep "^${var_name}=" .env.production | cut -d'=' -f2- | tr -d '"')
    
    if [ ! -z "$var_value" ]; then
        echo "📝 Setting $var_name..."
        echo "$var_value" | npx vercel env add "$var_name" production
    else
        echo "⚠️  $var_name not found in .env.production"
    fi
}

# Set environment variables
echo "📝 Setting AWS credentials..."
add_env_var "AWS_ACCESS_KEY_ID"
add_env_var "AWS_SECRET_ACCESS_KEY"
add_env_var "AWS_REGION"

echo "📝 Setting DynamoDB table names..."
add_env_var "DYNAMODB_USERS_TABLE"
add_env_var "DYNAMODB_COURSES_TABLE"
add_env_var "DYNAMODB_ENROLLMENTS_TABLE"
add_env_var "DYNAMODB_PROGRESS_TABLE"
add_env_var "DYNAMODB_CERTIFICATES_TABLE"

echo "📝 Setting S3 configuration..."
add_env_var "S3_BUCKET_NAME"
add_env_var "S3_REGION"

echo "📝 Setting other configurations..."
add_env_var "NEXTAUTH_SECRET"
add_env_var "NEXTAUTH_URL"

echo "✅ Environment variables setup completed!"
echo "🚀 Now deploying to Vercel..."

# Deploy ke production
npx vercel --prod

echo "🎉 Deployment completed! Check your Vercel dashboard for the live URL."