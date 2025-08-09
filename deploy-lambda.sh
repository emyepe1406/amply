#!/bin/bash

# AWS Lambda Deployment Script for Payment Sync
# Usage: ./deploy-lambda.sh [dev|prod]

ENVIRONMENT=${1:-dev}
REGION="ap-southeast-1"
FUNCTION_NAME="payment-sync-cron"

if [ "$ENVIRONMENT" = "prod" ]; then
  PAYMENTS_TABLE="lms-payments-prod"
  USERS_TABLE="lms-users"
  FUNCTION_NAME="payment-sync-cron-prod"
else
  PAYMENTS_TABLE="lms-payments"
  USERS_TABLE="lms-users"
fi

echo "🚀 Deploying Lambda function: $FUNCTION_NAME"
echo "📊 Environment: $ENVIRONMENT"
echo "🗄️  Tables: $PAYMENTS_TABLE, $USERS_TABLE"

# Create deployment directory
mkdir -p lambda-deployment
cd lambda-deployment

# Copy necessary files
cp ../lambda-payment-sync.js index.js
cp ../package.json .

# Install production dependencies
npm install --production @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# Create deployment package
zip -r payment-sync.zip . -x "*.git*" "node_modules/.cache/*"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check if function exists
aws lambda get-function --function-name $FUNCTION_NAME --region $REGION > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "🔄 Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://payment-sync.zip \
        --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment "Variables={DYNAMODB_PAYMENTS_TABLE=$PAYMENTS_TABLE,DYNAMODB_USERS_TABLE=$USERS_TABLE,NODE_ENV=production}" \
        --region $REGION
else
    echo "📦 Creating new Lambda function..."
    
    # Create IAM role if it doesn't exist
    ROLE_NAME="lambda-payment-sync-role"
    aws iam get-role --role-name $ROLE_NAME > /dev/null 2>&1
    
    if [ $? -ne 0 ]; then
        echo "🔐 Creating IAM role..."
        aws iam create-role \
            --role-name $ROLE_NAME \
            --assume-role-policy-document '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {
                            "Service": "lambda.amazonaws.com"
                        },
                        "Action": "sts:AssumeRole"
                    }
                ]
            }' \
            --region $REGION
        
        # Attach basic Lambda execution role
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole \
            --region $REGION
        
        # Attach DynamoDB access policy
        aws iam put-role-policy \
            --role-name $ROLE_NAME \
            --policy-name DynamoDBAccessPolicy \
            --policy-document '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "dynamodb:Scan",
                            "dynamodb:GetItem",
                            "dynamodb:UpdateItem"
                        ],
                        "Resource": [
                            "arn:aws:dynamodb:'$REGION':*:table/'$PAYMENTS_TABLE'",
                            "arn:aws:dynamodb:'$REGION':*:table/'$USERS_TABLE'"
                        ]
                    }
                ]
            }' \
            --region $REGION
    fi
    
    # Wait for role to be ready
    echo "⏳ Waiting for IAM role to be ready..."
    sleep 10
    
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs20.x \
        --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$ROLE_NAME \
        --handler index.handler \
        --zip-file fileb://payment-sync.zip \
        --environment "Variables={DYNAMODB_PAYMENTS_TABLE=$PAYMENTS_TABLE,DYNAMODB_USERS_TABLE=$USERS_TABLE,NODE_ENV=production}" \
        --timeout 300 \
        --memory-size 256 \
        --region $REGION
fi

# Test the function
echo "🧪 Testing Lambda function..."
aws lambda invoke \
    --function-name $FUNCTION_NAME \
    --payload '{}' \
    --region $REGION \
    response.json

echo "✅ Lambda function deployed successfully!"
echo "📋 Function name: $FUNCTION_NAME"
echo "🔗 ARN: arn:aws:lambda:$REGION:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME"

# Cleanup
cd ..
rm -rf lambda-deployment

echo ""
echo "🎯 Next steps:"
echo "1. Setup CloudWatch Events trigger:"
echo "   aws events put-rule --name payment-sync-schedule --schedule-expression 'rate(1 hour)' --region $REGION"
echo "2. Add Lambda as target:"
echo "   aws events put-targets --rule payment-sync-schedule --targets '[{\"Id\":\"1\",\"Arn\":\"arn:aws:lambda:$REGION:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME\"}]' --region $REGION"
echo "3. Add permission:"
echo "   aws lambda add-permission --function-name $FUNCTION_NAME --statement-id payment-sync-schedule --action lambda:InvokeFunction --principal events.amazonaws.com --source-arn arn:aws:events:$REGION:$(aws sts get-caller-identity --query Account --output text):rule/payment-sync-schedule --region $REGION"