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

const tables = [
  {
    TableName: process.env.DYNAMODB_USERS_TABLE || 'lms-users-prod',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'username-index',
        KeySchema: [
          { AttributeName: 'username', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      },
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },
  {
    TableName: process.env.DYNAMODB_COURSES_TABLE || 'lms-courses-prod',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: process.env.DYNAMODB_PROGRESS_TABLE || 'lms-progress-prod',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'courseId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST',
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-courseId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'courseId', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ]
  },
  {
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
  }
];

async function createTables() {
  console.log('Creating production DynamoDB tables...');
  
  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.TableName}`);
      await dynamodb.createTable(table).promise();
      console.log(`✅ Table ${table.TableName} created successfully`);
      
      // Wait for table to be active
      console.log(`Waiting for table ${table.TableName} to be active...`);
      await dynamodb.waitFor('tableExists', { TableName: table.TableName }).promise();
      console.log(`✅ Table ${table.TableName} is now active`);
      
    } catch (error) {
      if (error.code === 'ResourceInUseException') {
        console.log(`⚠️  Table ${table.TableName} already exists`);
      } else {
        console.error(`❌ Error creating table ${table.TableName}:`, error.message);
      }
    }
  }
  
  console.log('\n🎉 Production tables setup completed!');
}

if (require.main === module) {
  createTables().catch(console.error);
}

module.exports = { createTables };