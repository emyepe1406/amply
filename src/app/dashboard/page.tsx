'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { authManager } from '@/lib/auth';
import { CourseService, TestimonialService } from '@/lib/dynamodb-service';
import { User, Course } from '@/types';
import { useAuthValidation } from '@/hooks/useUserValidation';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [testimonial, setTestimonial] = useState('');
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  const router = useRouter();

  // Enable automatic user validation and logout if user is deleted
  useAuthValidation();

  useEffect(() => {
    const initializeDashboard = async () => {
      // Wait a bit for authManager to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh user data to get latest purchases
      await authManager.refreshUserData();
      
      const currentUser = authManager.user;
      if (currentUser) {
        setUser(currentUser);
        
        // Load active courses (only non-expired courses)
        try {
          const activeCourseIds = authManager.getActiveCourses();
          const coursePromises = activeCourseIds.map(courseId => 
            CourseService.getCourseById(courseId)
          );
          const coursesData = await Promise.all(coursePromises);
          const validCourses = coursesData.filter(Boolean) as Course[];
          setEnrolledCourses(validCourses);
        } catch (error) {
          console.error('Error loading courses:', error);
        }
      }
      
      setLoading(false);
    };

    initializeDashboard();

    // Subscribe to user data changes
    const unsubscribe = authManager.subscribe(async (updatedUser) => {
      if (updatedUser && updatedUser.role === 'student') {
        setUser(updatedUser);
        try {
          const activeCourseIds = authManager.getActiveCourses();
          const coursePromises = activeCourseIds.map(courseId => 
            CourseService.getCourseById(courseId)
          );
          const coursesData = await Promise.all(coursePromises);
          const validCourses = coursesData.filter(Boolean) as Course[];
          setEnrolledCourses(validCourses);
        } catch (error) {
          console.error('Error loading courses:', error);
        }
      }
    });

    // Set up periodic refresh to catch admin updates
    const refreshInterval = setInterval(async () => {
      await authManager.forceRefreshUserData();
    }, 30000); // Refresh every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [router]);

  const loadEnrolledCourses = async (courseIds: string[]) => {
    try {
      const coursePromises = courseIds.map(courseId => 
        CourseService.getCourseById(courseId)
      );
      const coursesData = await Promise.all(coursePromises);
      const validCourses = coursesData.filter(Boolean) as Course[];
      setEnrolledCourses(validCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const calculateOverallProgress = (): number => {
    if (!user || !user.progress) return 0;
    
    const progressValues = Object.values(user.progress);
    if (progressValues.length === 0) return 0;
    
    const totalProgress = progressValues.reduce((sum, progress) => sum + progress.progressPercentage, 0);
    return Math.round(totalProgress / progressValues.length);
  };



  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testimonial.trim() && user) {
      try {
        await TestimonialService.createTestimonial({
           userId: user.id,
           userName: user.username,
           courseId: 'general', // You can modify this to be course-specific
           courseName: 'General Feedback',
           rating: 5, // You can add a rating input field
           comment: testimonial.trim(),
           createdAt: new Date().toISOString()
         });
        
        setTestimonialSubmitted(true);
        setTestimonial('');
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setTestimonialSubmitted(false);
        }, 3000);
      } catch (error) {
        console.error('Error submitting testimonial:', error);
        alert('Error submitting testimonial. Please try again.');
      }
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Memuat dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang, {user.username}!
              </h1>
              <p className="text-gray-600">
                Lanjutkan perjalanan belajar Anda untuk persiapan ujian SSW Jepang
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl">👋</div>
            </div>
          </div>
        </div>

        {/* Course Expiry Warnings */}
        {(() => {
          const expiringSoonCourses = authManager.getExpiringSoonCourses();
          if (expiringSoonCourses.length === 0) return null;
          
          return (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-orange-500 text-xl"></i>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-orange-800 mb-2">
                    ⚠️ Peringatan Masa Aktif Kursus
                  </h3>
                  <div className="space-y-2">
                    {expiringSoonCourses.map(({ courseId, daysRemaining }) => {
                      const course = enrolledCourses.find(c => c.id === courseId);
                      return (
                        <div key={courseId} className="flex items-center justify-between bg-white rounded-lg p-3 border border-orange-200">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{course?.icon || '📚'}</span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {course?.title || courseId}
                              </p>
                              <p className="text-sm text-orange-600">
                                Masa aktif berakhir dalam <strong>{daysRemaining} hari</strong>
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/courses/${courseId}`}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                            >
                              Lanjutkan Belajar
                            </Link>
                            <button
                              onClick={() => {
                                // TODO: Implement course renewal/extension
                                alert('Fitur perpanjangan akan segera tersedia. Hubungi admin untuk memperpanjang masa aktif kursus.');
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Perpanjang
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-sm text-orange-700">
                    <i className="fas fa-info-circle mr-1"></i>
                    Segera perpanjang masa aktif kursus Anda untuk tetap dapat mengakses materi pembelajaran.
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Progress Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Progress Keseluruhan</h2>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Kemajuan Program</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="ml-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{overallProgress}%</div>
              <div className="text-sm text-gray-500">Selesai</div>
            </div>
          </div>
        </div>



        {/* Courses Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Kursus Saya</h2>
          
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Kursus</h3>
              <p className="text-gray-600 mb-4">Anda belum terdaftar di kursus manapun</p>
              <Link
                href="/courses"
                className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Lihat Kursus Tersedia
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                const courseProgress = user.progress?.[course.id];
                const progressPercentage = courseProgress?.progressPercentage || 0;
                
                return (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="text-3xl mr-3">{course.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500 capitalize">{course.category}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {course.chapters.length} Bab
                      </span>
                      <Link
                        href={`/courses/${course.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Mulai Belajar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Testimonial Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Berikan Testimoni</h2>
          <p className="text-gray-600 mb-4">
            Bagikan pengalaman Anda menggunakan platform pembelajaran ini
          </p>
          
          {testimonialSubmitted ? (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <i className="fas fa-check-circle mr-2"></i>
                Terima kasih! Testimoni Anda telah berhasil dikirim.
              </div>
            </div>
          ) : (
            <form onSubmit={handleTestimonialSubmit}>
              <textarea
                value={testimonial}
                onChange={(e) => setTestimonial(e.target.value)}
                placeholder="Tulis testimoni Anda di sini..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                required
              ></textarea>
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Kirim Testimoni
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}