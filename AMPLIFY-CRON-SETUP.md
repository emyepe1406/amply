# AWS Amplify Cron Job Setup untuk Payment Sync

## 🚫 **Kenapa Tidak Bisa Pakai Cron Tradisional di Amplify**

AWS Amplify adalah serverless platform, jadi tidak support cron jobs tradisional seperti di VPS. Tapi ada solusi AWS-native yang lebih powerful!

## ✅ **Solusi AWS-Native**

### **Opsi 1: AWS Lambda + CloudWatch Events (Rekomendasi)**

#### **Step 1: Buat Lambda Function**
```javascript
// lambda/payment-sync.js
const { execSync } = require('child_process');

exports.handler = async (event, context) => {
  try {
    console.log('Starting payment sync...');
    
    // Run the sync script
    const result = execSync('node scripts/cron-sync-payments.js sync', {
      cwd: '/var/task',
      encoding: 'utf8'
    });
    
    console.log('Sync completed:', result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Payment sync completed successfully',
        result: result
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Payment sync failed',
        error: error.message
      })
    };
  }
};
```

#### **Step 2: Setup Lambda di AWS Console**
1. **AWS Console** → **Lambda** → **Create Function**
2. Pilih **Author from scratch**
3. **Function name**: `payment-sync-cron`
4. **Runtime**: Node.js 20.x
5. **Architecture**: x86_64
6. **Permissions**: Buat new role dengan basic Lambda permissions

#### **Step 3: Upload Code**
```bash
# Zip the necessary files
zip -r payment-sync-lambda.zip \
  scripts/cron-sync-payments.js \
  scripts/validate-payment-sync.js \
  scripts/migrate-payments-sync.js \
  src/lib/PaymentSyncService.js \
  package.json \
  node_modules/ \
  .env.production

# Upload ke Lambda via AWS Console
```

#### **Step 4: Setup CloudWatch Events**
1. Di Lambda function → **Add trigger**
2. Pilih **EventBridge (CloudWatch Events)**
3. **Create new rule**
4. **Rule name**: `payment-sync-schedule`
5. **Schedule expression**: `rate(1 hour)` atau `cron(0 2 * * ? *)`

### **Opsi 2: Amplify Scheduled Builds**

#### **Step 1: Buat API Endpoint untuk Trigger**
```javascript
// src/app/api/admin/sync-payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PaymentSyncService from '@/lib/PaymentSyncService';

export async function POST(request: NextRequest) {
  try {
    const { authorization } = await request.json();
    
    if (authorization !== process.env.ADMIN_SYNC_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const service = new PaymentSyncService();
    const result = await service.syncAllUsers();
    
    return NextResponse.json({
      success: true,
      message: 'Payment sync completed',
      result
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
```

#### **Step 2: Setup Webhook di External Service**
Gunakan layanan seperti:
- **Cron-Job.org** (free)
- **GitHub Actions** dengan schedule
- **AWS EventBridge** untuk trigger API

### **Opsi 3: AWS Step Functions**

#### **Step 1: Buat State Machine**
```json
{
  "Comment": "Payment sync workflow",
  "StartAt": "SyncPayments",
  "States": {
    "SyncPayments": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:REGION:ACCOUNT:function:payment-sync-cron",
      "Retry": [
        {
          "ErrorEquals": ["States.TaskFailed"],
          "IntervalSeconds": 60,
          "MaxAttempts": 3,
          "BackoffRate": 2.0
        }
      ],
      "End": true
    }
  }
}
```

## 🚀 **Rekomendasi untuk Kamu**

### **Pilih Opsi 1 (Lambda + CloudWatch)** karena:
- ✅ Gratis untuk usage kecil (AWS Free Tier)
- ✅ Reliable & scalable
- ✅ Built-in monitoring via CloudWatch
- ✅ Tidak perlu external service

### **Setup Cepat (10 menit):**

#### **1. Buat Lambda Function**
```bash
# Install AWS CLI dulu jika belum
npm install -g aws-cli

# Configure AWS credentials
aws configure

# Buat Lambda function
aws lambda create-function \
  --function-name payment-sync-cron \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://payment-sync-lambda.zip \
  --environment Variables="{NODE_ENV=production}" \
  --region ap-southeast-1
```

#### **2. Setup CloudWatch Rule**
```bash
# Buat rule untuk trigger setiap jam
aws events put-rule \
  --name payment-sync-schedule \
  --schedule-expression "rate(1 hour)" \
  --region ap-southeast-1

# Tambahkan Lambda sebagai target
aws events put-targets \
  --rule payment-sync-schedule \
  --targets "[{\"Id\":\"1\",\"Arn\":\"arn:aws:lambda:ap-southeast-1:YOUR_ACCOUNT:function:payment-sync-cron\"}]" \
  --region ap-southeast-1
```

## 📊 **Monitoring & Alerting**

### **CloudWatch Dashboard**
```javascript
// Tambahan di Lambda function
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

async function sendMetric(name, value) {
  await cloudwatch.putMetricData({
    Namespace: 'PaymentSync',
    MetricData: [{
      MetricName: name,
      Value: value,
      Unit: 'Count',
      Timestamp: new Date()
    }]
  }).promise();
}
```

### **Alert Setup**
1. **CloudWatch Alarms** untuk failed executions
2. **SNS notifications** untuk email alerts
3. **AWS X-Ray** untuk tracing

## 🔧 **Environment Variables untuk Lambda**

```yaml
# Lambda Environment Variables
NODE_ENV=production
DYNAMODB_PAYMENTS_TABLE=lms-payments-prod
DYNAMODB_USERS_TABLE=lms-users
AWS_REGION=ap-southeast-1
ADMIN_SYNC_SECRET=your-secret-key
```

## 📱 **Alternative: Serverless Framework**

#### **serverless.yml**
```yaml
service: payment-sync-service

provider:
  name: aws
  runtime: nodejs20.x
  region: ap-southeast-1
  environment:
    NODE_ENV: production

functions:
  syncPayments:
    handler: lambda/payment-sync.handler
    events:
      - schedule: rate(1 hour)
    environment:
      DYNAMODB_PAYMENTS_TABLE: lms-payments-prod
      DYNAMODB_USERS_TABLE: lms-users

plugins:
  - serverless-offline
```

## 🎯 **Langkah Praktis Hari Ini**

1. **Pilih opsi Lambda** (rekomendasi)
2. **Upload code** ke Lambda via AWS Console
3. **Test manual** dulu
4. **Setup schedule** setiap 1 jam
5. **Monitor** via CloudWatch

Butuh bantuan setup? Saya bisa buatkan template Lambda function yang siap upload!