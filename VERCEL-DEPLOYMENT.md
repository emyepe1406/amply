# Vercel Deployment - Alternatif untuk AWS Amplify

## Jika AWS Amplify Masih Bermasalah, Gunakan Vercel

### Langkah 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Langkah 2: Login ke Vercel
```bash
vercel login
```

### Langkah 3: Deploy dengan Script yang Sudah Ada
```bash
npm run deploy-vercel
```

Atau deploy manual:
```bash
vercel --prod
```

### Langkah 4: Konfigurasi Environment Variables di Vercel

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Pilih project Anda
3. Masuk ke Settings > Environment Variables
4. Tambahkan semua variabel dari `.env.production`:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_USERS_TABLE=lms-users-prod
DYNAMODB_COURSES_TABLE=lms-courses-prod
DYNAMODB_PROGRESS_TABLE=lms-progress-prod
S3_BUCKET_NAME=lms-content-prod-ktjp0x
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app
IPAYMU_VA=your_ipaymu_va
IPAYMU_SECRET=your_ipaymu_secret
IPAYMU_API_KEY=your_ipaymu_api_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### Langkah 5: Redeploy Setelah Environment Variables
```bash
vercel --prod
```

## Keuntungan Vercel vs AWS Amplify

✅ **Vercel:**
- Setup lebih mudah
- Build time lebih cepat
- Better Next.js support
- Automatic deployments dari GitHub
- Free tier yang generous

❌ **AWS Amplify:**
- Setup lebih kompleks
- Sering ada masalah dengan Node.js versions
- SSR framework support terbatas
- Lebih mahal untuk traffic tinggi

## Monitoring dan Testing

Setelah deployment berhasil:
1. Test halaman utama: `https://your-domain.vercel.app`
2. Test login admin: `https://your-domain.vercel.app/admin`
3. Test fitur upload dan database
4. Monitor Vercel Analytics untuk performance

## Troubleshooting Vercel

Jika ada masalah:
1. Periksa Vercel Function Logs
2. Pastikan AWS resources sudah dibuat
3. Verifikasi environment variables
4. Test koneksi database dengan script lokal

---

**Rekomendasi:** Gunakan Vercel untuk deployment yang lebih stabil dan mudah dikelola.