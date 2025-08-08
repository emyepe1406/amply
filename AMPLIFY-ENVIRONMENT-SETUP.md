# AWS Amplify Environment Variables Setup

## Masalah AWS Credentials di Amplify

AWS Amplify tidak mengizinkan environment variables dengan prefix `AWS_` untuk alasan keamanan. Oleh karena itu, kita perlu menggunakan nama environment variables yang berbeda.

## Environment Variables yang Diperlukan

Di AWS Amplify Console, buat environment variables berikut:

### AWS Credentials (Wajib)
```
AMPLIFY_AWS_REGION=us-east-1
AMPLIFY_AWS_ACCESS_KEY_ID=your_aws_access_key_id
AMPLIFY_AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

### Database Tables
```
DYNAMODB_USERS_TABLE=lms-users
DYNAMODB_COURSES_TABLE=lms-courses
DYNAMODB_PROGRESS_TABLE=lms-progress
DYNAMODB_TESTIMONIALS_TABLE=lms-testimonials
DYNAMODB_PAYMENTS_TABLE=lms-payments
```

### S3 Storage
```
S3_BUCKET_NAME=your-s3-bucket-name
```

### Authentication
```
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-amplify-domain.amplifyapp.com
NEXT_PUBLIC_BASE_URL=https://your-amplify-domain.amplifyapp.com
```

### Payment Gateway (Midtrans)
```
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_MERCHANT_ID=your-midtrans-merchant-id
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
```

### Admin Access
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

## Cara Setting di Amplify Console

1. Buka AWS Amplify Console
2. Pilih aplikasi Anda
3. Klik "Environment variables" di sidebar kiri
4. Klik "Manage variables"
5. Tambahkan semua environment variables di atas
6. Klik "Save"

## Cara Kerja

1. File `amplify.yml` akan mengekstrak environment variables dan menulis ke `.env.production`
2. Aplikasi Next.js akan membaca dari `.env.production` saat runtime
3. Kode AWS SDK akan menggunakan credentials dari environment variables

## Troubleshooting

### Error: AWS credentials are required
- Pastikan `AMPLIFY_AWS_ACCESS_KEY_ID` dan `AMPLIFY_AWS_SECRET_ACCESS_KEY` sudah diset
- Periksa IAM permissions untuk user AWS

### Error: Table not found
- Pastikan DynamoDB tables sudah dibuat
- Periksa nama table di environment variables

### Error: S3 bucket not found
- Pastikan S3 bucket sudah dibuat
- Periksa nama bucket di environment variables

## IAM Permissions yang Diperlukan

User AWS harus memiliki permissions:
- DynamoDBFullAccess
- S3FullAccess
- Atau custom policy dengan permissions minimal:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/lms-*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

## Deployment Steps

1. Set environment variables di Amplify Console
2. Push kode ke GitHub
3. Amplify akan otomatis trigger build
4. Monitor build logs untuk memastikan tidak ada error
5. Test aplikasi setelah deployment selesai