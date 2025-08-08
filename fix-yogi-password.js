const { config } = require('dotenv');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

// Load environment variables
config({ path: '.env.local' });

// AWS Configuration
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'lms-users';

// DynamoDB Client
const dynamoClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDb = DynamoDBDocumentClient.from(dynamoClient);

async function fixYogiPassword() {
  console.log('🔧 Fixing Yogi password...');
  
  try {
    // First, find yogi's user ID
    const result = await dynamoDb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { id: 'user_1754636773312_yogi' } // Assuming this is yogi's ID
    }));
    
    if (!result.Item) {
      console.log('❌ Yogi user not found');
      return;
    }
    
    console.log('📋 Current yogi user data:');
    console.log('   Username:', result.Item.username);
    console.log('   Email:', result.Item.email);
    console.log('   Current password hash length:', result.Item.password ? result.Item.password.length : 0);
    
    // Hash the correct password
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await dynamoDb.send(new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { id: result.Item.id },
      UpdateExpression: 'SET password = :password, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':password': hashedPassword,
        ':updatedAt': new Date().toISOString()
      }
    }));
    
    console.log('✅ Yogi password updated successfully');
    
    // Test the new password
    const testResult = await bcrypt.compare(newPassword, hashedPassword);
    console.log('🧪 Password test result:', testResult ? '✅ Success' : '❌ Failed');
    
  } catch (error) {
    console.error('❌ Error fixing yogi password:', error);
  }
}

// Run the fix
fixYogiPassword();