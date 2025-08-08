'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Course } from '@/types';
import { authManager } from '@/lib/auth';
import { COURSE_PRICING } from '@/lib/midtrans';

const categories = [
  { id: 'all', name: 'Semua Kursus', icon: '📚' },
  { id: 'driver', name: 'Driver', icon: '🚛' },
  { id: 'service', name: 'Service', icon: '🔧' },
  { id: 'technical', name: 'Technical', icon: '⚙️' }
];

export default function CoursesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [purchasingCourse, setPurchasingCourse] = useState<string | null>(null);
  const [user, setUser] = useState(authManager.user);

  // Fetch courses from database
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      const result = await response.json();
      
      if (result.success && result.courses) {
        setAllCourses(result.courses);
        setFilteredCourses(result.courses);
      } else {
        console.error('Failed to fetch courses:', result.message);
        setAllCourses([]);
        setFilteredCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAllCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = authManager.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
    return unsubscribe;
  }, []);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle course purchase
  const handlePurchaseCourse = async (courseId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user already has access to this course
    const courseAccess = authManager.getCourseAccess(courseId);
    if (courseAccess.hasAccess) {
      router.push(`/courses/${courseId}`);
      return;
    }

    setPurchasingCourse(courseId);
    
    try {
      const response = await fetch('/api/payment/midtrans/course/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email || `${user.username}@example.com`,
          userName: user.username,
          courseId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.token) {
        // Use Midtrans Snap
        // @ts-ignore
        window.snap.pay(data.data.token, {
          onSuccess: function(result: any) {
            console.log('Payment success:', result);
            window.location.href = `/payment/success?order_id=${data.data.orderId}`;
          },
          onPending: function(result: any) {
            console.log('Payment pending:', result);
            alert('Pembayaran sedang diproses');
          },
          onError: function(result: any) {
            console.log('Payment error:', result);
            alert('Terjadi kesalahan saat memproses pembayaran');
          },
          onClose: function() {
            console.log('Payment popup closed');
          }
        });
      } else {
        alert(data.message || 'Terjadi kesalahan saat memproses pembayaran');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setPurchasingCourse(null);
    }
  };

  // Get course status for user
  const getCourseStatus = (courseId: string) => {
    if (!user) return { hasAccess: false, status: 'login' };
    
    const courseAccess = authManager.getCourseAccess(courseId);
    if (courseAccess.hasAccess) {
      if (authManager.isCourseExpiringSoon(courseId)) {
        return { hasAccess: true, status: 'expiring', daysRemaining: courseAccess.daysRemaining };
      }
      return { hasAccess: true, status: 'active' };
    }
    
    return { hasAccess: false, status: 'purchase' };
  };

  // Filter courses based on category and search
  useEffect(() => {
    let filtered = allCourses;
    
    if (selectedCategory !== 'all') {
      filtered = allCourses.filter((course: Course) => course.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter((course: Course) => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCourses(filtered);
  }, [selectedCategory, searchTerm, allCourses]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Semua Kursus SSW Jepang
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Pilih kursus yang sesuai dengan bidang pekerjaan yang Anda inginkan di Jepang
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-gray-400"></i>
                </div>
                <input
                  type="text"
                  placeholder="Cari kursus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? 'Semua Kursus' : 
                   categories.find(cat => cat.id === selectedCategory)?.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Memuat...' : `${filteredCourses.length} kursus ditemukan`}
                </p>
              </div>
              
              {/* Sort Options */}
              <div className="hidden sm:block">
                <select className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="name">Urutkan berdasarkan Nama</option>
                  <option value="category">Urutkan berdasarkan Kategori</option>
                  <option value="chapters">Urutkan berdasarkan Jumlah Bab</option>
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-gray-600">Memuat kursus...</span>
              </div>
            ) : (
              <>
                {/* No Results */}
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak Ada Kursus Ditemukan</h3>
                    <p className="text-gray-600 mb-4">
                      Coba ubah kata kunci pencarian atau pilih kategori lain
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  /* Courses Grid */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                        {/* Course Header */}
                        <div className="p-6 pb-4">
                          <div className="flex items-center mb-4">
                            <div className="text-4xl mr-4">{course.icon}</div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-1">{course.title}</h3>
                              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
                                {course.category}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
                        </div>
                        
                        {/* Course Stats */}
                        <div className="px-6 py-4 bg-gray-50 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-gray-600">
                              <i className="fas fa-book mr-2"></i>
                              <span>{course.chapters.length} Bab</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <i className="fas fa-clock mr-2"></i>
                              <span>~{course.chapters.length * 2} Jam</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Course Price */}
                        <div className="px-6 py-3 border-t">
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-blue-600">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(COURSE_PRICING.PER_COURSE)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Akses Penuh
                            </div>
                          </div>
                        </div>
                        
                        {/* Course Actions */}
                        <div className="p-6 pt-4">
                          {(() => {
                            const courseStatus = getCourseStatus(course.id);
                            
                            if (courseStatus.status === 'login') {
                              return (
                                <div className="space-y-3">
                                  <button
                                    onClick={() => router.push('/login')}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                  >
                                    Login untuk Membeli
                                  </button>
                                  <Link
                                    href={`/courses/${course.id}/preview`}
                                    className="block w-full border border-blue-600 text-blue-600 text-center py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                  >
                                    Preview Gratis
                                  </Link>
                                </div>
                              );
                            }
                            
                            if (courseStatus.status === 'active') {
                              return (
                                <div className="space-y-3">
                                  <Link
                                    href={`/courses/${course.id}`}
                                    className="block w-full bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                  >
                                    <i className="fas fa-play mr-2"></i>
                                    Mulai Belajar
                                  </Link>
                                  <div className="text-center text-sm text-green-600 font-medium">
                                    <i className="fas fa-check-circle mr-1"></i>
                                    Kursus Aktif
                                  </div>
                                </div>
                              );
                            }
                            
                            if (courseStatus.status === 'expiring') {
                              return (
                                <div className="space-y-3">
                                  <Link
                                    href={`/courses/${course.id}`}
                                    className="block w-full bg-orange-600 text-white text-center py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                                  >
                                    <i className="fas fa-play mr-2"></i>
                                    Lanjutkan Belajar
                                  </Link>
                                  <div className="text-center text-sm text-orange-600 font-medium">
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    Berakhir dalam {courseStatus.daysRemaining} hari
                                  </div>
                                </div>
                              );
                            }
                            
                            // Default: purchase status
                            return (
                              <div className="space-y-3">
                                <button
                                  onClick={() => handlePurchaseCourse(course.id)}
                                  disabled={purchasingCourse === course.id}
                                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {purchasingCourse === course.id ? (
                                    <>
                                      <i className="fas fa-spinner fa-spin mr-2"></i>
                                      Memproses...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-shopping-cart mr-2"></i>
                                      Beli Kursus
                                    </>
                                  )}
                                </button>
                                <Link
                                  href={`/courses/${course.id}/preview`}
                                  className="block w-full border border-blue-600 text-blue-600 text-center py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                >
                                  Preview Gratis
                                </Link>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Siap Memulai Perjalanan Belajar?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan siswa yang telah berhasil lulus ujian SSW dengan bantuan platform kami
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors"
              >
                Mulai Belajar Sekarang
              </Link>
              <a
                href="https://wa.me/6281234567890?text=Halo%20admin,%20saya%20ingin%20informasi%20tentang%20kursus%20SSW"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors inline-flex items-center justify-center"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Hubungi Admin
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}