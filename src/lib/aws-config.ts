import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';

// AWS Configuration
// Use AMPLIFY_ prefix for environment variables to avoid AWS prefix restriction
const AWS_REGION = process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AMPLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

// Check if we're in a production environment that requires AWS credentials
const isProduction = process.env.NODE_ENV === 'production' || process.env.AMPLIFY_AWS_ACCESS_KEY_ID;

if (isProduction && (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY)) {
  throw new Error('AWS credentials are required. Please set AMPLIFY_AWS_ACCESS_KEY_ID and AMPLIFY_AWS_SECRET_ACCESS_KEY environment variables.');
}

// Create AWS clients only if credentials are available
let dynamoDb: DynamoDBDocumentClient | null = null;
let s3Client: S3Client | null = null;

if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  // DynamoDB Client
  const dynamoClient = new DynamoDBClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  dynamoDb = DynamoDBDocumentClient.from(dynamoClient);

  // S3 Client
  s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
}

export { dynamoDb, s3Client };

// Table Names
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || 'lms-users',
  COURSES: process.env.DYNAMODB_COURSES_TABLE || 'lms-courses',
  PROGRESS: process.env.DYNAMODB_PROGRESS_TABLE || 'lms-progress',
  TESTIMONIALS: process.env.DYNAMODB_TESTIMONIALS_TABLE || 'lms-testimonials',
};

// S3 Bucket
export const S3_BUCKET = process.env.S3_BUCKET_NAME || 'lms-assets';