'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authManager } from '@/lib/auth';
import { users } from '@/data/users';
import { courses } from '@/data/courses';
import { User } from '@/types';
import { useAuthValidation } from '@/hooks/useUserValidation';

export default function AdminAnalytics() {
  // Hook untuk validasi otomatis dan logout jika user dihapus
  useAuthValidation();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const router = useRouter();

  useEffect(() => {
    const currentUser = authManager.user;
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  // Calculate analytics data
  const getAnalyticsData = () => {
    const totalStudents = users.filter(u => u.role === 'student').length;
    const activeStudents = users.filter(u => {
      if (u.role !== 'student') return false;
      // Check if user has any active courses
      if (u.purchasedCourses) {
        const now = new Date();
        return Object.values(u.purchasedCourses).some(courseAccess => {
          const expiryDate = new Date(courseAccess.expiryDate);
          return courseAccess.isActive && expiryDate > now;
        });
      }
      // No fallback needed - only use purchasedCourses system
      return false;
    }).length;

    const courseEnrollments = courses.map(course => {
      const enrolled = users.filter(u => {
        if (u.purchasedCourses) {
          return u.purchasedCourses.some(pc => pc.courseId === course.id);
        }
        return false;
      }).length;
      const completed = users.filter(u => 
        u.progress?.[course.id]?.progressPercentage === 100
      ).length;
      const inProgress = users.filter(u => 
        u.progress?.[course.id] && u.progress[course.id].progressPercentage > 0 && u.progress[course.id].progressPercentage < 100
      ).length;
      
      return {
        ...course,
        enrolled,
        completed,
        inProgress,
        completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0
      };
    });

    const categoryStats = courses.reduce((acc, course) => {
      const category = course.category;
      if (!acc[category]) {
        acc[category] = { enrolled: 0, completed: 0 };
      }
      
      const enrolled = users.filter(u => {
        if (u.purchasedCourses) {
          return u.purchasedCourses.some(pc => pc.courseId === course.id);
        }
        return false;
      }).length;
      const completed = users.filter(u => 
        u.progress?.[course.id]?.progressPercentage === 100
      ).length;
      
      acc[category].enrolled += enrolled;
      acc[category].completed += completed;
      
      return acc;
    }, {} as Record<string, { enrolled: number; completed: number }>);

    return {
      totalStudents,
      activeStudents,
      courseEnrollments,
      categoryStats
    };
  };

  const analytics = getAnalyticsData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-500">
                <i className="fas fa-arrow-left"></i>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={() => authManager.logout()}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fas fa-user-check text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <i className="fas fa-book text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <i className="fas fa-percentage text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.courseEnrollments.reduce((acc, course) => acc + course.completionRate, 0) / analytics.courseEnrollments.length)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Course Enrollments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Course Performance</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.courseEnrollments.map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <i className={`${course.icon} text-blue-600 text-sm`}></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{course.title}</h4>
                          <p className="text-xs text-gray-500">{course.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{course.completionRate}%</p>
                        <p className="text-xs text-gray-500">completion</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-blue-600">{course.enrolled}</p>
                        <p className="text-xs text-gray-500">Enrolled</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-yellow-600">{course.inProgress}</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-green-600">{course.completed}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${course.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Statistics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Category Statistics</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {Object.entries(analytics.categoryStats).map(([category, stats]) => {
                  const completionRate = stats.enrolled > 0 ? Math.round((stats.completed / stats.enrolled) * 100) : 0;
                  const categoryIcon = {
                    'Driver': 'fas fa-car',
                    'Service': 'fas fa-tools',
                    'Technical': 'fas fa-cog'
                  }[category] || 'fas fa-book';
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            <i className={`${categoryIcon} text-gray-600`}></i>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{category}</h4>
                            <p className="text-sm text-gray-500">{completionRate}% completion rate</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{stats.enrolled}</p>
                          <p className="text-sm text-gray-500">Total Enrolled</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                          <p className="text-sm text-gray-500">Completed</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {users.filter(u => u.role === 'student').slice(0, 10).map((student) => {
                const recentProgress = Object.values(student.progress || {}).sort((a, b) => 
                  new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
                )[0];
                
                if (!recentProgress) return null;
                
                const course = courses.find(c => c.id === recentProgress.courseId);
                
                return (
                  <div key={student.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{student.username}</p>
                        <p className="text-xs text-gray-500">
                          {recentProgress.progressPercentage === 100 ? 'Completed' : 'Studying'} {course?.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{recentProgress.progressPercentage}%</p>
                      <p className="text-xs text-gray-500">{recentProgress.lastAccessed}</p>
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}