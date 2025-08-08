import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Tentang SSW Kinabaru
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Platform pembelajaran digital terdepan untuk pengembangan keterampilan kerja
              </p>
            </div>
          </div>
        </section>

        {/* About Content */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Visi & Misi Kami
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Visi</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Menjadi platform pembelajaran digital terdepan yang menghasilkan tenaga kerja terampil dan kompeten di berbagai bidang industri.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-600 mb-3">Misi</h3>
                    <ul className="text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Menyediakan program pelatihan berkualitas tinggi
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Mengembangkan kurikulum yang sesuai dengan kebutuhan industri
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Memberikan sertifikasi yang diakui secara nasional
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        Memfasilitasi penempatan kerja bagi lulusan
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-blue-100 rounded-2xl p-8">
                  <Image
                    src="/images/logos/logo1.png"
                    alt="SSW Kinabaru Logo"
                    width={300}
                    height={200}
                    className="mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Program Pelatihan Kami
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Kami menyediakan berbagai program pelatihan yang dirancang khusus untuk memenuhi kebutuhan industri
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Driver Category */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-car text-blue-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Driver</h3>
                </div>
                <ul className="text-gray-600 space-y-2">
                  <li>• Driver Truk</li>
                  <li>• Driver Bis</li>
                  <li>• Driver Taxi</li>
                </ul>
              </div>

              {/* Service Category */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-tools text-green-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Service</h3>
                </div>
                <ul className="text-gray-600 space-y-2">
                  <li>• Ground Handling</li>
                  <li>• Building Cleaning</li>
                  <li>• Restoran Service</li>
                </ul>
              </div>

              {/* Technical Category */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cog text-purple-600 text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Technical</h3>
                </div>
                <ul className="text-gray-600 space-y-2">
                  <li>• Pengolahan Makanan</li>
                  <li>• Seibi (Maintenance)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Hubungi Kami
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Tertarik untuk bergabung dengan program pelatihan kami? Hubungi tim kami untuk informasi lebih lanjut.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20admin,%20saya%20ingin%20informasi%20tentang%20program%20pelatihan%20SSW"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp
                </a>
                <a
                  href="https://t.me/sswkinabaru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <i className="fab fa-telegram mr-2"></i>
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}