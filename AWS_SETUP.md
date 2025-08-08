# AWS DynamoDB Setup Guide

## Prerequisites

1. AWS Account with IAM user that has DynamoDB and S3 permissions
2. AWS Access Key ID and Secret Access Key
3. Node.js and npm installed

## Setup Steps

### 1. Configure Environment Variables

Update the `.env.local` file with your AWS credentials:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_access_key_here
AWS_SECRET_ACCESS_KEY=your_actual_secret_key_here

# DynamoDB Table Names
DYNAMODB_USERS_TABLE=lms-users
DYNAMODB_COURSES_TABLE=lms-courses
DYNAMODB_PROGRESS_TABLE=lms-progress
DYNAMODB_TESTIMONIALS_TABLE=lms-testimonials

# S3 Bucket
S3_BUCKET_NAME=your-lms-assets-bucket

# Next.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 2. Create DynamoDB Tables

Run the following command to create all required DynamoDB tables:

```bash
npm run create-tables
```

This will create the following tables:
- `lms-users` - Stores user accounts and authentication data
- `lms-courses` - Stores course information
- `lms-progress` - Stores user progress data
- `lms-testimonials` - Stores user testimonials

### 3. Seed Initial Data

Run the following command to populate the tables with initial data:

```bash
npm run seed-db
```

This will create:
- Admin user: `admin` / `admin123`
- Demo student: `demo_student` / `demo123`
- Sample courses

### 4. Required IAM Permissions

Your IAM user needs the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DescribeTable",
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Scan",
                "dynamodb:Query"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/lms-*",
                "arn:aws:dynamodb:*:*:table/lms-*/index/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-lms-assets-bucket",
                "arn:aws:s3:::your-lms-assets-bucket/*"
            ]
        }
    ]
}
```

### 5. Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Login with admin credentials:
   - Username: `admin`
   - Password: `admin123`

4. Check the admin panel at `http://localhost:3000/admin/users`

5. Test student dashboard with:
   - Username: `demo_student`
   - Password: `demo123`

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Verify your AWS credentials are correct
   - Check IAM permissions
   - Ensure the region is correct

2. **Table Already Exists**
   - This is normal if you've run the setup before
   - The script will skip existing tables

3. **Connection Timeout**
   - Check your internet connection
   - Verify AWS region is accessible
   - Try a different AWS region

### Useful Commands

```bash
# Create tables only
npm run create-tables

# Seed data only
npm run seed-db

# Start development server
npm run dev

# Build for production
npm run build
```

## Data Migration

If you have existing data, you can modify the `scripts/seed-dynamodb.js` file to include your data before running the seed command.

## Production Deployment

For production:
1. Use environment-specific table names
2. Enable DynamoDB encryption at rest
3. Set up proper backup policies
4. Use IAM roles instead of access keys when possible
5. Enable CloudWatch monitoring