# iPaymu Payment Integration Setup Guide

## Overview
Sistem pembayaran iPaymu telah dikonfigurasi untuk mendukung environment sandbox dan production secara otomatis.

## Environment Configuration

### Local Development (Sandbox)
- File: `.env.local`
- iPaymu menggunakan sandbox credentials
- `IPAYMU_PRODUCTION=false`
- Base URL: `http://localhost:3000`

### Production (AWS Amplify)
- File: `.env.production`
- iPaymu menggunakan production credentials
- `IPAYMU_PRODUCTION=true`
- Base URL: `https://main.deiuyhkuxaywf.amplifyapp.com/`

## Key Changes Made

### 1. Dynamic Environment Detection
- `src/lib/ipaymu.ts` sekarang otomatis mendeteksi environment
- Menggunakan production config jika `NODE_ENV=production` atau domain mengandung `amplifyapp.com`
- Menggunakan sandbox config untuk development lokal

### 2. Enhanced Payment Notification Handler
- `src/app/api/payment/notify/route.ts` ditingkatkan dengan logging komprehensif
- Menangani `purchasedCourses` sebagai array (bukan object)
- Menambah atau update course access dengan expiry date 30 hari

### 3. Updated Type Definitions
- `src/types/index.ts`: `purchasedCourses` sekarang menggunakan `CourseAccess[]`
- Konsistensi tipe data di seluruh aplikasi

### 4. Auth Manager Updates
- `src/lib/auth.ts` diupdate untuk mendukung format array
- Semua method course access menggunakan array format
- Backward compatibility dengan enrolled courses

### 5. Profile Page Updates
- `src/app/profile/page.tsx` diupdate untuk format array baru
- Menampilkan informasi expiry date dan days remaining

## Testing Procedure

### Local Testing (Sandbox)
1. Jalankan `npm run dev`
2. Beli course menggunakan iPaymu sandbox
3. Gunakan fake payment success di sandbox
4. Cek apakah course muncul di dashboard dan profile
5. Cek console logs untuk debugging

### Production Testing
1. Deploy ke AWS Amplify
2. Pastikan environment variables sudah diset di Amplify Console
3. Test dengan real payment atau iPaymu production sandbox
4. Monitor CloudWatch logs untuk debugging

## Environment Variables Setup

### AWS Amplify Console
Tambahkan environment variables berikut di Amplify Console:
```
IPAYMU_VA=your_production_va
IPAYMU_API_KEY=your_production_api_key
IPAYMU_PRODUCTION=true
NEXT_PUBLIC_BASE_URL=https://your-app.amplifyapp.com
```

## Debugging

### Payment Notification Logs
Cek logs berikut untuk debugging payment issues:
- Environment detection
- iPaymu config being used
- Payment notification headers
- User data before/after update
- DynamoDB update results

### Common Issues
1. **Course tidak muncul setelah payment**: Cek notification handler logs
2. **Wrong environment config**: Cek environment variables dan URL detection
3. **Type errors**: Pastikan `purchasedCourses` selalu array

## Security Notes
- Sandbox credentials hanya untuk development
- Production credentials harus disimpan aman di AWS Amplify
- Jangan commit production credentials ke repository
- Gunakan signature verification untuk semua payment notifications

## Next Steps
1. Test thoroughly di local environment
2. Deploy ke staging/production
3. Configure production iPaymu credentials
4. Monitor payment notifications dan course access
5. Setup monitoring dan alerting untuk payment failures