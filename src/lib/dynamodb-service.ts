import { PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TABLES } from './aws-config';
import { User, Course, UserProgress, Testimonial } from '@/types';
import bcrypt from 'bcryptjs';

// Helper function to check if DynamoDB is available
function ensureDynamoDb() {
  if (!dynamoDb) {
    throw new Error('DynamoDB client is not available. Please check your AWS credentials.');
  }
  return dynamoDb;
}

// User Operations
export class UserService {
  static async createUser(user: Omit<User, 'id'> & { password: string }): Promise<User> {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const userData = {
      ...user,
      id,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ensureDynamoDb().send(new PutCommand({
      TableName: TABLES.USERS,
      Item: userData,
    }));

    // Return user without password
    const { password, ...userWithoutPassword } = userData;
    return userWithoutPassword as User;
  }

  static async getUserById(id: string): Promise<User | null> {
    const result = await ensureDynamoDb().send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { id },
    }));

    if (!result.Item) return null;
    
    const { password, ...userWithoutPassword } = result.Item;
    return userWithoutPassword as User;
  }

  static async getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
    const result = await ensureDynamoDb().send(new ScanCommand({
      TableName: TABLES.USERS,
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
    }));

    if (!result.Items || result.Items.length === 0) return null;
    return result.Items[0] as (User & { password: string });
  }

  static async getAllUsers(): Promise<User[]> {
    const result = await ensureDynamoDb().send(new ScanCommand({
      TableName: TABLES.USERS,
    }));

    if (!result.Items) return [];
    
    return result.Items.map(item => {
      const { password, ...userWithoutPassword } = item;
      return userWithoutPassword as User;
    });
  }

  static async updateUser(id: string, updates: Partial<User & { password?: string }>): Promise<User | null> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Handle password hashing if password is being updated
    const processedUpdates = { ...updates };
    if (updates.password && updates.password.trim() !== '') {
      processedUpdates.password = await bcrypt.hash(updates.password, 10);
    } else if (updates.password === '') {
      // If password is empty string, don't update it
      delete processedUpdates.password;
    }

    // Fields that should not be updated
    const excludedFields = ['id', 'createdAt'];
    
    Object.entries(processedUpdates).forEach(([key, value]) => {
      if (!excludedFields.includes(key) && value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressions.length === 0) {
      return await this.getUserById(id);
    }

    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    await ensureDynamoDb().send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    }));

    return await this.getUserById(id);
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      await ensureDynamoDb().send(new DeleteCommand({
        TableName: TABLES.USERS,
        Key: { id },
      }));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}

// Course Operations
export class CourseService {
  static async getAllCourses(): Promise<Course[]> {
    const result = await ensureDynamoDb().send(new ScanCommand({
      TableName: TABLES.COURSES,
    }));

    return result.Items as Course[] || [];
  }

  static async getCourseById(id: string): Promise<Course | null> {
    const result = await ensureDynamoDb().send(new GetCommand({
      TableName: TABLES.COURSES,
      Key: { id },
    }));

    return result.Item as Course || null;
  }

  static async createCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const id = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const courseData = {
      ...course,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ensureDynamoDb().send(new PutCommand({
      TableName: TABLES.COURSES,
      Item: courseData,
    }));

    return courseData as Course;
  }
}

// Progress Operations
export class ProgressService {
  static async getUserProgress(userId: string): Promise<UserProgress[]> {
    const result = await ensureDynamoDb().send(new QueryCommand({
      TableName: TABLES.PROGRESS,
      IndexName: 'UserIdIndex', // Assuming you have a GSI on userId
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    }));

    return result.Items as UserProgress[] || [];
  }

  static async updateProgress(userId: string, courseId: string, progress: number): Promise<UserProgress> {
    const id = `${userId}_${courseId}`;
    const progressData = {
      id,
      userId,
      courseId,
      progress,
      updatedAt: new Date().toISOString(),
    };

    await ensureDynamoDb().send(new PutCommand({
      TableName: TABLES.PROGRESS,
      Item: progressData,
    }));

    return progressData as UserProgress;
  }
}

// Testimonial Operations
export class TestimonialService {
  static async getAllTestimonials(): Promise<Testimonial[]> {
    const result = await ensureDynamoDb().send(new ScanCommand({
      TableName: TABLES.TESTIMONIALS,
    }));

    return result.Items as Testimonial[] || [];
  }

  static async createTestimonial(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const id = `testimonial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const testimonialData = {
      ...testimonial,
      id,
      createdAt: new Date().toISOString(),
    };

    await ensureDynamoDb().send(new PutCommand({
      TableName: TABLES.TESTIMONIALS,
      Item: testimonialData,
    }));

    return testimonialData as Testimonial;
  }
}