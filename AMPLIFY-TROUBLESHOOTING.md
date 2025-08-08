# AWS Amplify Deployment Troubleshooting

## Masalah yang Ditemukan dari Log Error

Berdasarkan log error yang Anda berikan, ada beberapa masalah utama:

### 1. SSR Framework Support Error
```
!!! Build failed
!!! Non-Zero Exit Code detected
!!! Learn more about Amplify Hosting's support for SSR frameworks
```

**Penyebab:** AWS Amplify memiliki keterbatasan dalam mendukung SSR (Server-Side Rendering) secara default.

**Solusi yang Sudah Diterapkan:**
- ✅ Mengubah `next.config.js` dengan `output: 'standalone'`
- ✅ Menambahkan `images: { unoptimized: true }`
- ✅ Mengganti `serverComponentsExternalPackages` dengan `serverExternalPackages`

### 2. Command Failed dengan Exit Code 1
```
!!! Error: Command failed with exit code 1
```

**Penyebab:** Build process gagal karena konfigurasi yang tidak kompatibel.

**Solusi yang Sudah Diterapkan:**
- ✅ Menambahkan Node.js version pinning dengan `.nvmrc`
- ✅ Memperbarui `amplify.yml` dengan konfigurasi yang lebih robust
- ✅ Menambahkan debug commands untuk monitoring

### 3. Amplify AppID Not Found
```
Amplify AppID deluyhkuxaywf not found
```

**Penyebab:** Masalah dengan konfigurasi Amplify atau region mismatch.

## Langkah Perbaikan yang Harus Dilakukan

### Step 1: Commit dan Push Perubahan
```bash
git add .
git commit -m "Fix: Update Next.js config and Amplify settings for deployment compatibility"
git push origin main
```

### Step 2: Redeploy di AWS Amplify Console
1. Buka AWS Amplify Console
2. Pilih aplikasi Anda
3. Klik "Redeploy this version" atau trigger new build
4. Monitor build logs untuk memastikan tidak ada error

### Step 3: Jika Masih Error, Coba Solusi Alternatif

#### Opsi A: Reset Amplify App
1. Delete aplikasi Amplify yang ada
2. Buat aplikasi baru dengan konfigurasi yang sudah diperbaiki
3. Pastikan region AWS sesuai dengan yang digunakan

#### Opsi B: Gunakan Vercel (Alternatif)
```bash
npm run deploy-vercel
```

## Konfigurasi Environment Variables

Pastikan semua environment variables sudah diset dengan benar di Amplify Console:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_USERS_TABLE=lms-users-prod
DYNAMODB_COURSES_TABLE=lms-courses-prod
DYNAMODB_PROGRESS_TABLE=lms-progress-prod
S3_BUCKET_NAME=lms-content-prod-ktjp0x
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-amplify-domain.amplifyapp.com
NEXT_PUBLIC_BASE_URL=https://your-amplify-domain.amplifyapp.com
IPAYMU_VA=your_ipaymu_va
IPAYMU_SECRET=your_ipaymu_secret
IPAYMU_API_KEY=your_ipaymu_api_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

## Monitoring dan Testing

### Setelah Deployment Berhasil:
1. Test halaman utama: `https://your-domain.amplifyapp.com`
2. Test login admin: `https://your-domain.amplifyapp.com/admin`
3. Test fitur upload dan database
4. Monitor CloudWatch logs untuk error

### Jika Masih Ada Masalah:
1. Periksa CloudWatch logs
2. Pastikan AWS resources (DynamoDB, S3) sudah dibuat
3. Verifikasi IAM permissions
4. Test koneksi database dengan script lokal

## Kontak Support

Jika masalah masih berlanjut, silakan:
1. Screenshot error logs terbaru
2. Berikan informasi region AWS yang digunakan
3. Konfirmasi apakah AWS resources sudah dibuat

---

**Status Perbaikan:** ✅ Konfigurasi sudah diperbaiki, siap untuk redeploy