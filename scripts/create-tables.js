const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config({ path: '.env.local' });

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const tables = [
  {
    TableName: process.env.DYNAMODB_USERS_TABLE || 'lms-users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'username', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'username-index',
        KeySchema: [
          { AttributeName: 'username', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMODB_COURSES_TABLE || 'lms-courses',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMODB_PROGRESS_TABLE || 'lms-progress',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'courseId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
      {
        IndexName: 'courseId-index',
        KeySchema: [
          { AttributeName: 'courseId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
  {
    TableName: process.env.DYNAMODB_TESTIMONIALS_TABLE || 'lms-testimonials',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'courseId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
      {
        IndexName: 'courseId-index',
        KeySchema: [
          { AttributeName: 'courseId', KeyType: 'HASH' },
        ],
        Projection: { ProjectionType: 'ALL' },
        BillingMode: 'PAY_PER_REQUEST',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
];

async function createTable(tableConfig) {
  try {
    // Check if table already exists
    try {
      await client.send(new DescribeTableCommand({ TableName: tableConfig.TableName }));
      console.log(`✅ Table ${tableConfig.TableName} already exists`);
      return;
    } catch (error) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    // Create table
    console.log(`🔄 Creating table ${tableConfig.TableName}...`);
    await client.send(new CreateTableCommand(tableConfig));
    console.log(`✅ Table ${tableConfig.TableName} created successfully`);
  } catch (error) {
    console.error(`❌ Error creating table ${tableConfig.TableName}:`, error.message);
    throw error;
  }
}

async function createAllTables() {
  console.log('🚀 Starting DynamoDB table creation...');
  
  try {
    for (const table of tables) {
      await createTable(table);
    }
    
    console.log('\n🎉 All tables created successfully!');
    console.log('\nCreated tables:');
    tables.forEach(table => {
      console.log(`  - ${table.TableName}`);
    });
    
  } catch (error) {
    console.error('\n❌ Failed to create tables:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  createAllTables();
}

module.exports = { createAllTables };