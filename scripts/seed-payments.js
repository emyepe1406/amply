const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
require('dotenv').config({ path: '.env.production' });

// AWS Configuration
const credentials = {
  accessKeyId: process.env.AMPLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
};

const client = new DynamoDBClient({
  region: process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'ap-southeast-1',
  credentials,
});

const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_PAYMENTS_TABLE || 'lms-payments-prod';

// Sample payment data
const samplePayments = [
  {
    userId: 'user_1704067200000_abc123def',
    courseId: 'react-fundamentals',
    orderId: 'C_abc123de_react-fundamentals_12345678',
    transactionId: 'TXN_001_2024',
    status: 'success',
    amount: 299000,
    currency: 'IDR',
    paymentMethod: 'bank_transfer',
    transactionTime: '2024-01-15 10:30:00',
    purchaseDate: '2024-01-15T10:30:00.000Z',
    expiryDate: '2024-02-14T10:30:00.000Z',
    isActive: true,
    midtransData: {
      transaction_status: 'settlement',
      fraud_status: 'accept',
      status_code: '200',
      payment_type: 'bank_transfer',
      bank: 'bca'
    }
  },
  {
    userId: 'user_1704067200000_def456ghi',
    courseId: 'javascript-advanced',
    orderId: 'C_def456gh_javascript-advanced_87654321',
    transactionId: 'TXN_002_2024',
    status: 'success',
    amount: 399000,
    currency: 'IDR',
    paymentMethod: 'credit_card',
    transactionTime: '2024-01-16 14:20:00',
    purchaseDate: '2024-01-16T14:20:00.000Z',
    expiryDate: '2024-02-15T14:20:00.000Z',
    isActive: true,
    midtransData: {
      transaction_status: 'capture',
      fraud_status: 'accept',
      status_code: '200',
      payment_type: 'credit_card',
      bank: 'mandiri'
    }
  },
  {
    userId: 'user_1704067200000_ghi789jkl',
    courseId: 'python-basics',
    orderId: 'C_ghi789jk_python-basics_11223344',
    transactionId: 'TXN_003_2024',
    status: 'success',
    amount: 249000,
    currency: 'IDR',
    paymentMethod: 'gopay',
    transactionTime: '2024-01-17 09:15:00',
    purchaseDate: '2024-01-17T09:15:00.000Z',
    expiryDate: '2024-02-16T09:15:00.000Z',
    isActive: true,
    midtransData: {
      transaction_status: 'settlement',
      fraud_status: 'accept',
      status_code: '200',
      payment_type: 'gopay'
    }
  },
  {
    userId: 'user_1704067200000_jkl012mno',
    courseId: 'node-backend',
    orderId: 'C_jkl012mn_node-backend_55667788',
    transactionId: 'TXN_004_2024',
    status: 'pending',
    amount: 349000,
    currency: 'IDR',
    paymentMethod: 'bank_transfer',
    transactionTime: '2024-01-18 16:45:00',
    purchaseDate: '2024-01-18T16:45:00.000Z',
    expiryDate: '2024-02-17T16:45:00.000Z',
    isActive: false,
    midtransData: {
      transaction_status: 'pending',
      fraud_status: 'accept',
      status_code: '201',
      payment_type: 'bank_transfer',
      bank: 'bni'
    }
  },
  {
    userId: 'user_1704067200000_mno345pqr',
    courseId: 'react-fundamentals',
    orderId: 'C_mno345pq_react-fundamentals_99887766',
    transactionId: 'TXN_005_2024',
    status: 'failed',
    amount: 299000,
    currency: 'IDR',
    paymentMethod: 'credit_card',
    transactionTime: '2024-01-19 11:30:00',
    purchaseDate: '2024-01-19T11:30:00.000Z',
    expiryDate: '2024-02-18T11:30:00.000Z',
    isActive: false,
    midtransData: {
      transaction_status: 'deny',
      fraud_status: 'deny',
      status_code: '202',
      payment_type: 'credit_card',
      bank: 'bri'
    }
  }
];

async function seedPayments() {
  console.log('Starting to seed payments data...');
  console.log('Table name:', tableName);
  console.log('Region:', process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'ap-southeast-1');
  
  try {
    for (const paymentData of samplePayments) {
      const payment = {
        id: uuidv4(),
        ...paymentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const command = new PutCommand({
        TableName: tableName,
        Item: payment
      });
      
      await docClient.send(command);
      console.log(`✓ Created payment: ${payment.id} for course ${payment.courseId}`);
    }
    
    console.log('\n✅ Successfully seeded all payment data!');
    console.log(`Total payments created: ${samplePayments.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding payments:', error);
    process.exit(1);
  }
}

// Run the seeding
seedPayments();