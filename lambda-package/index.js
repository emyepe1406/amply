const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

// AWS Configuration
const REGION = process.env.AWS_REGION || 'ap-southeast-1';
const PAYMENTS_TABLE = process.env.DYNAMODB_PAYMENTS_TABLE || 'lms-payments-prod';
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'lms-users';

// Initialize DynamoDB clients
const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

class PaymentSyncService {
  async syncAllUsers() {
    try {
      console.log('Starting payment sync...');
      
      // Get all successful payments
      const payments = await this.getSuccessfulPayments();
      console.log(`Found ${payments.length} successful payments`);
      
      if (payments.length === 0) {
        return { success: true, message: 'No payments to sync' };
      }
      
      // Group payments by user
      const userPayments = this.groupPaymentsByUser(payments);
      console.log(`Found ${Object.keys(userPayments).length} users with payments`);
      
      let syncedCount = 0;
      let failedCount = 0;
      
      // Sync each user
      for (const [userId, userPaymentsList] of Object.entries(userPayments)) {
        try {
          await this.syncUserPayments(userId, userPaymentsList);
          syncedCount++;
          console.log(`✅ Synced user: ${userId}`);
        } catch (error) {
          failedCount++;
          console.error(`❌ Failed to sync user: ${userId}`, error.message);
        }
      }
      
      return {
        success: true,
        syncedCount,
        failedCount,
        totalUsers: Object.keys(userPayments).length
      };
      
    } catch (error) {
      console.error('Error in syncAllUsers:', error);
      throw error;
    }
  }
  
  async getSuccessfulPayments() {
    const params = {
      TableName: PAYMENTS_TABLE,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'success'
      }
    };
    
    const result = await docClient.send(new ScanCommand(params));
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
      // Get current user data
      const user = await this.getUserById(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }
      
      // Build new purchasedCourses array
      const purchasedCourses = this.buildPurchasedCourses(payments);
      
      // Update user with new purchasedCourses
      const params = {
        TableName: USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: 'SET purchasedCourses = :purchasedCourses, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':purchasedCourses': purchasedCourses,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'UPDATED_NEW'
      };
      
      await docClient.send(new UpdateCommand(params));
      
    } catch (error) {
      console.error(`Error syncing user ${userId}:`, error);
      throw error;
    }
  }
  
  async getUserById(userId) {
    const params = {
      TableName: USERS_TABLE,
      Key: { id: userId }
    };
    
    const result = await docClient.send(new GetCommand(params));
    return result.Item;
  }
  
  buildPurchasedCourses(payments) {
    return payments.map(payment => ({
      courseId: payment.courseId,
      purchaseDate: payment.purchaseDate,
      expiryDate: payment.expiryDate,
      isActive: payment.isActive,
      paymentId: payment.id,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod
    }));
  }
}

// Lambda handler
exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const service = new PaymentSyncService();
    const result = await service.syncAllUsers();
    
    console.log('Sync completed:', result);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Payment sync completed successfully',
        result: result
      })
    };
    
  } catch (error) {
    console.error('Error in Lambda handler:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Payment sync failed',
        error: error.message,
        stack: error.stack
      })
    };
  }
};