'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { authManager } from '@/lib/auth';
import { User } from '@/types';
import { courses } from '@/data/courses';
import { COURSE_PRICING } from '@/lib/midtrans';
import { X } from 'lucide-react';

interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface HeaderProps {
  showNavigation?: boolean;
}

export default function Header({ showNavigation = true }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    setUser(authManager.user);
    const unsubscribe = authManager.subscribe(setUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadCartItems();
  }, [user]);

  const loadCartItems = () => {
    if (typeof window !== 'undefined' && user) {
      const cart = localStorage.getItem(`cart_${user.id}`);
      if (cart) {
        try {
          const items = JSON.parse(cart);
          // Convert cart items from {courseId, addedAt} format to {id, title, price, image} format
          const validItems = items
            .filter((item: any) => item && typeof item.courseId === 'string')
            .map((item: any) => {
              const course = courses.find(c => c.id === item.courseId);
              if (!course) return null;
              
              return {
                id: course.id,
                title: course.title,
                price: COURSE_PRICING.PER_COURSE,
                image: course.logo
              };
            })
            .filter(Boolean) as CartItem[];
          
          setCartItems(validItems);
          const total = validItems.reduce((sum: number, item: CartItem) => sum + (item.price || 0), 0);
          setCartTotal(total);
        } catch (error) {
          console.error('Error parsing cart data:', error);
          setCartItems([]);
          setCartTotal(0);
        }
      } else {
        setCartItems([]);
        setCartTotal(0);
      }
    }
  };

  const removeFromCart = (courseId: string) => {
    if (!user) return;
    
    const cart = localStorage.getItem(`cart_${user.id}`);
    if (cart) {
      try {
        const items = JSON.parse(cart);
        const updatedItems = items.filter((item: any) => item.courseId !== courseId);
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(updatedItems));
        
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
        
        // Reload cart items
        loadCartItems();
      } catch (error) {
        console.error('Error removing item from cart:', error);
      }
    }
  };

  useEffect(() => {
    loadCartItems();
    
    // Listen for storage changes to update cart when items are added from other pages
    const handleStorageChange = () => loadCartItems();
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom cart update events
    const handleCartUpdate = () => loadCartItems();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Refresh cart every 2 seconds to ensure sync
    const interval = setInterval(loadCartItems, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    authManager.logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
              <Image
                src="/images/logos/logo1.png"
                alt="SSW Learning Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl font-bold text-blue-600">SSW Learning</h1>
                <p className="text-xs text-gray-500">Kinabaru E-Learning</p>
              </div>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          {showNavigation && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Beranda
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-blue-600 transition-colors">
                Kursus
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              )}
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                Tentang
              </Link>
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            {user && (
              <div className="relative group">
                <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition-colors flex items-center p-2 relative">
                  <i className="fas fa-shopping-cart text-lg"></i>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                
                {/* Cart Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900">Keranjang Belanja</h3>
                      {cartItems.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {cartItems.length} item
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cartItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <i className="fas fa-shopping-cart text-3xl mb-2 opacity-50"></i>
                          <p>Keranjang kosong</p>
                        </div>
                      ) : (
                        cartItems.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 p-2 border rounded-lg group">
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                              <p className="text-sm text-blue-600 font-semibold">
                                Rp {item.price ? item.price.toLocaleString('id-ID') : '0'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFromCart(item.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700"
                              title="Hapus dari keranjang"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {cartItems.length > 0 && (
                      <>
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-900">Total:</span>
                            <span className="font-bold text-blue-600">
                              Rp {cartTotal ? cartTotal.toLocaleString('id-ID') : '0'}
                            </span>
                          </div>
                          <Link href="/cart" className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors">
                            Lihat Keranjang
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block font-medium">{user.username}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="fas fa-home mr-2"></i>
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="fas fa-user mr-2"></i>
                      Profil
                    </Link>
                    <Link
                      href="/cart"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <i className="fas fa-shopping-cart mr-2"></i>
                      Keranjang
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <i className="fas fa-cog mr-2"></i>
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Masuk
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {showNavigation && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {showNavigation && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                href="/courses"
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kursus
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tentang
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
}