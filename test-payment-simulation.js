require('dotenv').config({ path: '.env.local' });

// Simulasi pembayaran dengan kartu kredit Visa
async function simulatePayment() {
  const fetch = (await import('node-fetch')).default;
  
  const baseUrl = 'http://localhost:3000';
  
  console.log('🚀 Memulai simulasi pembayaran...');
  console.log('💳 Menggunakan kartu Visa: 4811 1111 1111 1114');
  console.log('📅 CVV: 123, Expiry: 12/25');
  console.log('');
  
  try {
    // Step 1: Login sebagai user biasa (bukan admin)
    console.log('1️⃣ Login sebagai user...');
    let cookies = '';
    let userId = '';
    
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
      console.log('❌ Login gagal, mencoba dengan kredensial lain...');
      // Coba dengan user test_user
      const loginResponse2 = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'test_user',
          password: 'test123'
        })
      });
      
      if (!loginResponse2.ok) {
        console.log('❌ Login dengan user test juga gagal');
        console.log('ℹ️ Silakan buat user baru atau gunakan kredensial yang benar');
        return;
      }
      
      const loginData2 = await loginResponse2.json();
      console.log('✅ Login berhasil dengan test user:', loginData2.user.username);
      
      // Extract cookies dan user data
      cookies = loginResponse2.headers.get('set-cookie') || '';
      userId = loginData2.user.id;
    } else {
      const loginData = await loginResponse.json();
      console.log('✅ Login berhasil:', loginData.user.username);
      
      // Extract cookies dan user data
      cookies = loginResponse.headers.get('set-cookie') || '';
      userId = loginData.user.id;
    }
    
    console.log(`👤 User ID: ${userId}`);
    
    // Step 2: Pilih kursus untuk dibeli (Driver Truk)
    console.log('\n2️⃣ Memilih kursus: Driver Truk');
    const selectedCourse = {
      id: 'driver-truk',
      title: 'Driver Truk',
      price: 150000
    };
    
    console.log(`📚 Kursus: ${selectedCourse.title}`);
    console.log(`💰 Harga: Rp ${selectedCourse.price.toLocaleString('id-ID')}`);
    
    // Step 3: Simulasi checkout (buat order ID)
    console.log('\n3️⃣ Membuat order untuk pembayaran...');
    // Format order ID: COURSE_{userIdShort}_{courseId}_{timestamp}
    // Gunakan 8 karakter terakhir dari userId untuk userIdShort
    const userIdShort = userId.slice(-8);
    const orderId = `COURSE_${userIdShort}_${selectedCourse.id}_${Date.now()}`;
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔑 User ID Short: ${userIdShort}`);
    
    console.log(`🆔 Order ID: ${orderId}`);
    console.log(`🔢 Transaction ID: ${transactionId}`);
    
    // Step 4: Simulasi pembayaran Midtrans dengan kartu kredit
    console.log('\n4️⃣ Simulasi pembayaran dengan kartu kredit Visa...');
    
    // Generate signature yang benar
    const crypto = require('crypto');
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-dummy';
    const statusCode = '200';
    const grossAmount = selectedCourse.price.toString();
    
    // Generate signature: SHA512(order_id + status_code + gross_amount + server_key)
    const signatureString = orderId + statusCode + grossAmount + serverKey;
    const signature = crypto.createHash('sha512').update(signatureString).digest('hex');
    
    // Data pembayaran yang akan dikirim ke webhook Midtrans
    const paymentData = {
      transaction_time: new Date().toISOString().replace('T', ' ').substr(0, 19),
      transaction_status: 'capture', // Status sukses untuk kartu kredit
      transaction_id: transactionId,
      status_message: 'midtrans payment notification',
      status_code: statusCode,
      signature_key: signature,
      payment_type: 'credit_card',
      order_id: orderId,
      merchant_id: process.env.MIDTRANS_MERCHANT_ID || 'dummy_merchant',
      masked_card: '481111-1114', // Visa card yang digunakan
      gross_amount: grossAmount,
      fraud_status: 'accept',
      eci: '05',
      currency: 'IDR',
      channel_response_message: 'Approved',
      channel_response_code: '00',
      card_type: 'credit',
      bank: 'visa',
      approval_code: '1578569243'
    };
    
    console.log('💳 Detail Kartu:');
    console.log(`   - Nomor: 4811 1111 1111 1114 (Visa)`);
    console.log(`   - CVV: 123`);
    console.log(`   - Expiry: 12/25`);
    console.log(`   - Status: ${paymentData.transaction_status}`);
    console.log(`   - Bank: ${paymentData.bank}`);
    
    // Step 5: Kirim notifikasi ke webhook Midtrans
    console.log('\n5️⃣ Mengirim notifikasi pembayaran ke sistem...');
    
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
      console.log('📄 Response:', webhookResult);
    } else {
      console.log('❌ Gagal memproses pembayaran');
      console.log('Status:', webhookResponse.status);
      const errorText = await webhookResponse.text();
      console.log('Error:', errorText);
    }
    
    // Step 6: Verifikasi pembayaran di history
    console.log('\n6️⃣ Memverifikasi pembayaran di history...');
    
    const historyResponse = await fetch(`${baseUrl}/api/payments/history`, {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ History pembayaran berhasil diambil');
      
      // Cari pembayaran yang baru saja dibuat
      const recentPayment = historyData.payments.find(p => p.orderId === orderId);
      
      if (recentPayment) {
        console.log('🎉 Pembayaran ditemukan di history!');
        console.log(`   - Course: ${recentPayment.courseTitle || selectedCourse.title}`);
        console.log(`   - Amount: Rp ${recentPayment.amount.toLocaleString('id-ID')}`);
        console.log(`   - Status: ${recentPayment.status}`);
        console.log(`   - Payment Method: ${recentPayment.paymentMethod}`);
        console.log(`   - Purchase Date: ${new Date(recentPayment.purchaseDate).toLocaleString('id-ID')}`);
        console.log(`   - Expiry Date: ${new Date(recentPayment.expiryDate).toLocaleString('id-ID')}`);
      } else {
        console.log('⚠️ Pembayaran belum muncul di history (mungkin perlu waktu untuk sinkronisasi)');
      }
      
      console.log(`\n📊 Total pembayaran di history: ${historyData.payments.length}`);
    } else {
      console.log('❌ Gagal mengambil history pembayaran');
    }
    
    console.log('\n🎯 Simulasi pembayaran selesai!');
    console.log('💡 Pembayaran dengan kartu Visa 4811 1111 1111 1114 berhasil diproses');
    
  } catch (error) {
    console.error('❌ Error dalam simulasi pembayaran:', error.message);
  }
}

// Jalankan simulasi
simulatePayment();