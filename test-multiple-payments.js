require('dotenv').config({ path: '.env.local' });

// Simulasi multiple pembayaran dengan berbagai kursus dan metode pembayaran
async function simulateMultiplePayments() {
  const fetch = (await import('node-fetch')).default;
  const crypto = require('crypto');
  
  const baseUrl = 'http://localhost:3000';
  
  console.log('🚀 Memulai simulasi multiple pembayaran...');
  console.log('💳 Menggunakan berbagai metode pembayaran');
  console.log('');
  
  try {
    // Login sebagai user demo
    console.log('1️⃣ Login sebagai user demo...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'demo',
        password: 'demo123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login gagal');
      return;
    }
    
    const loginData = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie') || '';
    const userId = loginData.user.id;
    const userIdShort = userId.slice(-8);
    
    console.log('✅ Login berhasil:', loginData.user.username);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🔑 User ID Short: ${userIdShort}`);
    
    // Daftar kursus untuk simulasi
    const courses = [
      { id: 'driver-bis', title: 'Driver Bis', icon: '🚌' },
      { id: 'driver-taxi', title: 'Driver Taxi', icon: '🚕' },
      { id: 'ground-handling', title: 'Ground Handling', icon: '✈️' },
      { id: 'building-cleaning', title: 'Building Cleaning', icon: '🧹' },
      { id: 'restoran', title: 'Restoran', icon: '🍽️' }
    ];
    
    // Metode pembayaran untuk simulasi
    const paymentMethods = [
      {
        type: 'credit_card',
        name: 'Kartu Kredit Visa',
        card: '4811 1111 1111 1114',
        bank: 'visa',
        transaction_status: 'capture'
      },
      {
        type: 'bank_transfer',
        name: 'Transfer Bank BCA',
        bank: 'bca',
        transaction_status: 'settlement'
      },
      {
        type: 'gopay',
        name: 'GoPay',
        transaction_status: 'settlement'
      },
      {
        type: 'credit_card',
        name: 'Kartu Kredit Mastercard',
        card: '5555 5555 5555 4444',
        bank: 'mastercard',
        transaction_status: 'capture'
      },
      {
        type: 'bank_transfer',
        name: 'Transfer Bank Mandiri',
        bank: 'mandiri',
        transaction_status: 'settlement'
      }
    ];
    
    console.log('\n2️⃣ Memulai simulasi pembayaran untuk berbagai kursus...');
    
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const paymentMethod = paymentMethods[i];
      const coursePrice = 150000;
      
      console.log(`\n--- Pembayaran ${i + 1}/5 ---`);
      console.log(`📚 Kursus: ${course.icon} ${course.title}`);
      console.log(`💳 Metode: ${paymentMethod.name}`);
      
      // Buat order ID
      const timestamp = Date.now() + (i * 1000); // Tambah delay untuk unique timestamp
      const orderId = `COURSE_${userIdShort}_${course.id}_${timestamp}`;
      const transactionId = `TXN_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`🆔 Order ID: ${orderId}`);
      
      // Generate signature
      const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy';
      const statusCode = '200';
      const grossAmount = coursePrice.toString();
      const signatureString = orderId + statusCode + grossAmount + serverKey;
      const signature = crypto.createHash('sha512').update(signatureString).digest('hex');
      
      // Data pembayaran
      const paymentData = {
        transaction_time: new Date(timestamp).toISOString().replace('T', ' ').substr(0, 19),
        transaction_status: paymentMethod.transaction_status,
        transaction_id: transactionId,
        status_message: 'midtrans payment notification',
        status_code: statusCode,
        signature_key: signature,
        payment_type: paymentMethod.type,
        order_id: orderId,
        merchant_id: process.env.MIDTRANS_MERCHANT_ID || 'dummy_merchant',
        gross_amount: grossAmount,
        fraud_status: 'accept',
        currency: 'IDR'
      };
      
      // Tambahkan data spesifik berdasarkan metode pembayaran
      if (paymentMethod.type === 'credit_card') {
        paymentData.masked_card = paymentMethod.card.replace(/\s/g, '').replace(/(\d{6})(\d{6})(\d{4})/, '$1-$3');
        paymentData.card_type = 'credit';
        paymentData.bank = paymentMethod.bank;
        paymentData.eci = '05';
        paymentData.channel_response_message = 'Approved';
        paymentData.channel_response_code = '00';
        paymentData.approval_code = Math.random().toString().substr(2, 10);
      } else if (paymentMethod.type === 'bank_transfer') {
        paymentData.bank = paymentMethod.bank;
        paymentData.va_numbers = [{
          bank: paymentMethod.bank,
          va_number: '8562000' + Math.random().toString().substr(2, 8)
        }];
      }
      
      // Kirim notifikasi pembayaran
      console.log('💰 Memproses pembayaran...');
      
      const webhookResponse = await fetch(`${baseUrl}/api/payment/midtrans/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies
        },
        body: JSON.stringify(paymentData)
      });
      
      if (webhookResponse.ok) {
        const webhookResult = await webhookResponse.json();
        console.log('✅ Pembayaran berhasil diproses!');
      } else {
        console.log('❌ Gagal memproses pembayaran');
        console.log('Status:', webhookResponse.status);
      }
      
      // Delay sebelum pembayaran berikutnya
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Verifikasi semua pembayaran
    console.log('\n3️⃣ Memverifikasi semua pembayaran...');
    
    const historyResponse = await fetch(`${baseUrl}/api/payments/history`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ History pembayaran berhasil diambil');
      console.log(`📊 Total pembayaran: ${historyData.payments.length}`);
      
      // Tampilkan 5 pembayaran terbaru
      console.log('\n🎯 5 Pembayaran Terbaru:');
      historyData.payments.slice(0, 5).forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.courseTitle || 'Unknown Course'} - ${payment.paymentMethod} - ${payment.status} - Rp ${payment.amount.toLocaleString('id-ID')}`);
      });
    }
    
    console.log('\n🎉 Simulasi multiple pembayaran selesai!');
    console.log('💡 Berbagai metode pembayaran telah berhasil diproses');
    
  } catch (error) {
    console.error('❌ Error dalam simulasi pembayaran:', error.message);
  }
}

// Jalankan simulasi
simulateMultiplePayments();