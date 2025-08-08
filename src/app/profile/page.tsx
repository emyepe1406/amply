'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { authManager } from '@/lib/auth';
import { UserService } from '@/lib/dynamodb-service';
import { User } from '@/types';
import { useAuthValidation } from '@/hooks/useUserValidation';
import { getCourseById } from '@/data/courses';

export default function ProfilePage() {
  // Hook untuk validasi otomatis dan logout jika user dihapus
  useAuthValidation();
  
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'purchases'>('profile');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    const initializeProfile = async () => {
      // Wait a bit for authManager to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const currentUser = authManager.user;
      if (currentUser) {
        setUser(currentUser);
        setProfileForm({
          username: currentUser.username,
          email: currentUser.email || ''
        });
      }
      
      setLoading(false);
    };

    initializeProfile();

    // Subscribe to user data changes
    const unsubscribe = authManager.subscribe((updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser);
        setProfileForm({
          username: updatedUser.username,
          email: updatedUser.email || ''
        });
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!user) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Password baru dan konfirmasi password tidak cocok');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password baru minimal 6 karakter');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Verify current password
      const isValidPassword = await authManager.verifyPassword(user.username, passwordForm.currentPassword);
      if (!isValidPassword) {
        setPasswordError('Password saat ini salah');
        setIsUpdating(false);
        return;
      }
      
      // Update password
      await UserService.updateUser(user.id, {
        password: passwordForm.newPassword
      });
      
      setPasswordSuccess('Password berhasil diubah');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError('Gagal mengubah password. Silakan coba lagi.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    
    if (!user) return;
    
    if (!profileForm.username.trim()) {
      setProfileError('Username tidak boleh kosong');
      return;
    }
    
    setIsUpdating(true);
    
    try {
      await UserService.updateUser(user.id, {
        username: profileForm.username.trim(),
        email: profileForm.email.trim()
      });
      
      // Refresh user data
      await authManager.refreshUserData();
      
      setProfileSuccess('Profil berhasil diperbarui');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileError('Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getPurchaseHistory = () => {
    if (!user?.purchasedCourses || !Array.isArray(user.purchasedCourses)) return [];
    
    return user.purchasedCourses.map((courseAccess: any) => {
      const course = getCourseById(courseAccess.courseId);
      const expiryDate = new Date(courseAccess.expiryDate);
      const now = new Date();
      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...courseAccess,
        courseTitle: course?.title || 'Unknown Course',
        courseIcon: course?.icon || '📚',
        courseDescription: course?.description || '',
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        isExpired: expiryDate <= now
      };
    }).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  };
  
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  
  const getDaysRemaining = (expiryDate: string) => {
    try {
      const expiry = new Date(expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Memuat profil...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const purchaseHistory = getPurchaseHistory();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <i className="fas fa-user text-2xl text-blue-600"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Profil Saya
              </h1>
              <p className="text-gray-600">
                Kelola informasi akun dan riwayat pembelian Anda
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-user mr-2"></i>
                Informasi Profil
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-lock mr-2"></i>
                Ubah Password
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'purchases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Riwayat Pembelian
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informasi Profil</h2>
                
                {profileError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <i className="fas fa-exclamation-circle text-red-400 mr-2 mt-0.5"></i>
                      <span className="text-red-700">{profileError}</span>
                    </div>
                  </div>
                )}
                
                {profileSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <i className="fas fa-check-circle text-green-400 mr-2 mt-0.5"></i>
                      <span className="text-green-700">{profileSuccess}</span>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      value={user.role === 'student' ? 'Siswa' : user.role === 'admin' ? 'Administrator' : user.role}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Bergabung
                    </label>
                    <input
                      type="text"
                      value={(user as any).createdAt ? formatDate((user as any).createdAt) : 'Tidak tersedia'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Ubah Password</h2>
                
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                      <i className="fas fa-exclamation-circle text-red-400 mr-2 mt-0.5"></i>
                      <span className="text-red-700">{passwordError}</span>
                    </div>
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <i className="fas fa-check-circle text-green-400 mr-2 mt-0.5"></i>
                      <span className="text-green-700">{passwordSuccess}</span>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Mengubah...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key mr-2"></i>
                        Ubah Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Riwayat Pembelian Kursus</h2>
                
                {purchaseHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-shopping-cart text-3xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Belum Ada Pembelian
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Anda belum membeli kursus apapun. Mulai belajar dengan membeli kursus pertama Anda!
                    </p>
                    <button
                      onClick={() => router.push('/courses')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <i className="fas fa-book mr-2"></i>
                      Lihat Kursus Tersedia
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchaseHistory.map((purchase: any, index: number) => {
                      const daysRemaining = getDaysRemaining(purchase.expiryDate);
                      const isExpired = daysRemaining <= 0;
                      const isExpiringSoon = daysRemaining <= 10 && daysRemaining > 0;
                      
                      return (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <span className="text-3xl mr-4">{purchase.courseIcon}</span>
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {purchase.courseTitle}
                                </h3>
                                <div className="space-y-1 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <i className="fas fa-calendar mr-2 w-4"></i>
                                    <span>Dibeli: {formatDate(purchase.purchaseDate)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <i className="fas fa-clock mr-2 w-4"></i>
                                    <span>Berakhir: {formatDate(purchase.expiryDate)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <i className="fas fa-info-circle mr-2 w-4"></i>
                                    <span>Course ID: {purchase.courseId}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {isExpired ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                  <i className="fas fa-times-circle mr-1"></i>
                                  Kedaluwarsa
                                </span>
                              ) : isExpiringSoon ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                  <i className="fas fa-exclamation-triangle mr-1"></i>
                                  {daysRemaining} hari lagi
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                  <i className="fas fa-check-circle mr-1"></i>
                                  Aktif ({daysRemaining} hari)
                                </span>
                              )}
                              
                              <div className="mt-2">
                                {purchase.isActive && !isExpired ? (
                                  <button
                                    onClick={() => router.push(`/courses/${purchase.courseId}`)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                  >
                                    <i className="fas fa-play mr-1"></i>
                                    Lanjutkan Belajar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      alert('Kursus sudah kedaluwarsa. Hubungi admin untuk memperpanjang atau beli ulang kursus.');
                                    }}
                                    className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                                    disabled
                                  >
                                    <i className="fas fa-lock mr-1"></i>
                                    Tidak Aktif
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Debug Information */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    <i className="fas fa-bug mr-2"></i>
                    Debug Information
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>User ID: {user.id}</div>
                    <div>Email: {user.email || 'Tidak ada'}</div>
                    <div>Purchased Courses Type: {Array.isArray(user.purchasedCourses) ? 'Array' : typeof user.purchasedCourses}</div>
                    <div>Purchased Courses Count: {Array.isArray(user.purchasedCourses) ? user.purchasedCourses.length : 'N/A'}</div>
                    <div>Raw Data: {JSON.stringify(user.purchasedCourses, null, 2)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}