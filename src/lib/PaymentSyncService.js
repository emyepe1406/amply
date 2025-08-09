/**
 * Background Payment Sync Service
 * 
 * Service untuk menjaga sinkronisasi antara lms-payments dan user.purchasedCourses
 * Dijalankan secara berkala untuk memastikan data selalu konsisten
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

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

  /**
   * Sync payment untuk user tertentu
   */
  async syncUserPayments(userId) {
    try {
      // 1. Ambil semua payments sukses untuk user ini
      const payments = await this.getUserSuccessfulPayments(userId);
      
      // 2. Ambil user data
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // 3. Konversi payments ke format purchasedCourses
      const paymentCourses = payments.map(payment => ({
        courseId: payment.courseId,
        purchaseDate: payment.purchaseDate,
        expiryDate: payment.expiryDate,
        isActive: payment.isActive,
        transactionId: payment.transactionId,
        amount: payment.amount,
        orderId: payment.orderId,
        paymentMethod: payment.paymentMethod
      }));

      // 4. Merge dengan existing data
      const existingCourses = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];
      const mergedCourses = this.mergeCourseData(existingCourses, paymentCourses);

      // 5. Update jika ada perubahan
      if (this.hasDataChanged(existingCourses, mergedCourses)) {
        await this.updateUserPurchasedCourses(userId, mergedCourses);
        console.log(`✅ Synced ${paymentCourses.length} payments for user ${userId}`);
        return { success: true, updated: true, count: paymentCourses.length };
      } else {
        console.log(`⏭️  No changes needed for user ${userId}`);
        return { success: true, updated: false, count: paymentCourses.length };
      }

    } catch (error) {
      console.error(`❌ Error syncing user ${userId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync semua user yang memiliki payments
   */
  async syncAllUsers() {
    console.log('🔄 Starting background sync for all users...');
    
    try {
      // Ambil semua users yang memiliki payments
      const usersWithPayments = await this.getUsersWithPayments();
      console.log(`📊 Found ${usersWithPayments.length} users with payments`);

      const results = [];
      for (const userId of usersWithPayments) {
        const result = await this.syncUserPayments(userId);
        results.push({ userId, ...result });
      }

      const updated = results.filter(r => r.updated).length;
      console.log(`✅ Background sync completed: ${updated} users updated`);
      
      return results;

    } catch (error) {
      console.error('❌ Background sync failed:', error);
      throw error;
    }
  }

  async getUserSuccessfulPayments(userId) {
    const command = new QueryCommand({
      TableName: this.paymentsTable,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':status': 'success'
      },
      ScanIndexForward: false
    });

    const result = await this.docClient.send(command);
    return result.Items || [];
  }

  async getUsersWithPayments() {
    const command = new QueryCommand({
      TableName: this.paymentsTable,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId <> :null',
      ExpressionAttributeValues: {
        ':null': null
      }
    });

    const result = await this.docClient.send(command);
    const userIds = [...new Set(result.Items?.map(item => item.userId) || [])];
    return userIds;
  }

  async getUserById(userId) {
    const command = new GetCommand({
      TableName: this.usersTable,
      Key: { id: userId }
    });

    const result = await this.docClient.send(command);
    return result.Item;
  }

  mergeCourseData(existing, newCourses) {
    const courseMap = new Map();

    // Prioritize payment data (lebih baru dan akurat)
    newCourses.forEach(course => {
      courseMap.set(course.courseId, {
        ...course,
        syncedFrom: 'payment_system'
      });
    });

    // Tambahkan existing courses yang belum ada di payment system
    existing.forEach(course => {
      if (!courseMap.has(course.courseId)) {
        courseMap.set(course.courseId, {
          ...course,
          syncedFrom: 'legacy_system'
        });
      }
    });

    return Array.from(courseMap.values());
  }

  hasDataChanged(oldData, newData) {
    if (oldData.length !== newData.length) return true;

    const oldMap = new Map(oldData.map(c => [c.courseId, c]));
    const newMap = new Map(newData.map(c => [c.courseId, c]));

    for (const [courseId, newCourse] of newMap) {
      const oldCourse = oldMap.get(courseId);
      if (!oldCourse) return true;
      
      // Cek perubahan penting
      if (oldCourse.expiryDate !== newCourse.expiryDate) return true;
      if (oldCourse.isActive !== newCourse.isActive) return true;
    }

    return false;
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

  /**
   * Validasi integritas data untuk user tertentu
   */
  async validateUserData(userId) {
    try {
      const payments = await this.getUserSuccessfulPayments(userId);
      const user = await this.getUserById(userId);

      if (!user) {
        return { valid: false, error: 'User not found' };
      }

      const purchasedCourses = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];

      // Cek missing payments
      const paymentCourseIds = payments.map(p => p.courseId);
      const purchasedCourseIds = purchasedCourses.map(c => c.courseId);

      const missingInPurchased = paymentCourseIds.filter(id => !purchasedCourseIds.includes(id));
      const missingInPayments = purchasedCourseIds.filter(id => !paymentCourseIds.includes(id));

      return {
        valid: missingInPurchased.length === 0,
        totalPayments: payments.length,
        totalPurchased: purchasedCourses.length,
        missingInPurchased,
        missingInPayments,
        payments,
        purchasedCourses
      };

    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Jalankan validasi untuk semua users
   */
  async validateAllUsers() {
    const usersWithPayments = await this.getUsersWithPayments();
    const results = [];

    for (const userId of usersWithPayments) {
      const validation = await this.validateUserData(userId);
      results.push({ userId, ...validation });
    }

    return results;
  }
}

module.exports = PaymentSyncService;