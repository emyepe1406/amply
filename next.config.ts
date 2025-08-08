import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    DYNAMODB_USERS_TABLE: process.env.DYNAMODB_USERS_TABLE,
    DYNAMODB_COURSES_TABLE: process.env.DYNAMODB_COURSES_TABLE,
    DYNAMODB_PROGRESS_TABLE: process.env.DYNAMODB_PROGRESS_TABLE,
    DYNAMODB_TESTIMONIALS_TABLE: process.env.DYNAMODB_TESTIMONIALS_TABLE,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  },
};

export default nextConfig;
