const AWS = require('aws-sdk');
require('dotenv').config({ path: '.env.production' });

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

const bucketName = process.env.S3_BUCKET_NAME || 'lms-content-prod';
const region = process.env.AWS_REGION || 'us-east-1';

async function createS3Bucket() {
  console.log(`Creating S3 bucket: ${bucketName}`);
  
  try {
    // Create bucket
    const createParams = {
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: region !== 'us-east-1' ? region : undefined
      }
    };
    
    if (region === 'us-east-1') {
      delete createParams.CreateBucketConfiguration;
    }
    
    await s3.createBucket(createParams).promise();
    console.log(`✅ Bucket ${bucketName} created successfully`);
    
    // Set CORS configuration
    const corsParams = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
            AllowedOrigins: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000
          }
        ]
      }
    };
    
    await s3.putBucketCors(corsParams).promise();
    console.log('✅ CORS configuration set successfully');
    
    // Set public read policy for course content
    const policyParams = {
      Bucket: bucketName,
      Policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/courses/*`
          }
        ]
      })
    };
    
    await s3.putBucketPolicy(policyParams).promise();
    console.log('✅ Bucket policy set successfully');
    
    // Create folder structure
    const folders = ['courses/', 'uploads/', 'temp/'];
    
    for (const folder of folders) {
      await s3.putObject({
        Bucket: bucketName,
        Key: folder,
        Body: ''
      }).promise();
      console.log(`✅ Created folder: ${folder}`);
    }
    
    console.log(`\n🎉 S3 bucket ${bucketName} setup completed!`);
    console.log(`📁 Bucket URL: https://${bucketName}.s3.${region}.amazonaws.com`);
    
  } catch (error) {
    if (error.code === 'BucketAlreadyOwnedByYou') {
      console.log(`⚠️  Bucket ${bucketName} already exists and is owned by you`);
    } else if (error.code === 'BucketAlreadyExists') {
      console.log(`❌ Bucket ${bucketName} already exists and is owned by someone else`);
    } else {
      console.error(`❌ Error creating bucket:`, error.message);
    }
  }
}

if (require.main === module) {
  createS3Bucket().catch(console.error);
}

module.exports = { createS3Bucket };