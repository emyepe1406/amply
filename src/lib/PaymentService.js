const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

class PaymentService {
  constructor() {
    // Use environment-specific AWS credentials
    const isProduction = process.env.NODE_ENV === 'production' || 
                        (typeof window === 'undefined' && process.env.NEXT_PUBLIC_BASE_URL?.includes('amplifyapp.com'));
    
    const credentials = isProduction ? {
      accessKeyId: process.env.AMPLIFY_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY,
    } : {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };

    const client = new DynamoDBClient({
      region: process.env.AMPLIFY_AWS_REGION || process.env.AWS_REGION || 'us-east-1',
      credentials,
    });
    
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.DYNAMODB_PAYMENTS_TABLE || 'lms-payments';
  }

  // Create a new payment record
  async createPayment(paymentData) {
    const payment = {
      id: uuidv4(),
      ...paymentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: payment,
    });

    try {
      await this.docClient.send(command);
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Get payment by ID
  async getPaymentById(paymentId) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id: paymentId },
    });

    try {
      const result = await this.docClient.send(command);
      return result.Item;
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  // Get payment by order ID
  async getPaymentByOrderId(orderId) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'OrderIdIndex',
      KeyConditionExpression: 'orderId = :orderId',
      ExpressionAttributeValues: {
        ':orderId': orderId,
      },
    });

    try {
      const result = await this.docClient.send(command);
      return result.Items?.[0]; // Return first match
    } catch (error) {
      console.error('Error getting payment by order ID:', error);
      throw error;
    }
  }

  // Get payment by transaction ID
  async getPaymentByTransactionId(transactionId) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'TransactionIdIndex',
      KeyConditionExpression: 'transactionId = :transactionId',
      ExpressionAttributeValues: {
        ':transactionId': transactionId,
      },
    });

    try {
      const result = await this.docClient.send(command);
      return result.Items?.[0]; // Return first match
    } catch (error) {
      console.error('Error getting payment by transaction ID:', error);
      throw error;
    }
  }

  // Get all payments by user ID
  async getPaymentsByUserId(userId) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by creation date descending
    });

    try {
      const result = await this.docClient.send(command);
      return result.Items || [];
    } catch (error) {
      console.error('Error getting payments by user ID:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(paymentId, status, additionalData = {}) {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id: paymentId },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    // Add additional data to update if provided
    if (Object.keys(additionalData).length > 0) {
      const additionalUpdates = Object.keys(additionalData)
        .map((key, index) => `#attr${index} = :val${index}`)
        .join(', ');
      
      command.input.UpdateExpression += `, ${additionalUpdates}`;
      
      Object.keys(additionalData).forEach((key, index) => {
        command.input.ExpressionAttributeNames[`#attr${index}`] = key;
        command.input.ExpressionAttributeValues[`:val${index}`] = additionalData[key];
      });
    }

    try {
      const result = await this.docClient.send(command);
      return result.Attributes;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get successful payments for a user (for purchase history)
  async getSuccessfulPaymentsByUserId(userId) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':status': 'success',
      },
      ScanIndexForward: false, // Sort by creation date descending
    });

    try {
      const result = await this.docClient.send(command);
      return result.Items || [];
    } catch (error) {
      console.error('Error getting successful payments by user ID:', error);
      throw error;
    }
  }
}

module.exports = PaymentService;