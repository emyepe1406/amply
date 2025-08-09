'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCourseById } from '@/data/courses';
import { authManager } from '@/lib/auth';
import { Course, User } from '@/types';
import { useAuthValidation } from '@/hooks/useUserValidation';
import { COURSE_PRICING } from '@/lib/midtrans';

export default function CourseDetailPage() {
  // Hook untuk validasi otomatis dan logout jika user dihapus
  useAuthValidation();
  
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'requirements'>('overview');

  useEffect(() => {
    const courseId = params.id as string;
    
    if (courseId) {
      const foundCourse = getCourseById(courseId);
      setCourse(foundCourse || null);
      
      // Check if user is authenticated and has access to course
      const currentUser = authManager.user;
      setUser(currentUser);
      
      if (currentUser && foundCourse) {
        // Check if user has access to this course (either enrolled or purchased)
        const hasAccess = authManager.hasAccessToCourse(foundCourse.id);
        setIsEnrolled(hasAccess);
      }
      
      setLoading(false);
    }

    // Listen for user changes
    const unsubscribe = authManager.subscribe((updatedUser) => {
      setUser(updatedUser);
      if (updatedUser && course) {
        const hasAccess = authManager.hasAccessToCourse(course.id);
        setIsEnrolled(hasAccess);
      } else {
        setIsEnrolled(false);
      }
    });

    return () => unsubscribe();
  }, [params.id, course]);

  const handleStartLearning = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isEnrolled) {
      // In a real app, this would handle enrollment
      alert('Hubungi admin untuk mendaftar kursus ini');
      return;
    }
    
    // Navigate to first chapter
    if (course && course.chapters.length > 0) {
      router.push(`/courses/${course.id}/chapters/${course.chapters[0].id}`);
    }
  };

  const handleAddToCart = () => {
    if (!user || !course) {
      router.push('/login');
      return;
    }

    // Get existing cart
    const existingCart = localStorage.getItem(`cart_${user.id}`);
    let cartItems = [];
    
    try {
      cartItems = existingCart ? JSON.parse(existingCart) : [];
    } catch (error) {
      console.error('Error parsing cart:', error);
      cartItems = [];
    }

    // Check if course is already in cart
    const isAlreadyInCart = cartItems.some((item: any) => item.courseId === course.id);
    
    if (isAlreadyInCart) {
      // If already in cart, go directly to cart
      router.push('/cart');
      return;
    }

    // Add course to cart
    const newItem = {
      courseId: course.id,
      addedAt: new Date().toISOString()
    };
    
    cartItems.push(newItem);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
    
    // Trigger cart update event
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Redirect to cart
    router.push('/cart');
  };

  const getCourseStatus = () => {
    if (!user) return 'login';
    
    if (isEnrolled) {
      return 'active';
    }
    
    return 'purchase';
  };

  const getUserProgress = () => {
    if (!user || !course || !user.progress) return null;
    return user.progress[course.id];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Memuat kursus...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Kursus Tidak Ditemukan</h1>
            <p className="text-gray-600 mb-8">Kursus yang Anda cari tidak tersedia atau telah dihapus.</p>
            <Link
              href="/courses"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Daftar Kursus
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = getUserProgress();
  const progressPercentage = progress?.progressPercentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Course Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                {/* Breadcrumb */}
                <nav className="mb-6">
                  <ol className="flex items-center space-x-2 text-blue-200">
                    <li><Link href="/" className="hover:text-white">Beranda</Link></li>
                    <li><span className="mx-2">/</span></li>
                    <li><Link href="/courses" className="hover:text-white">Kursus</Link></li>
                    <li><span className="mx-2">/</span></li>
                    <li className="text-white">{course.title}</li>
                  </ol>
                </nav>
                
                <div className="flex items-center mb-4">
                  <div className="text-5xl mr-4">{course.icon}</div>
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                    <span className="inline-block bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full capitalize">
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                  {course.description}
                </p>
                
                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center">
                    <i className="fas fa-book text-2xl mr-3"></i>
                    <div>
                      <div className="text-2xl font-bold">{course.chapters.length}</div>
                      <div className="text-blue-200">Bab</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-clock text-2xl mr-3"></i>
                    <div>
                      <div className="text-2xl font-bold">~{course.chapters.length * 2}</div>
                      <div className="text-blue-200">Jam</div>
                    </div>
                  </div>
                </div>
                
                {/* Course Price */}
                <div className="mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-yellow-400">
                       {new Intl.NumberFormat('id-ID', {
                         style: 'currency',
                         currency: 'IDR',
                         minimumFractionDigits: 0,
                       }).format(COURSE_PRICING.PER_COURSE)}
                     </div>
                    <div className="text-blue-200">
                       <div className="text-sm">30 Hari</div>
                       <div className="text-xs">Sekali Bayar</div>
                     </div>
                  </div>
                </div>

                {/* Progress for enrolled users */}
                {isEnrolled && progress && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress Anda</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-blue-700 rounded-full h-3">
                      <div 
                        className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {(() => {
                    const status = getCourseStatus();
                    
                    switch (status) {
                      case 'login':
                        return (
                          <button
                            onClick={() => router.push('/login')}
                            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors flex items-center justify-center"
                          >
                            <i className="fas fa-sign-in-alt mr-2"></i>
                            Login untuk Membeli
                          </button>
                        );
                      
                      case 'active':
                        return (
                          <button
                            onClick={handleStartLearning}
                            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors flex items-center justify-center"
                          >
                            <i className="fas fa-play mr-2"></i>
                            {progressPercentage > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
                          </button>
                        );
                      

                      
                      case 'purchase':
                      default:
                        return (
                          <button
                            onClick={handleAddToCart}
                            className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors flex items-center justify-center"
                          >
                            <i className="fas fa-shopping-cart mr-2"></i>
                            Tambah ke Keranjang
                          </button>
                        );
                    }
                  })()}
                  

                </div>
              </div>
              
              {/* Course Image/Logo */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-xl p-8 shadow-xl">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{course.icon}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600">Persiapan SSW Jepang</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Ringkasan
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'chapters'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Daftar Bab ({course.chapters.length})
                </button>
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'requirements'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Persyaratan
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {activeTab === 'overview' && (
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Tentang Kursus Ini</h2>
                    <div className="prose max-w-none">
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {course.description}
                      </p>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Yang Akan Anda Pelajari:</h3>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                          <span>Materi lengkap sesuai standar ujian SSW Jepang</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                          <span>Kosakata bahasa Jepang yang diperlukan dalam pekerjaan</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                          <span>Latihan soal dan simulasi ujian CBT</span>
                        </li>
                        <li className="flex items-start">
                          <i className="fas fa-check text-green-500 mt-1 mr-3"></i>
                          <span>Tips dan trik untuk lulus ujian dengan nilai tinggi</span>
                        </li>
                      </ul>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Metode Pembelajaran:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                          <i className="fas fa-book text-blue-600 text-2xl mr-3"></i>
                          <div>
                            <h4 className="font-medium">Materi Interaktif</h4>
                            <p className="text-sm text-gray-600">Belajar dengan materi yang mudah dipahami</p>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-green-50 rounded-lg">
                          <i className="fas fa-clone text-green-600 text-2xl mr-3"></i>
                          <div>
                            <h4 className="font-medium">Flashcard</h4>
                            <p className="text-sm text-gray-600">Hafal kosakata dengan mudah</p>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-purple-50 rounded-lg">
                          <i className="fas fa-question-circle text-purple-600 text-2xl mr-3"></i>
                          <div>
                            <h4 className="font-medium">Latihan Soal</h4>
                            <p className="text-sm text-gray-600">Uji pemahaman dengan latihan</p>
                          </div>
                        </div>
                        <div className="flex items-center p-4 bg-red-50 rounded-lg">
                          <i className="fas fa-clipboard-check text-red-600 text-2xl mr-3"></i>
                          <div>
                            <h4 className="font-medium">Ujian Simulasi</h4>
                            <p className="text-sm text-gray-600">Simulasi ujian CBT yang realistis</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'chapters' && (
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Daftar Bab</h2>
                    <div className="space-y-4">
                      {course.chapters.map((chapter, index) => {
                        const isCompleted = progress?.completedChapters.includes(chapter.id) || false;
                        const isLocked = !isEnrolled || (index > 0 && !progress?.completedChapters.includes(course.chapters[index - 1].id));
                        
                        return (
                          <div key={chapter.id} className={`border rounded-lg p-4 ${
                            isCompleted ? 'bg-green-50 border-green-200' : 
                            isLocked ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                                  isCompleted ? 'bg-green-500 text-white' :
                                  isLocked ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'
                                }`}>
                                  {isCompleted ? (
                                    <i className="fas fa-check text-sm"></i>
                                  ) : isLocked ? (
                                    <i className="fas fa-lock text-sm"></i>
                                  ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                  )}
                                </div>
                                <div>
                                  <h3 className={`font-semibold ${
                                    isLocked ? 'text-gray-500' : 'text-gray-900'
                                  }`}>
                                    Bab {index + 1}: {chapter.title}
                                  </h3>
                                  <p className={`text-sm ${
                                    isLocked ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    Materi pembelajaran untuk bab ini
                                  </p>
                                </div>
                              </div>
                              
                              {isEnrolled && !isLocked && (
                                <Link
                                  href={`/courses/${course.id}/chapters/${chapter.id}`}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                  {isCompleted ? 'Review' : 'Mulai'}
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'requirements' && (
                  <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Persyaratan</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Persyaratan Teknis:</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <i className="fas fa-laptop text-blue-600 mt-1 mr-3"></i>
                            <span>Komputer atau smartphone dengan koneksi internet</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-globe text-blue-600 mt-1 mr-3"></i>
                            <span>Browser web modern (Chrome, Firefox, Safari, Edge)</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-headphones text-blue-600 mt-1 mr-3"></i>
                            <span>Headphone atau speaker untuk audio (opsional)</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Persyaratan Pembelajaran:</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <i className="fas fa-clock text-green-600 mt-1 mr-3"></i>
                            <span>Komitmen belajar minimal 1-2 jam per hari</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-book-open text-green-600 mt-1 mr-3"></i>
                            <span>Kemampuan membaca bahasa Indonesia</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-heart text-green-600 mt-1 mr-3"></i>
                            <span>Motivasi tinggi untuk belajar bahasa Jepang</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Rekomendasi:</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <i className="fas fa-star text-yellow-500 mt-1 mr-3"></i>
                            <span>Pengetahuan dasar bahasa Jepang (Hiragana, Katakana) akan membantu</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-users text-yellow-500 mt-1 mr-3"></i>
                            <span>Bergabung dengan grup belajar untuk motivasi tambahan</span>
                          </li>
                          <li className="flex items-start">
                            <i className="fas fa-calendar text-yellow-500 mt-1 mr-3"></i>
                            <span>Buat jadwal belajar yang konsisten</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Course Price Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Harga Kursus</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(COURSE_PRICING.PER_COURSE)}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">30 Hari • Sekali Bayar</div>
                    
                    {(() => {
                      const status = getCourseStatus();
                      
                      if (status === 'active') {
                        return (
                          <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                            <i className="fas fa-check-circle mr-2"></i>
                            Sudah Dibeli
                          </div>
                        );

                      } else if (status === 'purchase') {
                        return (
                          <button
                            onClick={handleAddToCart}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <i className="fas fa-shopping-cart mr-2"></i>
                            Tambah ke Keranjang
                          </button>
                        );
                      } else {
                        return (
                          <button
                            onClick={() => router.push('/login')}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <i className="fas fa-sign-in-alt mr-2"></i>
                            Login untuk Membeli
                          </button>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Course Info Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Kursus</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="font-medium capitalize">{course.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah Bab:</span>
                      <span className="font-medium">{course.chapters.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimasi Waktu:</span>
                      <span className="font-medium">~{course.chapters.length * 2} Jam</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">Pemula - Menengah</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bahasa:</span>
                      <span className="font-medium">Indonesia & Jepang</span>
                    </div>
                  </div>
                </div>

                {/* Contact Admin Card */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Butuh Bantuan?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Hubungi admin untuk informasi lebih lanjut tentang kursus ini atau bantuan teknis.
                  </p>
                  <a
                    href={`https://wa.me/6281234567890?text=Halo%20admin,%20saya%20butuh%20informasi%20tentang%20kursus%20${encodeURIComponent(course.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center font-medium"
                  >
                    <i className="fab fa-whatsapp mr-2"></i>
                    Hubungi Admin
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}