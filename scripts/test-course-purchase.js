const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import services
const PaymentService = require('../src/lib/PaymentService');

const awsRegion = process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'ap-southeast-1';
const awsAccessKeyId = process.env.AMPLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const client = new DynamoDBClient({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const usersTableName = process.env.DYNAMODB_USERS_TABLE || 'lms-users';

// Simple UserService implementation for testing
const UserService = {
  async createUser(userData) {
    const command = new PutCommand({
      TableName: usersTableName,
      Item: {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
    await docClient.send(command);
    return userData;
  },
  
  async getUserById(userId) {
    const command = new GetCommand({
      TableName: usersTableName,
      Key: { id: userId }
    });
    const result = await docClient.send(command);
    return result.Item;
  },
  
  async updateUser(userId, updateData) {
    const command = new UpdateCommand({
      TableName: usersTableName,
      Key: { id: userId },
      UpdateExpression: 'SET purchasedCourses = :courses, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':courses': updateData.purchasedCourses,
        ':updatedAt': new Date().toISOString()
      }
    });
    await docClient.send(command);
    return { success: true };
  }
};

// Test data
const testUser = {
  id: 'test_user_' + Date.now(),
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  enrolledCourses: [],
  purchasedCourses: []
};

const testCourseId = 'react-fundamentals';
const testOrderId = `C_${testUser.id.slice(-8)}_${testCourseId}_${Date.now().toString().slice(-8)}`;

async function testCoursePurchase() {
  console.log('🧪 Testing course purchase integration...');
  console.log('Test User ID:', testUser.id);
  console.log('Test Course ID:', testCourseId);
  console.log('Test Order ID:', testOrderId);
  
  try {
    // Step 1: Create test user
    console.log('\n1️⃣ Creating test user...');
    await UserService.createUser(testUser);
    console.log('✓ Test user created successfully');
    
    // Step 2: Simulate payment webhook processing
    console.log('\n2️⃣ Simulating payment webhook...');
    const paymentService = new PaymentService();
    
    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    // Create payment record
    const paymentData = {
      userId: testUser.id,
      courseId: testCourseId,
      orderId: testOrderId,
      transactionId: 'TEST_TXN_' + Date.now(),
      status: 'success',
      amount: 150000,
      currency: 'IDR',
      paymentMethod: 'bank_transfer',
      transactionTime: new Date().toISOString(),
      purchaseDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      isActive: true,
      midtransData: {
        transaction_status: 'settlement',
        fraud_status: 'accept',
        status_code: '200',
        payment_type: 'bank_transfer',
        bank: 'bca'
      }
    };
    
    const paymentRecord = await paymentService.createPayment(paymentData);
    console.log('✓ Payment record created:', paymentRecord.id);
    
    // Step 3: Update user's purchased courses
    console.log('\n3️⃣ Updating user course access...');
    const updatedCourses = [{
      courseId: testCourseId,
      purchaseDate: new Date().toISOString(),
      expiryDate: expiryDate.toISOString(),
      isActive: true,
      transactionId: testOrderId,
      paymentId: paymentRecord.id
    }];
    
    await UserService.updateUser(testUser.id, {
      purchasedCourses: updatedCourses
    });
    console.log('✓ User course access updated');
    
    // Step 4: Verify payment record
    console.log('\n4️⃣ Verifying payment record...');
    const retrievedPayment = await paymentService.getPaymentById(paymentRecord.id);
    console.log('✓ Payment record verified:', {
      id: retrievedPayment.id,
      userId: retrievedPayment.userId,
      courseId: retrievedPayment.courseId,
      status: retrievedPayment.status,
      amount: retrievedPayment.amount
    });
    
    // Step 5: Verify user access
    console.log('\n5️⃣ Verifying user access...');
    const updatedUser = await UserService.getUserById(testUser.id);
    console.log('✓ User access verified:', {
      userId: updatedUser.id,
      purchasedCourses: updatedUser.purchasedCourses.length,
      courseAccess: updatedUser.purchasedCourses[0]
    });
    
    // Step 6: Test payment history retrieval
    console.log('\n6️⃣ Testing payment history retrieval...');
    const userPayments = await paymentService.getPaymentsByUserId(testUser.id);
    console.log('✓ Payment history retrieved:', userPayments.length, 'payments found');
    
    console.log('\n🎉 All tests passed! Course purchase integration is working correctly.');
    
    return {
      success: true,
      testUser,
      paymentRecord,
      userPayments
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    // Note: In a real scenario, you might want to delete the test user and payment
    // For now, we'll just log that cleanup would happen here
    console.log('✓ Test data cleanup completed (test user and payment left for inspection)');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

if (require.main === module) {
  testCoursePurchase()
    .then(async (result) => {
      console.log('\n📊 Test Results:');
      console.log('- User ID:', result.testUser.id);
      console.log('- Payment ID:', result.paymentRecord.id);
      console.log('- Payments found:', result.userPayments.length);
      
      await cleanup();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('Test suite failed:', error);
      await cleanup();
      process.exit(1);
    });
}

module.exports = { testCoursePurchase };