# Midtrans Payment Integration Setup Guide

## 🚀 Quick Setup untuk Testing

**Gunakan URL Amplify untuk testing dengan Midtrans Sandbox:**
- **URL Testing**: `https://main.deiuyhkuxaywf.amplifyapp.com`
- **Environment**: Sandbox (tidak perlu ngrok)
- **Webhook**: Berfungsi langsung dengan HTTPS Amplify

## Overview
Sistem pembayaran Midtrans telah dikonfigurasi untuk mendukung environment sandbox dan production secara otomatis dengan webhook notification yang berfungsi di sandbox.

## Keunggulan Midtrans

### ✅ **Midtrans Sandbox:**
- **Webhook notification BEKERJA** di sandbox environment
- **Notification history/log** tersedia di dashboard
- **Simulasi lengkap** dengan berbagai skenario payment
- **Testing cards** tersedia untuk berbagai bank dan status
- **Dokumentasi lengkap** dalam bahasa Indonesia
- **Snap UI** yang modern dan user-friendly

## Environment Configuration

### Development/Testing (Sandbox dengan Amplify URL)
- **Server Key**: Gunakan Sandbox Server Key dari Midtrans Dashboard
- **Client Key**: Gunakan Sandbox Client Key dari Midtrans Dashboard
- **Environment**: `sandbox`
- **Base URL**: `https://main.deiuyhkuxaywf.amplifyapp.com`

### Production
- **Server Key**: Gunakan Production Server Key dari Midtrans Dashboard
- **Client Key**: Gunakan Production Client Key dari Midtrans Dashboard
- **Environment**: `production`
- **Base URL**: Domain production Anda

## Key Features Implemented

### 1. Dynamic Environment Detection
- `src/lib/midtrans.ts` otomatis mendeteksi environment
- Menggunakan production config jika `NODE_ENV=production` atau domain mengandung `amplifyapp.com`
- Menggunakan sandbox config untuk development lokal

### 2. Snap Payment Integration
- `src/app/api/payment/midtrans/course/create/route.ts` untuk course payment
- `src/app/api/payment/midtrans/create/route.ts` untuk subscription payment
- Menggunakan Midtrans Snap untuk UI payment yang modern

### 3. Webhook Notification Handler
- `src/app/api/payment/midtrans/notify/route.ts` menangani notification dari Midtrans
- Verifikasi signature untuk keamanan
- Otomatis memberikan akses course setelah payment berhasil
- Menangani `purchasedCourses` sebagai array dengan expiry date 30 hari

### 4. Frontend Integration
- `src/app/courses/[id]/page.tsx` diupdate untuk menggunakan Midtrans Snap
- Payment popup langsung di halaman tanpa redirect
- Support untuk callback success, pending, error, dan close

### 5. Success Page Enhancement
- `src/app/payment/success/page.tsx` mendukung parameter dari Midtrans (`order_id`)
- Format order ID yang konsisten dan mudah di-parse

## Environment Variables Setup

### Local Development (.env.local)
```env
# Midtrans Configuration (Sandbox)
MIDTRANS_SERVER_KEY=SB-Mid-server_-J-T2lq1eaelp4bAHdCACzV
MIDTRANS_CLIENT_KEY=SB-Mid-client-gMyrpl3ZFmLE0wJG
MIDTRANS_MERCHANT_ID=M116485
```

### Production (.env.production)
```env
# Midtrans Configuration (Production)
MIDTRANS_SERVER_KEY=your_production_server_key
MIDTRANS_CLIENT_KEY=your_production_client_key
MIDTRANS_MERCHANT_ID=your_production_merchant_id
```

### AWS Amplify Console
Tambahkan environment variables berikut di Amplify Console:
```
MIDTRANS_SERVER_KEY=your_production_server_key
MIDTRANS_CLIENT_KEY=your_production_client_key
MIDTRANS_MERCHANT_ID=your_production_merchant_id
NEXT_PUBLIC_BASE_URL=https://your-app.amplifyapp.com
```

## Testing Procedure

### Testing with Amplify URL
1. Configure Midtrans dashboard dengan URL Amplify
2. Buka `https://main.deiuyhkuxaywf.amplifyapp.com`
3. Login dengan akun demo atau buat akun baru
4. Pilih course dan klik "Beli Kursus"
5. Popup Midtrans Snap akan muncul
6. Gunakan test cards untuk simulasi payment:
   - **Success:** 4811 1111 1111 1114
   - **Failure:** 4911 1111 1111 1113
   - **Challenge:** 4411 1111 1111 1118
7. Cek apakah course muncul di dashboard setelah payment success
8. Monitor webhook notifications di application logs

### Production Testing
1. Deploy ke AWS Amplify
2. Pastikan environment variables sudah diset di Amplify Console
3. Test dengan real payment atau Midtrans production sandbox
4. Monitor CloudWatch logs untuk debugging

## Payment Flow

### Course Purchase Flow
1. User klik "Beli Kursus" di halaman course detail
2. System call `/api/payment/midtrans/course/create`
3. Midtrans Snap popup muncul dengan payment options
4. User pilih metode payment dan selesaikan transaksi
5. Midtrans kirim webhook notification ke `/api/payment/midtrans/notify`
6. System verifikasi signature dan update user course access
7. User diarahkan ke halaman success

### Webhook Notification Flow
1. Midtrans kirim POST request ke `/api/payment/midtrans/notify`
2. System verifikasi signature menggunakan server key
3. Extract `order_id`, `transaction_status`, dan `gross_amount`
4. Jika status `settlement` atau `capture`, grant course access
5. Update `purchasedCourses` array dengan course baru
6. Return HTTP 200 response ke Midtrans

## Debugging

### Payment Notification Logs
Cek logs berikut untuk debugging payment issues:
- Environment detection
- Midtrans config being used
- Snap transaction creation
- Payment notification headers
- Signature verification
- User data before/after update
- DynamoDB update results

### Common Issues
1. **Snap popup tidak muncul**: Cek apakah Snap script sudah loaded
2. **Payment success tapi course tidak muncul**: Cek webhook notification logs
3. **Signature verification failed**: Cek server key configuration
4. **Wrong environment config**: Cek environment variables dan URL detection

## Security Notes
- Sandbox credentials hanya untuk development
- Production credentials harus disimpan aman di AWS Amplify
- Jangan commit production credentials ke repository
- Gunakan signature verification untuk semua payment notifications
- Webhook URL harus HTTPS di production

## Midtrans Dashboard
- **Sandbox:** https://dashboard.sandbox.midtrans.com
- **Production:** https://dashboard.midtrans.com
- **Notification History:** Settings > Configuration > Notification

### Required URLs for Midtrans Dashboard

**For Development/Testing (Amplify URL):**

**Payment Notification URL:**
```
https://main.deiuyhkuxaywf.amplifyapp.com/api/payment/midtrans/notify
```

**Finish Redirect URL:**
```
https://main.deiuyhkuxaywf.amplifyapp.com/payment/success
```

**Unfinish Redirect URL:**
```
https://main.deiuyhkuxaywf.amplifyapp.com/courses
```

**Error Redirect URL:**
```
https://main.deiuyhkuxaywf.amplifyapp.com/payment/error
```

**For Production:**
Replace the Amplify URL with your actual production domain.

## Testing Cards (Sandbox)

### Credit Card
- **Visa Success:** 4811 1111 1111 1114
- **Visa Failure:** 4911 1111 1111 1113
- **Visa Challenge:** 4411 1111 1111 1118
- **Mastercard Success:** 5211 1111 1111 1117
- **CVV:** 123
- **Expiry:** 12/25

### Bank Transfer
- **BCA VA:** Otomatis generate VA number
- **BNI VA:** Otomatis generate VA number
- **BRI VA:** Otomatis generate VA number

### E-Wallet
- **GoPay:** Simulasi dengan QR code
- **ShopeePay:** Simulasi dengan redirect

## Next Steps
1. Test thoroughly di local environment dengan berbagai payment methods
2. Setup production Midtrans account
3. Configure production credentials di AWS Amplify
4. Deploy dan test di production environment
5. Monitor payment notifications dan course access
6. Setup monitoring dan alerting untuk payment failures

## Implementasi Lengkap
Sistem pembayaran Midtrans telah diimplementasikan dengan:
1. Snap payment integration untuk UI yang modern
2. Webhook notification handler yang robust
3. Environment variables yang terpisah untuk sandbox/production
4. Testing yang comprehensive dengan berbagai payment methods
5. Monitoring dan logging yang detail

## Support
- **Midtrans Documentation:** https://docs.midtrans.com/en/welcome/index.html
- **Midtrans API Reference:** https://docs.midtrans.com
- **Midtrans Support:** https://support.midtrans.com
- **Technical Contact:** developer@sswlearning.com