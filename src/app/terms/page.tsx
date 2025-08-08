export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Syarat dan Ketentuan (Terms and Conditions)
          </h1>
          
          <div className="prose max-w-none">
            <div className="mb-8">
              <p className="text-gray-600 text-lg leading-relaxed">
                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Penerimaan Syarat</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Dengan mengakses dan menggunakan platform SSW Learning, Anda menyetujui untuk terikat oleh syarat dan ketentuan ini. 
                Jika Anda tidak menyetujui syarat dan ketentuan ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definisi</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>"Platform"</strong> mengacu pada website SSW Learning dan semua layanan yang disediakan</li>
                <li><strong>"Pengguna"</strong> mengacu pada setiap individu yang mengakses atau menggunakan platform</li>
                <li><strong>"Kursus"</strong> mengacu pada materi pembelajaran yang tersedia di platform</li>
                <li><strong>"Konten"</strong> mengacu pada semua materi, teks, video, audio, dan media lainnya di platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Pendaftaran Akun</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Anda harus berusia minimal 18 tahun atau memiliki izin dari orang tua/wali</li>
                <li>Informasi yang diberikan saat pendaftaran harus akurat dan lengkap</li>
                <li>Anda bertanggung jawab menjaga kerahasiaan password akun</li>
                <li>Satu akun hanya boleh digunakan oleh satu orang</li>
                <li>SSW Learning berhak menangguhkan atau menghapus akun yang melanggar ketentuan</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Penggunaan Platform</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Penggunaan yang Diizinkan</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Mengakses dan mempelajari konten kursus yang telah dibeli</li>
                <li>Mengunduh materi untuk penggunaan pribadi dan non-komersial</li>
                <li>Berpartisipasi dalam diskusi dan aktivitas pembelajaran</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Penggunaan yang Dilarang</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Membagikan akun dengan orang lain</li>
                <li>Mendistribusikan, menjual, atau mengkomersialkan konten kursus</li>
                <li>Melakukan reverse engineering atau mencoba mengakses sistem secara tidak sah</li>
                <li>Mengunggah virus, malware, atau konten berbahaya lainnya</li>
                <li>Melakukan spam atau aktivitas yang mengganggu pengguna lain</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Pembayaran dan Akses Kursus</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Semua kursus memiliki harga Rp 150.000 dengan akses selama 30 hari</li>
                <li>Pembayaran dilakukan melalui iPaymu dengan berbagai metode yang tersedia</li>
                <li>Akses kursus dimulai setelah pembayaran berhasil dikonfirmasi</li>
                <li>Setelah 30 hari, akses akan berakhir dan perlu diperpanjang dengan pembelian ulang</li>
                <li>Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Hak Kekayaan Intelektual</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Semua konten di platform adalah milik SSW Learning atau pemberi lisensi</li>
                <li>Pengguna tidak memperoleh hak kepemilikan atas konten, hanya hak akses terbatas</li>
                <li>Dilarang menyalin, memodifikasi, atau mendistribusikan konten tanpa izin tertulis</li>
                <li>Pelanggaran hak cipta akan ditindak sesuai hukum yang berlaku</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privasi dan Data Pribadi</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Kami menghormati privasi pengguna dan melindungi data pribadi</li>
                <li>Data yang dikumpulkan digunakan untuk meningkatkan layanan</li>
                <li>Kami tidak akan membagikan data pribadi kepada pihak ketiga tanpa persetujuan</li>
                <li>Pengguna dapat meminta penghapusan data pribadi sesuai ketentuan yang berlaku</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Pembatasan Tanggung Jawab</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>SSW Learning tidak menjamin hasil pembelajaran atau pencapaian tertentu</li>
                <li>Platform disediakan "sebagaimana adanya" tanpa jaminan tersurat atau tersirat</li>
                <li>Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan platform</li>
                <li>Tanggung jawab kami terbatas pada jumlah yang dibayarkan untuk kursus</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Penangguhan dan Penghentian</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SSW Learning berhak menangguhkan atau menghentikan akses pengguna dalam kondisi berikut:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Pelanggaran terhadap syarat dan ketentuan</li>
                <li>Aktivitas yang merugikan platform atau pengguna lain</li>
                <li>Penggunaan platform untuk tujuan ilegal</li>
                <li>Permintaan dari otoritas hukum yang berwenang</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Perubahan Layanan</h2>
              <p className="text-gray-700 leading-relaxed">
                SSW Learning berhak mengubah, memodifikasi, atau menghentikan layanan sewaktu-waktu. 
                Perubahan signifikan akan diberitahukan kepada pengguna melalui email atau pengumuman di platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Hukum yang Berlaku</h2>
              <p className="text-gray-700 leading-relaxed">
                Syarat dan ketentuan ini diatur oleh hukum Republik Indonesia. 
                Setiap sengketa akan diselesaikan melalui pengadilan yang berwenang di Jakarta.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Kontak</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Untuk pertanyaan mengenai syarat dan ketentuan ini, silakan hubungi:
              </p>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> legal@sswlearning.com</p>
                <p><strong>Support:</strong> support@sswlearning.com</p>
                <p><strong>Alamat:</strong> Jakarta, Indonesia</p>
                <p><strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Perubahan Syarat dan Ketentuan</h2>
              <p className="text-gray-700 leading-relaxed">
                SSW Learning berhak mengubah syarat dan ketentuan ini sewaktu-waktu. 
                Perubahan akan diberitahukan melalui email dan akan berlaku 30 hari setelah pemberitahuan. 
                Penggunaan platform setelah perubahan dianggap sebagai persetujuan terhadap syarat dan ketentuan yang baru.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}