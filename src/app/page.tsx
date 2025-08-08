'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPopularCourses } from '@/data/courses';
import { Course } from '@/types';

export default function HomePage() {
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPopularCourses(getPopularCourses());
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Persiapan <span className="text-yellow-400">SSW Jepang</span> Lebih Mudah
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
                Platform pembelajaran interaktif untuk persiapan Specified Skilled Worker (SSW) Jepang 
                dengan materi lengkap, flashcard, latihan kosakata, dan soal latihan. Serta simulasi ujian berbasis CBT.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/login"
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors"
                >
                  Mulai Belajar
                </Link>
                <Link
                  href="/courses"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors"
                >
                  Lihat Kursus
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Courses Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kursus Populer</h2>
              <p className="text-xl text-gray-600">Pilihan kursus terbaik untuk persiapan SSW Jepang</p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Memuat kursus...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {popularCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-4xl mr-4">{course.icon}</div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500 capitalize">{course.category}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6">{course.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 font-medium">
                        {course.chapters.length} Bab
                      </span>
                      <Link
                        href={`/courses/${course.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Fitur Unggulan</h2>
              <p className="text-xl text-gray-600">Semua yang Anda butuhkan untuk sukses dalam ujian SSW</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-book text-2xl text-blue-600"></i>
                </div>
                <h4 className="text-xl font-semibold mb-3">Materi Lengkap</h4>
                <p className="text-gray-600">Materi pembelajaran yang komprehensif dan terstruktur untuk persiapan ujian SSW.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clone text-2xl text-green-600"></i>
                </div>
                <h4 className="text-xl font-semibold mb-3">Flashcard</h4>
                <p className="text-gray-600">Belajar kosakata dengan metode flashcard yang efektif dan interaktif.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-question-circle text-2xl text-purple-600"></i>
                </div>
                <h4 className="text-xl font-semibold mb-3">Latihan Soal</h4>
                <p className="text-gray-600">Latihan soal yang mirip dengan ujian SSW untuk mempersiapkan diri dengan baik.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-language text-2xl text-yellow-600"></i>
                </div>
                <h4 className="text-xl font-semibold mb-3">Latihan Kosakata</h4>
                <p className="text-gray-600">Latihan kosakata bahasa Jepang yang dibutuhkan untuk ujian dan pekerjaan.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clipboard-check text-2xl text-red-600"></i>
                </div>
                <h4 className="text-xl font-semibold mb-3">Ujian Simulasi</h4>
                <p className="text-gray-600">Simulasi ujian dengan format dan waktu yang sama seperti ujian SSW asli.</p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-headset text-2xl text-indigo-600"></i>
                </div>
                <h4 className="text-xl font-semibold mb-3">Dukungan Mentor</h4>
                <p className="text-gray-600">Konsultasi dengan mentor berpengalaman untuk membantu proses belajar Anda.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Apa Kata Klien Kami?</h2>
              <p className="text-xl text-gray-600">Berikut pengalaman nyata dari peserta yang telah menggunakan layanan kami.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Aplikasi belajar nya sangat bagus, sehingga saya terbiasa melihat soal soal ujiannya. Terima kasih banyak!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">TH</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Tri Hartarto</h4>
                    <p className="text-sm text-gray-500">SSW Driver Truk, Yogyakarta</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Terimakasih banyak mas, berkat kinabaru ujian ssw saya berhasil lulus dengan nilai terbaik, materi dan latihan soalnya ajaib"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">AS</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Andri Suwanto</h4>
                    <p className="text-sm text-gray-500">SSW Driver Truk, Yogyakarta</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 text-xl">★★★★★</div>
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Sebenarnya kisi kisi CBT dan soal di kinabaru 80% keluar semua. Cuma saja saya g ada waktu buat belajar krn lembur trus"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">DP</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Dahsyat Persada</h4>
                    <p className="text-sm text-gray-500">SSW Driver Truk, Ibaraki Mito</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <a
                href="https://t.me/kinabarutesti"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fab fa-telegram mr-2"></i>
                Lihat Lebih Banyak Testimoni
              </a>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Harga Terjangkau</h2>
            <p className="text-xl mb-6">Akses semua materi dan fitur dengan harga yang terjangkau</p>
            <p className="text-2xl mb-8">
              Mulai dari <span className="text-4xl font-bold text-yellow-400">Rp 150.000</span> per bulan
            </p>
            <Link
              href="/courses"
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors inline-block mb-4"
            >
              Lihat Semua Kursus
            </Link>
            <p className="text-blue-100">
              Hubungi admin untuk informasi lebih lanjut
            </p>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
