'use client';

import { useEffect } from 'react';
import { authManager } from '@/lib/auth';

/**
 * Hook untuk memvalidasi user secara berkala dan pada aktivitas user
 * Mirip dengan sistem validasi di PHP lama
 */
export function useUserValidation() {
  useEffect(() => {
    // Validasi saat komponen mount
    const validateUser = async () => {
      if (authManager.isAuthenticated) {
        await authManager.refreshUserData();
      }
    };

    validateUser();

    // Event listener untuk aktivitas user
    const handleUserActivity = async () => {
      if (authManager.isAuthenticated) {
        await authManager.refreshUserData();
      }
    };

    // Tambahkan event listener untuk click dan keydown
    const events = ['click', 'keydown', 'mousemove', 'scroll'];
    
    // Throttle untuk menghindari terlalu banyak request
    let lastValidation = 0;
    const throttledValidation = async () => {
      const now = Date.now();
      if (now - lastValidation > 30000) { // Maksimal 1 kali per 30 detik
        lastValidation = now;
        await handleUserActivity();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, throttledValidation);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledValidation);
      });
    };
  }, []);
}

/**
 * Hook untuk validasi user pada halaman yang memerlukan autentikasi
 */
export function useAuthValidation() {
  useEffect(() => {
    const validateAndRedirect = async () => {
      if (!authManager.checkAuth()) {
        authManager.requireAuth();
        return;
      }
      
      // Refresh user data untuk memastikan user masih valid
      await authManager.refreshUserData();
    };

    validateAndRedirect();
  }, []);

  // Gunakan user validation hook
  useUserValidation();
}