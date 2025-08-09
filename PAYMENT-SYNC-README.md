# Payment Sync Utilities Documentation

Dokumentasi ini menjelaskan semua utilities baru untuk menjaga sinkronisasi antara sistem payment baru (`lms-payments`) dan sistem lama (`user.purchasedCourses`).

## 🎯 Tujuan

Utilities ini dirancang untuk menyelesaikan masalah integrasi yang ditemukan:
- Sinkronisasi otomatis antara `lms-payments` dan `user.purchasedCourses`
- Validasi integritas data
- Migrasi data dari sistem lama ke baru
- Background sync untuk menjaga konsistensi

## 📁 File Utilities

### 1. `scripts/migrate-payments-sync.js`
**Fungsi**: Migrasi satu kali untuk sync semua payment history
**Usage**: 
```bash
npm run payment-sync
```

**Fitur**:
- Membaca semua payments sukses dari `lms-payments`
- Update `user.purchasedCourses` untuk semua user
- Generate detail report migrasi
- Handle duplicate data dengan bijak

### 2. `scripts/validate-payment-sync.js`
**Fungsi**: Validasi integritas data dan identifikasi masalah
**Usage**:
```bash
# Hanya validasi
npm run payment-validate

# Validasi + auto-fix
npm run payment-fix
```

**Fitur**:
- Validasi per-user basis
- Identifikasi data yang hilang
- Deteksi inkonsistensi
- Auto-fix masalah yang ditemukan
- Generate comprehensive report

### 3. `scripts/cron-sync-payments.js`
**Fungsi**: Background sync service untuk cron job
**Usage**:
```bash
# Sync semua users
npm run payment-cron-sync

# Validasi data
npm run payment-cron-validate

# Health check
npm run payment-cron-health
```

**Fitur**:
- Logging otomatis ke file
- Health check system
- Error handling yang robust
- Support untuk scheduled execution

### 4. `src/lib/PaymentSyncService.js`
**Fungsi**: Core service untuk sync logic
**Usage**: Import di file lain untuk programmatic access

```javascript
const PaymentSyncService = require('../src/lib/PaymentSyncService');
const service = new PaymentSyncService();

// Sync user tertentu
await service.syncUserPayments('user-id-123');

// Validasi user
const validation = await service.validateUserData('user-id-123');
```

## 🚀 Cara Menggunakan

### 1. Initial Migration
Untuk migrasi pertama kali:
```bash
# 1. Validasi data sebelum migrasi
npm run payment-validate

# 2. Jalankan migrasi
npm run payment-sync

# 3. Validasi ulang setelah migrasi
npm run payment-validate
```

### 2. Regular Maintenance
Untuk maintenance berkala:
```bash
# Sync harian (dapat dijadwalkan via cron)
0 2 * * * cd /path/to/project && npm run payment-cron-sync

# Validasi mingguan
0 3 * * 0 cd /path/to/project && npm run payment-cron-validate
```

### 3. Emergency Fix
Jika terjadi inkonsistensi:
```bash
# Auto-fix semua masalah
npm run payment-fix

# Cek health system
npm run payment-cron-health
```

## 🔧 Setup Cron Job

### Linux/Mac Cron
Tambahkan ke crontab:
```bash
# Edit crontab
crontab -e

# Tambahkan baris berikut:
# Sync setiap jam
0 * * * * cd /path/to/projeknext && npm run payment-cron-sync >> /var/log/payment-sync.log 2>&1

# Validasi setiap hari jam 2 pagi
0 2 * * * cd /path/to/projeknext && npm run payment-cron-validate >> /var/log/payment-sync.log 2>&1
```

### Windows Task Scheduler
Gunakan Windows Task Scheduler untuk menjalankan:
```bash
npm run payment-cron-sync
```

## 📊 Monitoring

### Log Files
- **Location**: `logs/payment-sync.log`
- **Rotation**: Manual (gunakan logrotate untuk Linux)
- **Format**: `[timestamp] [level] message`

### Health Check
Untuk monitoring system health:
```bash
npm run payment-cron-health
```

### Metrics yang Tersedia
- Total users dengan payments
- Jumlah sync yang berhasil/gagal
- Durasi proses sync
- Jumlah issues yang ditemukan

## 🚨 Troubleshooting

### Common Issues

#### 1. AWS Credentials Error
**Symptom**: `Access Denied` atau credential errors
**Solution**:
```bash
# Cek environment variables
node scripts/validate-production-env.js

# Pastikan AWS credentials benar di .env.local atau .env.production
```

#### 2. Data Tidak Sinkron
**Symptom**: User tidak bisa akses course yang sudah dibeli
**Solution**:
```bash
# Jalankan validasi
npm run payment-validate

# Jika ada issues, jalankan fix
npm run payment-fix
```

#### 3. Duplicate Data
**Symptom**: Course muncul berkali-kali di profile
**Solution**:
```bash
# Migrasi ulang dengan deduplication
npm run payment-sync
```

### Debug Mode
Untuk debugging detail:
```bash
# Tambahkan DEBUG=true sebelum command
DEBUG=true node scripts/migrate-payments-sync.js
```

## 📋 Checklist Setup

### Untuk Production Deployment
- [ ] Pastikan semua environment variables sudah benar
- [ ] Jalankan `npm run payment-validate` untuk cek data
- [ ] Setup cron job untuk sync otomatis
- [ ] Setup monitoring dan alerting
- [ ] Test backup dan recovery procedures

### Environment Variables yang Diperlukan
```bash
# AWS Configuration
AMPLIFY_AWS_REGION=ap-southeast-1
AMPLIFY_AWS_ACCESS_KEY_ID=your-access-key
AMPLIFY_AWS_SECRET_ACCESS_KEY=your-secret-key

# Table Names
DYNAMODB_PAYMENTS_TABLE=lms-payments-prod
DYNAMODB_USERS_TABLE=lms-users
```

## 🔄 Best Practices

### 1. Regular Maintenance
- Jalankan validasi setiap minggu
- Monitor log files untuk error
- Update utilities saat ada perubahan struktur data

### 2. Backup Strategy
- Backup data sebelum migrasi besar
- Simpan report validasi sebagai dokumentasi
- Test restore procedures secara berkala

### 3. Performance Optimization
- Jalankan sync saat traffic rendah
- Gunakan batch processing untuk large datasets
- Monitor AWS usage dan cost

## 📞 Support

Jika mengalami masalah:
1. Cek log files di `logs/payment-sync.log`
2. Jalankan health check: `npm run payment-cron-health`
3. Gunakan validation tools untuk identifikasi masalah
4. Backup data sebelum melakukan perubahan besar

## 🔄 Integration dengan Sistem Lain

### Webhook Enhancement
Webhook Midtrans sudah diupdate untuk:
- Selalu sync ke kedua sistem (lms-payments + user.purchasedCourses)
- Handle edge cases dan error recovery
- Provide detailed logging untuk debugging

### API Integration
Semua API endpoints sudah compatible dengan dual system:
- `/api/payments/history` - menggunakan data dari lms-payments
- Course access check - fallback ke user.purchasedCourses
- Profile page - merge data dari kedua sistem

---

Untuk pertanyaan atau masalah teknis, silakan buat issue di repository atau hubungi development team.