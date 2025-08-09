const PaymentService = require('./src/lib/PaymentService');

async function debugPaymentsTable() {
  console.log('=== Debugging Payments Table ===\n');
  
  try {
    const paymentService = new PaymentService();
    console.log('PaymentService initialized successfully');
    console.log('Table name:', paymentService.tableName);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    // Try to get all payments
    console.log('\n--- Fetching all payments ---');
    const allPayments = await paymentService.getAllPayments();
    console.log('Total payments found:', allPayments.length);
    
    if (allPayments.length > 0) {
      console.log('\n--- Payment Records ---');
      allPayments.forEach((payment, index) => {
        console.log(`Payment ${index + 1}:`);
        console.log('  ID:', payment.id);
        console.log('  Order ID:', payment.orderId);
        console.log('  Transaction ID:', payment.transactionId);
        console.log('  User ID:', payment.userId);
        console.log('  Course ID:', payment.courseId);
        console.log('  Amount:', payment.amount);
        console.log('  Status:', payment.status);
        console.log('  Created At:', payment.createdAt);
        console.log('  Payment Method:', payment.paymentMethod);
        console.log('---');
      });
    } else {
      console.log('No payments found in the table.');
      console.log('\nThis could mean:');
      console.log('1. The table is empty');
      console.log('2. The table does not exist');
      console.log('3. There are permission issues');
      console.log('4. The table name is incorrect');
      
      // Check environment variables
      console.log('\n--- Environment Check ---');
      console.log('AWS_REGION:', process.env.AWS_REGION || 'not set');
      console.log('AMPLIFY_AWS_REGION:', process.env.AMPLIFY_AWS_REGION || 'not set');
      console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'set' : 'not set');
      console.log('AMPLIFY_AWS_ACCESS_KEY_ID:', process.env.AMPLIFY_AWS_ACCESS_KEY_ID ? 'set' : 'not set');
      console.log('DYNAMODB_PAYMENTS_TABLE:', process.env.DYNAMODB_PAYMENTS_TABLE || 'not set');
    }
    
  } catch (error) {
    console.error('Error debugging payments table:', error);
    console.log('\nPossible issues:');
    console.log('1. DynamoDB table does not exist');
    console.log('2. AWS credentials are not configured properly');
    console.log('3. Network connectivity issues');
    console.log('4. Insufficient permissions');
    
    // Check environment variables
    console.log('\n--- Environment Check ---');
    console.log('AWS_REGION:', process.env.AWS_REGION || 'not set');
    console.log('AMPLIFY_AWS_REGION:', process.env.AMPLIFY_AWS_REGION || 'not set');
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'set' : 'not set');
    console.log('AMPLIFY_AWS_ACCESS_KEY_ID:', process.env.AMPLIFY_AWS_ACCESS_KEY_ID ? 'set' : 'not set');
    console.log('DYNAMODB_PAYMENTS_TABLE:', process.env.DYNAMODB_PAYMENTS_TABLE || 'not set');
  }
}

// Run the debug function
debugPaymentsTable().catch(console.error);