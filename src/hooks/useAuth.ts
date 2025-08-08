'use client';

import { useState, useEffect } from 'react';
import { getUserByUsername, validateCredentials } from '@/data/users';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'student' | 'instructor';
  enrolledCourses?: string[];
  expiryDate?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (validateCredentials(username, password)) {
      const foundUser = getUserByUsername(username);
      if (foundUser) {
        const userSession: User = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role,
          enrolledCourses: foundUser.enrolledCourses,
          progress: foundUser.progress,
          purchasedCourses: foundUser.purchasedCourses,
        };
        
        setUser(userSession);
        localStorage.setItem('currentUser', JSON.stringify(userSession));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAuthenticated = (): boolean => {
    return user !== null;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const canAccessCourse = (courseId: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.enrolledCourses?.includes(courseId) || false;
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
    canAccessCourse,
  };
}