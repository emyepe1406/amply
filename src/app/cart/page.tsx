'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Course } from '@/types';
import { authManager } from '@/lib/auth';
import { COURSE_PRICING } from '@/lib/midtrans';
import { courses } from '@/data/courses';
import { Trash2, ShoppingCart, ArrowLeft, CreditCard, BookOpen } from 'lucide-react';

interface CartItem {
  courseId: string;
  course: Course;
  addedAt: string;
}

export default function CartPage() {
  const router = useRouter();
  const [user, setUser] = useState(authManager.user);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Subscribe to auth changes
  useEffect(() => {
    const unsubscribe = authManager.subscribe((updatedUser) => {
      setUser(updatedUser);
    });
    return unsubscribe;
  }, []);

  // Load cart items from localStorage
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const savedCart = localStorage.getItem(`cart_${user.id}`);
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        const validItems = cartData.filter((item: any) => {
          const course = courses.find(c => c.id === item.courseId);
          return course && !authManager.getCourseAccess(item.courseId).hasAccess;
        }).map((item: any) => ({
          ...item,
          course: courses.find(c => c.id === item.courseId)!
        }));
        setCartItems(validItems);
        
        // Update localStorage if items were filtered out
        if (validItems.length !== cartData.length) {
          localStorage.setItem(`cart_${user.id}`, JSON.stringify(validItems));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem(`cart_${user.id}`);
      }
    }
  }, [user, router]);

  const removeFromCart = (courseId: string) => {
    if (!user) return;
    
    const updatedItems = cartItems.filter(item => item.courseId !== courseId);
    setCartItems(updatedItems);
    localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedItems));
  };

  const clearCart = () => {
    if (!user) return;
    
    setCartItems([]);
    localStorage.removeItem(`cart_${user.id}`);
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setIsProcessing(true);
    
    try {
      // For now, we'll process one course at a time
      // In the future, this could be enhanced to support multiple courses in one transaction
      const firstCourse = cartItems[0];
      
      const response = await fetch('/api/payment/midtrans/course/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email || `${user.username}@example.com`,
          userName: user.username,
          courseId: firstCourse.courseId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data?.redirect_url) {
        // Redirect directly to Midtrans payment page
        window.location.href = data.data.redirect_url;
      } else {
        alert(data.message || 'Terjadi kesalahan saat memproses pembayaran');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Terjadi kesalahan saat memproses pembayaran');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = cartItems.length * COURSE_PRICING.PER_COURSE;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link 
                href="/courses"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Kembali ke Kursus
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="w-8 h-8 mr-3" />
              Keranjang Belanja
            </h1>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Keranjang Anda Kosong
              </h2>
              <p className="text-gray-600 mb-8">
                Belum ada kursus yang ditambahkan ke keranjang. Mulai jelajahi kursus yang tersedia!
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Jelajahi Kursus
              </Link>
            </div>
          ) : (
            /* Cart with Items */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Item dalam Keranjang ({cartItems.length})
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Kosongkan Keranjang
                    </button>
                  )}
                </div>

                {cartItems.map((item) => (
                  <div key={item.courseId} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-4xl">{item.course.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.course.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {item.course.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {item.course.chapters.length} Chapter
                            </span>
                            <span>30 Hari Akses</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format(COURSE_PRICING.PER_COURSE)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.courseId)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ringkasan Pesanan
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cartItems.length} item)</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Biaya Admin</span>
                      <span className="font-medium text-green-600">Gratis</span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(totalAmount)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing || cartItems.length === 0}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Checkout Sekarang
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Pembayaran aman melalui Midtrans
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}