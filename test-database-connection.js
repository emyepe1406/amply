const { config } = require('dotenv');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');

// Load environment variables
config({ path: '.env.local' });

// AWS Configuration
const AWS_REGION = process.env.AWS_REGION || 'ap-southeast-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'lms-users';

if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS credentials not found in environment variables');
  process.exit(1);
}

// DynamoDB Client
const dynamoClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDb = DynamoDBDocumentClient.from(dynamoClient);

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection and login functionality...');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check database connection
    console.log('\n1. Testing database connection...');
    const result = await dynamoDb.send(new ScanCommand({
      TableName: USERS_TABLE,
    }));
    
    if (result.Items) {
      console.log(`✅ Database connection successful`);
      console.log(`📊 Found ${result.Items.length} users in database`);
    } else {
      console.log('❌ No users found in database');
      return;
    }
    
    // Test 2: List all users
    console.log('\n2. Users in database:');
    result.Items.forEach((user, index) => {
      console.log(`   ${index + 1}. Username: ${user.username}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Has Password: ${user.password ? '✅' : '❌'}`);
      console.log(`      Password Hash Length: ${user.password ? user.password.length : 0}`);
      console.log('');
    });
    
    // Test 3: Test login for each user
    console.log('3. Testing login functionality:');
    
    const testCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'demo_student', password: 'student123' },
      { username: 'yogi', password: 'password123' }
    ];
    
    for (const cred of testCredentials) {
      console.log(`\n   Testing login for: ${cred.username}`);
      
      // Find user by username or email
      const user = result.Items.find(u => 
        u.username === cred.username || u.email === cred.username
      );
      
      if (!user) {
        console.log(`   ❌ User '${cred.username}' not found in database`);
        continue;
      }
      
      if (!user.password) {
        console.log(`   ❌ User '${cred.username}' has no password hash`);
        continue;
      }
      
      try {
        const isValid = await bcrypt.compare(cred.password, user.password);
        if (isValid) {
          console.log(`   ✅ Login successful for '${cred.username}'`);
        } else {
          console.log(`   ❌ Login failed for '${cred.username}' - wrong password`);
        }
      } catch (error) {
        console.log(`   ❌ Login error for '${cred.username}':`, error.message);
      }
    }
    
    // Test 4: Check AWS configuration
    console.log('\n4. AWS Configuration:');
    console.log(`   Region: ${AWS_REGION}`);
    console.log(`   Access Key ID: ${AWS_ACCESS_KEY_ID ? AWS_ACCESS_KEY_ID.substring(0, 8) + '...' : 'Not set'}`);
    console.log(`   Secret Key: ${AWS_SECRET_ACCESS_KEY ? '***' + AWS_SECRET_ACCESS_KEY.substring(AWS_SECRET_ACCESS_KEY.length - 4) : 'Not set'}`);
    console.log(`   Users Table: ${USERS_TABLE}`);
    
    console.log('\n='.repeat(60));
    console.log('✅ Database connection and login test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    console.error('Error details:', error.message);
    
    if (error.name === 'UnrecognizedClientException') {
      console.error('\n💡 This error usually means:');
      console.error('   - Invalid AWS credentials');
      console.error('   - Incorrect AWS region');
      console.error('   - AWS credentials not properly configured');
    }
    
    if (error.name === 'ResourceNotFoundException') {
      console.error('\n💡 This error means:');
      console.error('   - DynamoDB table does not exist');
      console.error('   - Table name is incorrect');
      console.error('   - Table is in different region');
    }
  }
}

// Run the test
testDatabaseConnection();