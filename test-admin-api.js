async function testAdminTransactionsAPI() {
  const fetch = (await import('node-fetch')).default;
  console.log('=== Testing Admin Transactions API ===\n');
  
  try {
    // First, login to get authentication cookie
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('Login Response Status:', loginResponse.status);
    const loginData = await loginResponse.text();
    console.log('Login Response:', loginData);
    
    if (!loginResponse.ok) {
      console.error('Login failed!');
      return;
    }
    
    // Extract cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Received cookies:', cookies);
    
    // Step 2: Test the admin transactions API with authentication
    console.log('\nStep 2: Testing admin transactions API...');
    const url = 'http://localhost:3000/api/admin/transactions?page=1&limit=20&status=all';
    console.log('Testing URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      }
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response Body:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n--- Parsed Response ---');
        console.log('Success:', data.success);
        console.log('Total transactions:', data.total);
        console.log('Transactions count:', data.transactions?.length || 0);
        
        if (data.transactions && data.transactions.length > 0) {
          console.log('\n--- Transaction Details ---');
          data.transactions.forEach((transaction, index) => {
            console.log(`Transaction ${index + 1}:`);
            console.log('  ID:', transaction.id);
            console.log('  Order ID:', transaction.orderId);
            console.log('  User:', transaction.userEmail);
            console.log('  Course:', transaction.courseTitle);
            console.log('  Amount:', transaction.formattedAmount);
            console.log('  Status:', transaction.status);
            console.log('  Date:', transaction.formattedDate);
            console.log('---');
          });
        }
      } catch (parseError) {
        console.log('Failed to parse JSON response:', parseError.message);
      }
    } else {
      console.log('API request failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('Error testing admin API:', error);
  }
}

// Run the test
testAdminTransactionsAPI().catch(console.error);