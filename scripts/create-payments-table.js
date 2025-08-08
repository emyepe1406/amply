const AWS = require('aws-sdk');
require('dotenv').config({ path: '.env.production' });

// Configure AWS
// Support both AMPLIFY_AWS_ and AWS_ prefixes
const awsRegion = process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'us-east-1';
const awsAccessKeyId = process.env.AMPLIFY_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  region: awsRegion,
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey
});

const dynamodb = new AWS.DynamoDB();

const paymentsTable = {
  TableName: process.env.DYNAMODB_PAYMENTS_TABLE || 'lms-payments-prod',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'orderId', AttributeType: 'S' },
    { AttributeName: 'transactionId', AttributeType: 'S' }
  ],
  BillingMode: 'PAY_PER_REQUEST',
  GlobalSecondaryIndexes: [
    {
      IndexName: 'userId-index',
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'ALL' }
    },
    {
      IndexName: 'orderId-index',
      KeySchema: [
        { AttributeName: 'orderId', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'ALL' }
    },
    {
      IndexName: 'transactionId-index',
      KeySchema: [
        { AttributeName: 'transactionId', KeyType: 'HASH' }
      ],
      Projection: { ProjectionType: 'ALL' }
    }
  ]
};

async function createPaymentsTable() {
  console.log('Creating payments table in AWS DynamoDB...');
  console.log('Region:', awsRegion);
  console.log('Table Name:', paymentsTable.TableName);
  
  try {
    // Check if table already exists
    try {
      await dynamodb.describeTable({ TableName: paymentsTable.TableName }).promise();
      console.log(`✓ Table ${paymentsTable.TableName} already exists`);
      return;
    } catch (error) {
      if (error.code !== 'ResourceNotFoundException') {
        throw error;
      }
    }
    
    // Create the table
    const result = await dynamodb.createTable(paymentsTable).promise();
    console.log(`✓ Table ${paymentsTable.TableName} created successfully`);
    console.log('Table ARN:', result.TableDescription.TableArn);
    
    // Wait for table to become active
    console.log('Waiting for table to become active...');
    await dynamodb.waitFor('tableExists', { TableName: paymentsTable.TableName }).promise();
    console.log(`✓ Table ${paymentsTable.TableName} is now active`);
    
  } catch (error) {
    console.error(`✗ Error creating table ${paymentsTable.TableName}:`, error.message);
    throw error;
  }
}

if (require.main === module) {
  createPaymentsTable()
    .then(() => {
      console.log('\nPayments table setup completed successfully!');
      console.log('You can now use the payments API endpoints.');
    })
    .catch((error) => {
      console.error('\nFailed to create payments table:', error);
      process.exit(1);
    });
}

module.exports = { createPaymentsTable };