# 🚀 Panduan Deployment LMS - Langkah Demi Langkah

## ✅ Status Build
**PRODUCTION BUILD BERHASIL!** ✨

Aplikasi LMS kamu sudah siap untuk di-deploy ke production. Semua konfigurasi sudah disiapkan dan build test sudah berhasil.

## 🎯 Pilihan Deployment

### Option 1: AWS Amplify (Recommended)
**Kelebihan:** Scalable, terintegrasi dengan AWS services, auto-scaling
**Cocok untuk:** Production dengan traffic tinggi

### Option 2: Vercel (Mudah & Cepat)
**Kelebihan:** Setup super mudah, gratis untuk personal project
**Cocok untuk:** Testing, demo, atau project kecil

---

## 🚀 DEPLOYMENT KE VERCEL (TERMUDAH)

### Langkah 1: Persiapan
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login ke Vercel
vercel login
```

### Langkah 2: Deploy
```bash
# Deploy langsung
vercel --prod
```

### Langkah 3: Setup Environment Variables di Vercel
1. Buka dashboard Vercel
2. Pilih project kamu
3. Go to Settings > Environment Variables
4. Tambahkan semua variables dari `.env.production`

**Environment Variables yang perlu diisi:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[your-aws-key]
AWS_SECRET_ACCESS_KEY=[your-aws-secret]
DYNAMODB_USERS_TABLE=lms-users-prod
DYNAMODB_COURSES_TABLE=lms-courses-prod
DYNAMODB_PROGRESS_TABLE=lms-progress-prod
S3_BUCKET_NAME=lms-content-prod-[unique-suffix]
NEXTAUTH_SECRET=[generate-new-secret]
NEXTAUTH_URL=[your-vercel-domain]
NEXT_PUBLIC_BASE_URL=[your-vercel-domain]
IPAYMU_VA=[your-ipaymu-va]
IPAYMU_SECRET=[your-ipaymu-secret]
IPAYMU_API_KEY=[your-ipaymu-api-key]
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[secure-password]
```

---

## 🏗️ DEPLOYMENT KE AWS AMPLIFY

### Langkah 1: Setup AWS Account
1. Daftar di [AWS Console](https://aws.amazon.com/)
2. Buat IAM User dengan permissions:
   - AmazonDynamoDBFullAccess
   - AmazonS3FullAccess
   - AmplifyFullAccess

### Langkah 2: Push ke GitHub
```bash
# 1. Init git (jika belum)
git init
git add .
git commit -m "Initial commit"

# 2. Push ke GitHub
git remote add origin https://github.com/emyepe1406/amply.git
git push -u origin main
```

### Langkah 3: Setup Amplify
1. Buka [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" > "Host web app"
3. Connect GitHub repository
4. Amplify akan otomatis detect Next.js

### Langkah 4: Configure Build Settings
Amplify akan menggunakan file `amplify.yml` yang sudah disiapkan:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Langkah 5: Setup Environment Variables
Di Amplify Console > App settings > Environment variables, tambahkan:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[your-aws-key]
AWS_SECRET_ACCESS_KEY=[your-aws-secret]
# ... dan seterusnya
```

---

## 🔧 SETUP AWS RESOURCES

### Setup DynamoDB Tables
```bash
# Setelah AWS credentials benar
npm run setup-prod-tables
```

### Setup S3 Bucket
```bash
npm run setup-s3
```

---

## 💳 SETUP IPAYMU

1. Daftar di [iPaymu](https://ipaymu.com/)
2. Dapatkan credentials:
   - VA (Virtual Account)
   - API Key
   - Secret Key
3. Update environment variables
4. Setup webhook URL di iPaymu dashboard:
   - Webhook URL: `https://your-domain.com/api/payment/notify`

---

## 🧪 TESTING

### Local Testing
```bash
# Test production build
npm run test-prod-build

# Start production server
npm start
```

### Production Testing
1. Test login/register
2. Test course enrollment
3. Test payment flow
4. Test admin panel

---

## 📋 CHECKLIST DEPLOYMENT

- [ ] ✅ Production build berhasil
- [ ] ✅ Environment variables configured
- [ ] ✅ AWS credentials setup
- [ ] ✅ DynamoDB tables created
- [ ] ✅ S3 bucket created
- [ ] ✅ iPaymu credentials configured
- [ ] ✅ Domain/URL updated
- [ ] ✅ Webhook URLs configured
- [ ] ✅ Testing completed

---

## 🆘 TROUBLESHOOTING

### Build Errors
```bash
# Clear cache dan rebuild
rm -rf .next node_modules
npm install
npm run build
```

### AWS Errors
- Pastikan AWS credentials benar
- Check IAM permissions
- Verify region settings

### Payment Errors
- Verify iPaymu credentials
- Check webhook URLs
- Test in sandbox mode first

---

## 📞 BANTUAN

Jika ada masalah:
1. Check error logs di console
2. Verify environment variables
3. Test di local environment dulu
4. Check AWS CloudWatch logs (untuk Amplify)

---

## 🎉 SELAMAT!

Aplikasi LMS kamu sudah siap production! 🚀

**Next Steps:**
1. Setup monitoring
2. Configure backup
3. Setup SSL certificate
4. Configure custom domain
5. Setup analytics

**Estimasi Biaya AWS (per bulan):**
- DynamoDB: $5-20
- S3: $1-5
- Amplify: $15-50
- Total: ~$20-75/bulan

**Vercel Pricing:**
- Hobby (Free): 100GB bandwidth
- Pro ($20/month): Unlimited bandwidth