export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Kebijakan Pengembalian Dana (Refund Policy)
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Kebijakan Umum</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                SSW Learning berkomitmen untuk memberikan pengalaman pembelajaran terbaik. Kami memahami bahwa dalam beberapa situasi, 
                pengembalian dana mungkin diperlukan. Kebijakan ini mengatur syarat dan ketentuan pengembalian dana untuk kursus yang dibeli di platform kami.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Periode Pengembalian Dana</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Pengembalian dana dapat diajukan dalam waktu <strong>7 hari</strong> sejak tanggal pembelian kursus</li>
                <li>Setelah periode 7 hari, permintaan pengembalian dana tidak dapat diproses</li>
                <li>Pengembalian dana hanya berlaku untuk kursus yang belum diakses lebih dari 25% dari total materi</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Syarat Pengembalian Dana</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Pengembalian dana akan disetujui dalam kondisi berikut:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Masalah teknis yang tidak dapat diselesaikan yang menghalangi akses ke kursus</li>
                <li>Kursus tidak sesuai dengan deskripsi yang diberikan</li>
                <li>Pembayaran ganda untuk kursus yang sama</li>
                <li>Kursus dibatalkan oleh SSW Learning</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Kondisi yang Tidak Memenuhi Syarat</h2>
              <p className="text-gray-700 leading-relaxed mb-4">Pengembalian dana TIDAK akan disetujui dalam kondisi berikut:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Perubahan pikiran setelah mengakses lebih dari 25% materi kursus</li>
                <li>Ketidakpuasan subjektif terhadap konten setelah menyelesaikan sebagian besar kursus</li>
                <li>Permintaan pengembalian dana setelah periode 7 hari</li>
                <li>Pelanggaran terhadap syarat dan ketentuan platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Proses Pengembalian Dana</h2>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Kirim email ke <strong>refund@sswlearning.com</strong> dengan subjek "Permintaan Refund"</li>
                <li>Sertakan informasi berikut:
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Nama lengkap dan email akun</li>
                    <li>ID transaksi atau nomor referensi pembayaran</li>
                    <li>Nama kursus yang ingin di-refund</li>
                    <li>Alasan permintaan pengembalian dana</li>
                  </ul>
                </li>
                <li>Tim kami akan meninjau permintaan dalam 3-5 hari kerja</li>
                <li>Jika disetujui, pengembalian dana akan diproses dalam 7-14 hari kerja</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Metode Pengembalian Dana</h2>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Pengembalian dana akan dikembalikan ke metode pembayaran asli</li>
                <li>Untuk pembayaran via Virtual Account: dikembalikan ke rekening bank yang terdaftar</li>
                <li>Untuk pembayaran via E-wallet: dikembalikan ke akun e-wallet yang sama</li>
                <li>Biaya administrasi sebesar 2.5% dari total pembayaran akan dipotong dari jumlah refund</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Pengembalian Parsial</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Dalam kasus tertentu, SSW Learning dapat menawarkan pengembalian parsial atau kredit untuk kursus lain 
                sebagai alternatif pengembalian dana penuh.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Kontak</h2>
              <p className="text-gray-700 leading-relaxed">
                Untuk pertanyaan lebih lanjut mengenai kebijakan pengembalian dana, silakan hubungi:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p><strong>Email:</strong> refund@sswlearning.com</p>
                <p><strong>Support:</strong> support@sswlearning.com</p>
                <p><strong>Jam Operasional:</strong> Senin - Jumat, 09:00 - 17:00 WIB</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Perubahan Kebijakan</h2>
              <p className="text-gray-700 leading-relaxed">
                SSW Learning berhak mengubah kebijakan pengembalian dana ini sewaktu-waktu. 
                Perubahan akan diberitahukan melalui email dan website resmi kami.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}