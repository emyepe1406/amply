import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image
                src="/images/logos/logo1.png"
                alt="SSW Learning Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h3 className="text-xl font-bold">SSW Learning</h3>
                <p className="text-sm text-gray-400">Kinabaru E-Learning</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Platform pembelajaran interaktif untuk persiapan Specified Skilled Worker (SSW) Jepang 
              dengan materi lengkap, flashcard, latihan kosakata, dan simulasi ujian berbasis CBT.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://t.me/kinabarutesti"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-telegram text-xl"></i>
              </a>
              <a
                href="https://wa.me/628970061990"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fab fa-whatsapp text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Menu Utama</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-300 hover:text-white transition-colors">
                  Kursus
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kategori Kursus</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/courses?category=driver" className="text-gray-300 hover:text-white transition-colors">
                  Driver (Pengemudi)
                </Link>
              </li>
              <li>
                <Link href="/courses?category=service" className="text-gray-300 hover:text-white transition-colors">
                  Service (Pelayanan)
                </Link>
              </li>
              <li>
                <Link href="/courses?category=technical" className="text-gray-300 hover:text-white transition-colors">
                  Technical (Teknis)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Kinabaru E-Learning. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Syarat & Ketentuan
              </Link>
              <a
                href="https://wa.me/628970061990?text=Hallo%20admin%2C%20saya%20ingin%20membeli%20akses%20untuk%20kursus%20di%20ssw%20learning%20kinabaru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Hubungi Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}