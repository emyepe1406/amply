# Deployment Guide - AWS Amplify + DynamoDB + S3

Panduan lengkap untuk deploy aplikasi LMS ke AWS menggunakan Amplify, DynamoDB, dan S3.

## Prerequisites

1. **AWS Account** dengan akses ke:
   - AWS Amplify
   - DynamoDB
   - S3
   - IAM

2. **AWS CLI** terinstall dan terkonfigurasi
   ```bash
   aws configure
   ```

3. **Git Repository** (GitHub, GitLab, atau Bitbucket)

## Step 1: Setup AWS Resources

### 1.1 Konfigurasi Environment Variables

Edit file `.env.production` dan isi dengan nilai yang sesuai:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# DynamoDB Tables
DYNAMODB_USERS_TABLE=lms-users-prod
DYNAMODB_COURSES_TABLE=lms-courses-prod
DYNAMODB_PROGRESS_TABLE=lms-progress-prod

# S3 Configuration
S3_BUCKET_NAME=lms-content-prod-unique-name

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_32_chars_min
NEXTAUTH_URL=https://your-app-name.amplifyapp.com

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-app-name.amplifyapp.com

# Midtrans Configuration
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
```

### 1.2 Setup DynamoDB Tables

```bash
node scripts/setup-production-tables.js
```

### 1.3 Setup S3 Bucket

```bash
node scripts/setup-s3-bucket.js
```

## Step 2: Deploy ke AWS Amplify

### 2.1 Melalui AWS Console

1. **Login ke AWS Console** → Amplify
2. **Create New App** → Host web app
3. **Connect Repository**:
   - Pilih Git provider (GitHub/GitLab/Bitbucket)
   - Authorize AWS Amplify
   - Pilih repository dan branch (main/master)

4. **Configure Build Settings**:
   - App name: `lms-production`
   - Environment: `production`
   - Build command akan otomatis detect `amplify.yml`

5. **Environment Variables**:
   Tambahkan semua environment variables dari `.env.production`:
   ```
   AWS_REGION=us-east-1
   DYNAMODB_USERS_TABLE=lms-users-prod
   DYNAMODB_COURSES_TABLE=lms-courses-prod
   DYNAMODB_PROGRESS_TABLE=lms-progress-prod
   S3_BUCKET_NAME=lms-content-prod-unique-name
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-app-name.amplifyapp.com
   NEXT_PUBLIC_BASE_URL=https://your-app-name.amplifyapp.com
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_admin_password
   ```

6. **Deploy**

### 2.2 Melalui Amplify CLI (Alternative)

```bash
# Initialize Amplify
npx amplify init

# Add hosting
npx amplify add hosting

# Deploy
npx amplify publish
```

## Step 3: Post-Deployment Setup

### 3.1 Update Midtrans Configuration

Setelah mendapat URL Amplify, update konfigurasi Midtrans:
1. Login ke dashboard Midtrans
2. Update **Return URL** dan **Notify URL**:
   - Return URL: `https://your-app-name.amplifyapp.com/payment/success`
   - Notify URL: `https://your-app-name.amplifyapp.com/api/payment/notify`

### 3.2 Setup Custom Domain (Optional)

1. Di AWS Amplify Console → Domain management
2. Add domain
3. Configure DNS records

### 3.3 Seed Initial Data

Jika perlu data awal:
```bash
# Update script untuk production
node scripts/seed-dynamodb.js
```

## Step 4: Monitoring & Maintenance

### 4.1 CloudWatch Logs
- Monitor aplikasi melalui AWS CloudWatch
- Setup alerts untuk errors

### 4.2 DynamoDB Monitoring
- Monitor read/write capacity
- Setup auto-scaling jika diperlukan

### 4.3 S3 Monitoring
- Monitor storage usage
- Setup lifecycle policies

## Troubleshooting

### Build Errors
1. Check environment variables
2. Verify AWS permissions
3. Check build logs di Amplify Console

### Database Connection Issues
1. Verify AWS credentials
2. Check DynamoDB table names
3. Verify IAM permissions

### Payment Issues
1. Verify Midtrans configuration
2. Check notify URL accessibility
3. Monitor payment logs

## Security Best Practices

1. **Environment Variables**: Jangan commit `.env.production`
2. **IAM Permissions**: Gunakan principle of least privilege
3. **HTTPS**: Selalu gunakan HTTPS untuk production
4. **Secrets**: Gunakan AWS Secrets Manager untuk data sensitif
5. **CORS**: Konfigurasi CORS dengan domain spesifik

## Cost Optimization

1. **DynamoDB**: Gunakan On-Demand billing untuk traffic rendah
2. **S3**: Setup lifecycle policies untuk file lama
3. **Amplify**: Monitor bandwidth usage
4. **CloudWatch**: Setup log retention policies

## Backup Strategy

1. **DynamoDB**: Enable point-in-time recovery
2. **S3**: Enable versioning dan cross-region replication
3. **Code**: Regular git backups

---

**Estimasi Biaya AWS Free Tier:**
- Amplify: 1000 build minutes/month
- DynamoDB: 25GB storage + 25 RCU/WCU
- S3: 5GB storage + 20,000 GET requests
- Total: ~$0-5/month untuk traffic rendah

**Support:**
Untuk bantuan deployment, hubungi tim development.