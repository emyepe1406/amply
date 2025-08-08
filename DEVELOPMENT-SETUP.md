# Development Environment Setup

## Prerequisites

1. Node.js (version 18 or higher)
2. npm or yarn
3. AWS Account with proper IAM permissions

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd projeknext
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following content:

```env
# AWS Configuration
AMPLIFY_AWS_REGION=ap-southeast-1
AMPLIFY_AWS_ACCESS_KEY_ID=your-access-key-id
AMPLIFY_AWS_SECRET_ACCESS_KEY=your-secret-access-key

# DynamoDB Table Names
DYNAMODB_USERS_TABLE=lms-users
DYNAMODB_COURSES_TABLE=lms-courses
DYNAMODB_PROGRESS_TABLE=lms-progress
DYNAMODB_TESTIMONIALS_TABLE=lms-testimonials

# S3 Bucket
S3_BUCKET_NAME=ssw-lms-files

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Base URL for development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# iPaymu Configuration
IPAYMU_VA=your-ipaymu-va
IPAYMU_API_KEY=your-ipaymu-api-key

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. AWS Setup

Make sure your AWS IAM user has the following permissions:

- DynamoDB: Full access to tables `lms-users`, `lms-courses`, `lms-progress`, `lms-testimonials`
- S3: Full access to bucket `ssw-lms-files`
- CloudWatch Logs: Basic logging permissions

Refer to `aws-iam-policy.json` for the exact IAM policy.

### 5. Database Setup

Run the setup scripts to create DynamoDB tables:

```bash
node scripts/create-dynamodb-tables.js
node scripts/seed-dynamodb.js
```

### 6. S3 Bucket Setup

Create and configure the S3 bucket:

```bash
node scripts/setup-s3-bucket.js
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Troubleshooting

### AWS Credentials Error

If you see "AWS credentials are required" error:

1. Check that `.env.local` file exists and contains the correct AWS credentials
2. Verify that the credentials use the `AMPLIFY_AWS_` prefix
3. Ensure your IAM user has the correct permissions
4. Restart the development server after making changes

### DynamoDB Connection Issues

1. Verify that DynamoDB tables exist in your AWS account
2. Check that table names in `.env.local` match the actual table names
3. Ensure your AWS region is correct

### S3 Access Issues

1. Verify that the S3 bucket exists
2. Check bucket name in `.env.local`
3. Ensure proper S3 permissions in your IAM policy

## Important Notes

- Never commit `.env.local` to version control
- Use different AWS resources for development and production
- Keep your AWS credentials secure
- Regularly rotate your AWS access keys