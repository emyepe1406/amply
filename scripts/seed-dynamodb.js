const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// AWS Configuration
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const dynamoDb = DynamoDBDocumentClient.from(dynamoClient);

const TABLES = {
  USERS: 'lms-users',
  COURSES: 'lms-courses',
};

// Sample data
const users = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@kinabaru.com',
    role: 'admin',
    enrolledCourses: [],
    progress: {},
    expiryDate: '2025-12-31'
  },
  {
    id: 'student-1',
    username: 'demo_student',
    email: 'demo@student.com',
    role: 'student',
    enrolledCourses: ['driver-bis', 'driver-taxi', 'restoran'],
    progress: {
      'driver-bis': {
        courseId: 'driver-bis',
        completedChapters: [1],
        completedExercises: [],
        examResults: [],
        lastAccessed: '2025-01-14',
        progressPercentage: 33
      }
    },
    expiryDate: '2025-09-30'
  }
];

const userCredentials = {
  'admin': 'admin123',
  'demo_student': 'demo123'
};

const courses = [
  {
    id: 'driver-bis',
    title: 'Driver Bis',
    description: 'Kursus mengemudi bus untuk transportasi umum',
    icon: '🚌',
    logo: '/images/bis.png',
    chapters: [],
    isPopular: true,
    category: 'driver'
  },
  {
    id: 'driver-taxi',
    title: 'Driver Taxi',
    description: 'Kursus mengemudi taksi profesional',
    icon: '🚕',
    logo: '/images/taxi.png',
    chapters: [],
    isPopular: false,
    category: 'driver'
  },
  {
    id: 'restoran',
    title: 'Restoran',
    description: 'Kursus pelayanan restoran dan hospitality',
    icon: '🍽️',
    logo: '/images/restoran.png',
    chapters: [],
    isPopular: false,
    category: 'service'
  }
];

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function seedUsers() {
  console.log('Seeding users to DynamoDB...');
  
  for (const user of users) {
    try {
      const password = userCredentials[user.username] || 'defaultpassword';
      const userData = {
        ...user,
        password,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await dynamoDb.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: userData,
        ConditionExpression: 'attribute_not_exists(id)'
      }));
      
      console.log(`✓ Created user: ${user.username}`);
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log(`- User ${user.username} already exists`);
      } else {
        console.error(`✗ Error creating user ${user.username}:`, error.message);
      }
    }
  }
}

async function seedCourses() {
  console.log('\nSeeding courses to DynamoDB...');
  
  for (const course of courses) {
    try {
      const courseData = {
        ...course,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await dynamoDb.send(new PutCommand({
        TableName: TABLES.COURSES,
        Item: courseData,
        ConditionExpression: 'attribute_not_exists(id)'
      }));
      
      console.log(`✓ Created course: ${course.title}`);
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        console.log(`- Course ${course.title} already exists`);
      } else {
        console.error(`✗ Error creating course ${course.title}:`, error.message);
      }
    }
  }
}

async function seedDatabase() {
  try {
    await seedUsers();
    await seedCourses();
    console.log('\n✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();