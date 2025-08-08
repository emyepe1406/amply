# Sistem Payments LMS

## Overview

Sistem payments telah diperbarui untuk menggunakan tabel terpisah (`lms-payments`) yang memberikan struktur data yang lebih baik dan kemampuan audit yang lengkap.

## Arsitektur Database

### Tabel `lms-payments`

**Primary Key:**
- `id` (String) - Unique payment ID

**Attributes:**
- `userId` (String) - ID pengguna yang melakukan pembayaran
- `courseId` (String) - ID kursus yang dibeli
- `orderId` (String) - Order ID dari Midtrans
- `transactionId` (String) - Transaction ID dari Midtrans
- `amount` (Number) - Jumlah pembayaran
- `currency` (String) - Mata uang (IDR)
- `status` (String) - Status pembayaran (pending, success, failed, etc.)
- `paymentMethod` (String) - Metode pembayaran
- `purchaseDate` (String) - Tanggal pembelian (ISO string)
- `expiryDate` (String) - Tanggal kedaluwarsa akses (ISO string)
- `createdAt` (String) - Timestamp pembuatan record
- `updatedAt` (String) - Timestamp update terakhir

**Global Secondary Indexes:**
- `userId-index` - Query berdasarkan user ID
- `orderId-index` - Query berdasarkan order ID
- `transactionId-index` - Query berdasarkan transaction ID

## API Endpoints

### 1. Payment History
```
GET /api/payments/history
```

**Response:**
```json
{
  "success": true,
  "payments": [
    {
      "id": "payment_123",
      "courseId": "course_1",
      "orderId": "ORDER_123",
      "transactionId": "TXN_123",
      "amount": 299000,
      "currency": "IDR",
      "status": "success",
      "paymentMethod": "bank_transfer",
      "purchaseDate": "2024-01-15T10:30:00.000Z",
      "expiryDate": "2025-01-15T10:30:00.000Z",
      "courseTitle": "JavaScript Fundamentals",
      "courseIcon": "💻",
      "daysRemaining": 365,
      "isExpired": false
    }
  ]
}
```

### 2. Midtrans Webhook
```
POST /api/payment/midtrans/notify
```

Webhook ini telah diperbarui untuk:
1. Menyimpan data pembayaran ke tabel `lms-payments`
2. Mempertahankan kompatibilitas dengan sistem lama (user.purchasedCourses)
3. Menambahkan `paymentId` ke record CourseAccess untuk referensi

## PaymentService

Class `PaymentService` menyediakan metode untuk mengelola data payments:

```javascript
const paymentService = new PaymentService();

// Membuat payment record baru
await paymentService.createPayment(paymentData);

// Mengambil payment berdasarkan ID
const payment = await paymentService.getPaymentById(paymentId);

// Mengambil payment berdasarkan order ID
const payment = await paymentService.getPaymentByOrderId(orderId);

// Mengambil riwayat pembayaran user
const payments = await paymentService.getPaymentsByUserId(userId);

// Mengambil pembayaran sukses untuk purchase history
const successfulPayments = await paymentService.getSuccessfulPaymentsByUserId(userId);

// Update payment
await paymentService.updatePayment(paymentId, updateData);
```

## Migration Strategy

### Backward Compatibility

Sistem baru mempertahankan kompatibilitas dengan sistem lama:

1. **Profile Page**: Menggunakan API payments baru dengan fallback ke `user.purchasedCourses`
2. **Course Access**: Tetap menggunakan `authManager.hasAccessToCourse()` yang membaca dari `user.purchasedCourses`
3. **Webhook**: Menyimpan ke kedua tempat (payments table + user.purchasedCourses)

### Data Migration (Opsional)

Jika ingin memigrasikan data lama ke tabel payments:

```javascript
// Script migration (belum dibuat)
const migrateExistingPurchases = async () => {
  // 1. Ambil semua users dengan purchasedCourses
  // 2. Untuk setiap purchase, buat record di lms-payments
  // 3. Update CourseAccess dengan paymentId
};
```

## Environment Variables

```bash
# Local Development
DYNAMODB_PAYMENTS_TABLE=lms-payments

# Production
DYNAMODB_PAYMENTS_TABLE=lms-payments-prod
```

## Setup Instructions

### 1. Local Development
```bash
# Tabel sudah ditambahkan ke create-dynamodb-tables.js
node scripts/create-dynamodb-tables.js
```

### 2. Production (AWS)
```bash
# Gunakan script khusus untuk production
node scripts/create-payments-table.js
```

### 3. Amplify Environment
Tambahkan environment variable di Amplify Console:
```
DYNAMODB_PAYMENTS_TABLE=lms-payments-prod
```

## Benefits

1. **Structured Data**: Data pembayaran tersimpan dalam struktur yang jelas
2. **Audit Trail**: Riwayat lengkap semua transaksi
3. **Query Efficiency**: Global secondary indexes untuk query yang cepat
4. **Scalability**: Struktur database yang lebih baik untuk pertumbuhan
5. **Analytics Ready**: Data siap untuk reporting dan analytics
6. **Backward Compatible**: Tidak merusak fungsionalitas yang ada

## Future Enhancements

1. **Refund System**: Tambah status refund dan partial refund
2. **Payment Analytics**: Dashboard untuk analisis pembayaran
3. **Subscription Model**: Support untuk pembayaran berlangganan
4. **Multiple Payment Gateways**: Integrasi dengan payment gateway lain
5. **Invoice Generation**: Generate invoice PDF untuk pembayaran
6. **Payment Reminders**: Sistem reminder untuk pembayaran yang pending

## Troubleshooting

### Tabel Tidak Ditemukan
```bash
# Pastikan tabel sudah dibuat
node scripts/create-payments-table.js
```

### Environment Variable Tidak Terbaca
```bash
# Periksa .env.local atau .env.production
echo $DYNAMODB_PAYMENTS_TABLE
```

### API Error 500
```bash
# Periksa AWS credentials dan permissions
# Pastikan IAM policy mencakup akses ke tabel lms-payments
```