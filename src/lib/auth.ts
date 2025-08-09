'use client';

import { User, AuthSession } from '@/types';
import { UserService } from './dynamodb-service';
import bcrypt from 'bcryptjs';

class AuthManager implements AuthSession {
  private _user: User | null = null;
  private _isAuthenticated: boolean = false;
  private listeners: Array<(user: User | null) => void> = [];
  private validationInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  get user(): User | null {
    return this._user;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  private loadFromStorage(): void {
    try {
      const userData = localStorage.getItem('kinabaru_user');
      const authStatus = localStorage.getItem('kinabaru_auth');
      
      if (userData && authStatus === 'true') {
        this._user = JSON.parse(userData);
        this._isAuthenticated = true;
        // Start validation timer for existing session
        this.startValidationTimer();
      }
    } catch (error) {
      console.error('Error loading auth data from storage:', error);
      this.logout();
    }
  }

  private saveToStorage(): void {
    try {
      if (this._user) {
        localStorage.setItem('kinabaru_user', JSON.stringify(this._user));
        localStorage.setItem('kinabaru_auth', 'true');
      } else {
        localStorage.removeItem('kinabaru_user');
        localStorage.removeItem('kinabaru_auth');
      }
    } catch (error) {
      console.error('Error saving auth data to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this._user));
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      // Use API endpoint to login and set HTTP cookie
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this._user = data.user as User;
          this._isAuthenticated = true;
          this.saveToStorage();
          this.notifyListeners();
          // Start validation timer after successful login
          this.startValidationTimer();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async refreshUserData(): Promise<void> {
     if (this._user && this._user.email) {
       try {
         // Get fresh user data from DynamoDB
         const freshUser = await UserService.getUserByEmail(this._user.email);
         if (freshUser) {
           const { password: _, ...userWithoutPassword } = freshUser;
           this._user = userWithoutPassword as User;
           this.saveToStorage();
           this.notifyListeners();
         } else {
           // User not found in database - they have been deleted
           console.log('User not found in database, logging out...');
           this.logout();
         }
       } catch (error) {
         console.error('Error refreshing user data:', error);
       }
     }
   }

  // Force refresh user data (useful when admin updates user data)
  async forceRefreshUserData(): Promise<void> {
    await this.refreshUserData();
  }

  logout(): void {
    this._user = null;
    this._isAuthenticated = false;
    this.stopValidationTimer();
    this.saveToStorage();
    this.notifyListeners();
    
    // Clear HTTP cookie via API
    if (typeof window !== 'undefined') {
      fetch('/api/auth/login', {
        method: 'DELETE',
      }).catch(error => {
        console.error('Error clearing auth cookie:', error);
      });
      
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  // Start periodic validation to check if user still exists
  private startValidationTimer(): void {
    if (typeof window === 'undefined') return;
    
    // Clear existing timer
    this.stopValidationTimer();
    
    // Check every 5 minutes
    this.validationInterval = setInterval(async () => {
      await this.refreshUserData();
    }, 5 * 60 * 1000);
  }

  // Stop validation timer
  private stopValidationTimer(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = null;
    }
  }

  checkAuth(): boolean {
    if (!this._isAuthenticated || !this._user) {
      return false;
    }



    return true;
  }

  requireAuth(): void {
    if (!this.checkAuth()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  requireRole(role: 'student' | 'admin'): void {
    this.requireAuth();
    if (this._user?.role !== role) {
      throw new Error('Unauthorized access');
    }
  }

  hasAccessToCourse(courseId: string): boolean {
    if (!this._user) return false;
    if (this._user.role === 'admin') return true;
    
    // Check new per-course access system
    if (this._user.purchasedCourses && Array.isArray(this._user.purchasedCourses)) {
      const courseAccess = this._user.purchasedCourses.find(course => course.courseId === courseId);
      if (courseAccess) {
        const now = new Date();
        const expiryDate = new Date(courseAccess.expiryDate);
        return courseAccess.isActive && expiryDate > now;
      }
    }
    
    // No fallback needed - only use purchasedCourses system
    return false;
  }

  // Get active courses (non-expired purchased courses)
  getActiveCourses(): string[] {
    if (!this._user) return [];
    if (this._user.role === 'admin') return []; // Admins have access to all courses
    
    const activeCourses: string[] = [];
    const now = new Date();
    
    // Check purchased courses - ensure it's always treated as array
    if (this._user.purchasedCourses && Array.isArray(this._user.purchasedCourses)) {
      this._user.purchasedCourses.forEach((courseAccess) => {
        if (courseAccess && courseAccess.courseId && courseAccess.expiryDate) {
          const expiryDate = new Date(courseAccess.expiryDate);
          if (courseAccess.isActive && expiryDate > now) {
            activeCourses.push(courseAccess.courseId);
          }
        }
      });
    }
    
    // No need for backward compatibility with enrolledCourses
    
    return activeCourses;
  }

  // Get course access info
  getCourseAccess(courseId: string): { hasAccess: boolean; expiryDate?: string; daysRemaining?: number } {
    if (!this._user) return { hasAccess: false };
    if (this._user.role === 'admin') return { hasAccess: true };
    
    // Check purchased courses
    if (this._user.purchasedCourses && Array.isArray(this._user.purchasedCourses)) {
      const courseAccess = this._user.purchasedCourses.find(course => course.courseId === courseId);
      
      if (courseAccess) {
        const now = new Date();
        const expiryDate = new Date(courseAccess.expiryDate);
        const diffTime = expiryDate.getTime() - now.getTime();
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
          hasAccess: courseAccess.isActive && expiryDate > now,
          expiryDate: courseAccess.expiryDate,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0
        };
      }
    }
    
    return { hasAccess: false };
  }

  // Check if course will expire soon (within 10 days)
  isCourseExpiringSoon(courseId: string): boolean {
    const access = this.getCourseAccess(courseId);
    return access.hasAccess && access.daysRemaining !== undefined && access.daysRemaining <= 10 && access.daysRemaining > 0;
  }

  // Get all courses that are expiring soon
  getExpiringSoonCourses(): Array<{ courseId: string; daysRemaining: number }> {
    if (!this._user || this._user.role === 'admin') return [];
    
    const expiringSoon: Array<{ courseId: string; daysRemaining: number }> = [];
    
    if (this._user.purchasedCourses && Array.isArray(this._user.purchasedCourses)) {
      this._user.purchasedCourses.forEach(courseAccess => {
        const access = this.getCourseAccess(courseAccess.courseId);
        if (access.hasAccess && access.daysRemaining !== undefined && access.daysRemaining <= 10 && access.daysRemaining > 0) {
          expiringSoon.push({ courseId: courseAccess.courseId, daysRemaining: access.daysRemaining });
        }
      });
    }
    
    return expiringSoon;
  }

  // Verify user password
  async verifyPassword(username: string, password: string): Promise<boolean> {
    try {
      // Try to find user by email first, then by username
      let user = await UserService.getUserByEmail(username);
      
      if (!user) {
        // If not found by email, try to find by username
        const allUsers = await UserService.getAllUsers();
        const foundUser = allUsers.find(u => u.username === username);
        if (foundUser && foundUser.email) {
          user = await UserService.getUserByEmail(foundUser.email);
        }
      }
      
      if (!user) return false;
      
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

}

// Create singleton instance
export const authManager = new AuthManager();

// Export for backward compatibility
export default authManager;