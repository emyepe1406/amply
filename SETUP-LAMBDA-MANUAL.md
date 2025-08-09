# Setup AWS Lambda Manual untuk Payment Sync

## 🔧 **Langkah-langkah Setup Manual di AWS Console**

### **Step 1: Persiapan AWS Account**
1. Login ke [AWS Console](https://console.aws.amazon.com)
2. Pastikan region di pojok kanan atas: **Asia Pacific (Singapore) ap-southeast-1**

### **Step 2: Buat IAM Role untuk Lambda**

#### **2.1 Buat Role Baru**
1. **Services** → **IAM** → **Roles** → **Create role**
2. **Trusted entity type**: AWS service
3. **Use case**: Lambda
4. Klik **Next**

#### **2.2 Tambahkan Permissions**
1. Cari dan tambahkan policies berikut:
   - `AWSLambdaBasicExecutionRole`
   - `AmazonDynamoDBFullAccess` (atau buat custom policy)
2. Klik **Next**

#### **2.3 Nama Role**
- **Role name**: `lambda-payment-sync-role`
- **Description**: Role for payment sync Lambda function
- Klik **Create role**

### **Step 3: Buat Lambda Function**

#### **3.1 Buat Function**
1. **Services** → **Lambda** → **Create function**
2. Pilih **Author from scratch**
3. **Function name**: `payment-sync-cron-prod`
4. **Runtime**: Node.js 20.x
5. **Architecture**: x86_64
6. **Permissions**: Pilih role `lambda-payment-sync-role` yang sudah dibuat
7. Klik **Create function**

#### **3.2 Upload Code**
1. Di halaman function, scroll ke **Code source**
2. Klik **Upload from** → **.zip file**
3. Kita akan buat zip file dulu...

### **Step 4: Buat Deployment Package**

#### **4.1 Install Dependencies & Buat Package**
```bash
# Di terminal kamu, jalankan:
cd /Volumes/Lucky/activeman/ProjekwebLMS/projeknext

# Buat folder deployment
mkdir -p lambda-package
cd lambda-package

# Copy file lambda
cp ../lambda-payment-sync.js index.js

# Buat package.json minimal
cat > package.json << 'EOF'
{
  "name": "payment-sync-lambda",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.0.0",
    "@aws-sdk/lib-dynamodb": "^3.0.0"
  }
}
EOF

# Install dependencies
npm install --production

# Buat zip package
zip -r payment-sync-lambda.zip . -x "*.git*" "node_modules/.cache/*"
```

#### **4.2 Upload ke Lambda**
1. Upload file `payment-sync-lambda.zip` ke Lambda
2. **Handler**: `index.handler`
3. Klik **Deploy**

### **Step 5: Setup Environment Variables**
1. Di Lambda function, tab **Configuration**
2. Klik **Environment variables**
3. Tambahkan variables:
   - `DYNAMODB_PAYMENTS_TABLE` = `lms-payments-prod`
   - `DYNAMODB_USERS_TABLE` = `lms-users`
   - `NODE_ENV` = `production`
4. Klik **Save**

### **Step 6: Test Function**
1. Klik tab **Test**
2. Klik **Create test event**
3. **Event name**: `test-sync`
4. **Template**: Hello World
5. Klik **Create**
6. Klik **Test**

### **Step 7: Setup CloudWatch Schedule**

#### **7.1 Buat CloudWatch Rule**
1. **Services** → **CloudWatch** → **Rules** → **Create rule**
2. **Event Source**: Schedule
3. **Fixed rate**: Setiap **1 hour**
4. **Targets**: Pilih Lambda function `payment-sync-cron-prod`
5. Klik **Create**

### **Step 8: Monitoring Setup**

#### **8.1 CloudWatch Logs**
1. Di Lambda function, klik **Monitor**
2. Klik **View CloudWatch logs**
3. Akan terlihat hasil sync setiap jam

#### **8.2 Alarms (Optional)**
1. **CloudWatch** → **Alarms** → **Create alarm**
2. Pilih Lambda Errors
3. Setup alert untuk email

## 📋 **Checklist Setup Manual**

- [ ] AWS account sudah login
- [ ] IAM role `lambda-payment-sync-role` sudah dibuat
- [ ] Lambda function `payment-sync-cron-prod` sudah dibuat
- [ ] Code sudah di-upload
- [ ] Environment variables sudah di-set
- [ ] Test event sudah berhasil
- [ ] CloudWatch schedule sudah aktif
- [ ] Monitoring sudah setup

## 🎯 **Test Manual di Terminal (Opsional)**

Jika ingin test function sebelum deploy:

```bash
# Install AWS CLI (jika belum)
brew install aws-cli

# Configure AWS credentials
aws configure
# Masukkan: Access Key, Secret Key, region: ap-southeast-1

# Test invoke
aws lambda invoke \
  --function-name payment-sync-cron-prod \
  --payload '{}' \
  --region ap-southeast-1 \
  response.json

cat response.json
```

## 📊 **Cost Estimasi**

- **Lambda**: Gratis untuk 1M requests/month (AWS Free Tier)
- **CloudWatch Logs**: Gratis untuk 5GB/month
- **DynamoDB**: Sesuai usage

## 🚨 **Troubleshooting**

### **Jika Lambda Error**
1. Check **CloudWatch Logs**
2. Pastikan IAM role punya akses ke DynamoDB
3. Pastikan environment variables benar

### **Jika Schedule Tidak Jalan**
1. Check **CloudWatch Rules**
2. Pastikan Lambda function punya permission untuk di-invoke

## 🎉 **Next Steps**

Setelah setup selesai:
1. Monitor hasil sync di CloudWatch Logs
2. Validasi data dengan: `npm run payment-validate`
3. Setup alerts jika perlu

Butuh bantuan? Screenshot error yang muncul dan saya bantu troubleshoot! 🛠️