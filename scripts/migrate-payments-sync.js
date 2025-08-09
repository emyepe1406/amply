#!/usr/bin/env node

/**
 * Migration Script: Sync lms-payments dengan user.purchasedCourses
 * 
 * Script ini akan:
 * 1. Membaca semua payment sukses dari lms-payments
 * 2. Update user.purchasedCourses untuk semua user
 * 3. Validasi integritas data
 * 4. Generate report migrasi
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });

class PaymentSyncService {
  constructor() {
    const awsRegion = process.env.AMPLIFY_AWS_REGION || 'ap-southeast-1';
    const awsAccessKeyId = process.env.AMPLIFY_AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY;

    const client = new DynamoDBClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey
      }
    });

    this.docClient = DynamoDBDocumentClient.from(client);
    this.paymentsTable = process.env.DYNAMODB_PAYMENTS_TABLE || 'lms-payments';
    this.usersTable = process.env.DYNAMODB_USERS_TABLE || 'lms-users';
  }

  async syncAllPayments() {
    console.log('🔄 Starting payment sync process...');
    
    try {
      // 1. Ambil semua payments sukses
      const successfulPayments = await this.getAllSuccessfulPayments();
      console.log(`📊 Found ${successfulPayments.length} successful payments`);

      // 2. Group by userId
      const paymentsByUser = this.groupPaymentsByUser(successfulPayments);
      console.log(`👥 Found ${Object.keys(paymentsByUser).length} users with payments`);

      // 3. Update user.purchasedCourses untuk setiap user
      const results = [];
      for (const [userId, payments] of Object.entries(paymentsByUser)) {
        const result = await this.syncUserPayments(userId, payments);
        results.push(result);
      }

      // 4. Generate report
      this.generateReport(results);

      console.log('✅ Payment sync completed successfully!');
      return results;

    } catch (error) {
      console.error('❌ Error during sync:', error);
      throw error;
    }
  }

  async getAllSuccessfulPayments() {
    const command = new ScanCommand({
      TableName: this.paymentsTable,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'success'
      }
    });

    const result = await this.docClient.send(command);
    return result.Items || [];
  }

  groupPaymentsByUser(payments) {
    return payments.reduce((acc, payment) => {
      const userId = payment.userId;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(payment);
      return acc;
    }, {});
  }

  async syncUserPayments(userId, payments) {
    try {
      // Ambil user data
      const user = await this.getUserById(userId);
      if (!user) {
        return { userId, status: 'USER_NOT_FOUND', count: 0 };
      }

      // Konversi payments ke format purchasedCourses
      const newPurchasedCourses = payments.map(payment => ({
        courseId: payment.courseId,
        purchaseDate: payment.purchaseDate,
        expiryDate: payment.expiryDate,
        isActive: payment.isActive,
        transactionId: payment.transactionId,
        amount: payment.amount
      }));

      // Merge dengan existing purchasedCourses
      const existingCourses = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];
      const mergedCourses = this.mergeCourseAccess(existingCourses, newPurchasedCourses);

      // Update user
      await this.updateUserPurchasedCourses(userId, mergedCourses);

      return {
        userId,
        status: 'SUCCESS',
        count: newPurchasedCourses.length,
        totalCourses: mergedCourses.length
      };

    } catch (error) {
      return {
        userId,
        status: 'ERROR',
        error: error.message
      };
    }
  }

  async getUserById(userId) {
    const command = new GetCommand({
      TableName: this.usersTable,
      Key: { id: userId }
    });

    const result = await this.docClient.send(command);
    return result.Item;
  }

  mergeCourseAccess(existing, newCourses) {
    const courseMap = new Map();

    // Tambahkan existing courses
    existing.forEach(course => {
      courseMap.set(course.courseId, course);
    });

    // Tambahkan/overwrite dengan new courses
    newCourses.forEach(course => {
      courseMap.set(course.courseId, course);
    });

    return Array.from(courseMap.values());
  }

  async updateUserPurchasedCourses(userId, courses) {
    const command = new UpdateCommand({
      TableName: this.usersTable,
      Key: { id: userId },
      UpdateExpression: 'SET purchasedCourses = :courses, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':courses': courses,
        ':updatedAt': new Date().toISOString()
      }
    });

    await this.docClient.send(command);
  }

  generateReport(results) {
    console.log('\n📋 Migration Report:');
    console.log('===================');
    
    const successful = results.filter(r => r.status === 'SUCCESS');
    const failed = results.filter(r => r.status === 'ERROR');
    const notFound = results.filter(r => r.status === 'USER_NOT_FOUND');

    console.log(`✅ Successful: ${successful.length} users`);
    console.log(`❌ Failed: ${failed.length} users`);
    console.log(`⚠️  User not found: ${notFound.length} users`);

    if (failed.length > 0) {
      console.log('\n❌ Failed Users:');
      failed.forEach(r => console.log(`  - ${r.userId}: ${r.error}`));
    }

    if (notFound.length > 0) {
      console.log('\n⚠️  Users not found:');
      notFound.forEach(r => console.log(`  - ${r.userId}`));
    }

    console.log(`\n📊 Total courses synced: ${successful.reduce((sum, r) => sum + r.count, 0)}`);
  }
}

// Main execution
if (require.main === module) {
  const syncService = new PaymentSyncService();
  
  syncService.syncAllPayments()
    .then(() => {
      console.log('🎉 Migration completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = PaymentSyncService;