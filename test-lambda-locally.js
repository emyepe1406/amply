// Test script untuk Lambda function
const fs = require('fs');
const path = require('path');

// Mock AWS SDK untuk testing lokal
const mockAWS = {
  DynamoDBClient: class {
    constructor(config) {
      console.log('Mock DynamoDB client created with region:', config.region);
    }
  },
  DynamoDBDocumentClient: {
    from: () => ({
      send: async (command) => {
        console.log('Mock command executed:', command.constructor.name);
        
        if (command.constructor.name === 'ScanCommand') {
          return {
            Items: [
              {
                id: 'test-payment-1',
                userId: 'test-user-1',
                courseId: 'react-fundamentals',
                status: 'success',
                amount: 150000,
                purchaseDate: '2024-01-15T10:30:00.000Z',
                expiryDate: '2024-02-15T10:30:00.000Z',
                isActive: true,
                paymentMethod: 'bank_transfer'
              }
            ]
          };
        }
        
        if (command.constructor.name === 'GetCommand') {
          return {
            Item: {
              id: 'test-user-1',
              name: 'Test User',
              email: 'test@example.com',
              purchasedCourses: []
            }
          };
        }
        
        return {};
      }
    })
  }
};

// Mock the AWS SDK
const originalRequire = require;
require = function(id) {
  if (id === '@aws-sdk/client-dynamodb' || id === '@aws-sdk/lib-dynamodb') {
    return mockAWS;
  }
  return originalRequire(id);
};

// Load and test the Lambda function
console.log('🧪 Testing Lambda function locally...');

// Set environment variables for testing
process.env.DYNAMODB_PAYMENTS_TABLE = 'lms-payments-test';
process.env.DYNAMODB_USERS_TABLE = 'lms-users-test';
process.env.AWS_REGION = 'ap-southeast-1';

// Import the Lambda function
const lambdaFunction = require('./lambda-payment-sync.js');

// Test event
const testEvent = {};
const testContext = {};

// Run the test
async function runTest() {
  try {
    console.log('📋 Running Lambda handler...');
    const result = await lambdaFunction.handler(testEvent, testContext);
    
    console.log('✅ Test completed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    if (result.statusCode === 200) {
      console.log('🎉 Lambda function is ready for deployment!');
    } else {
      console.log('⚠️  Lambda function returned error:', result.body);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Mock console.log to show what's happening
const originalLog = console.log;
console.log = function(...args) {
  const message = args.join(' ');
  if (message.includes('Mock') || message.includes('Test') || message.includes('✅') || message.includes('❌')) {
    originalLog.apply(console, args);
  }
};

runTest();