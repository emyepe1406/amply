'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authManager } from '@/lib/auth';
import { users } from '@/data/users';
import { courses } from '@/data/courses';
import { User } from '@/types';
import { useAuthValidation } from '@/hooks/useUserValidation';

export default function AdminDashboard() {
  // Hook untuk validasi otomatis dan logout jika user dihapus
  useAuthValidation();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCourses: 0,
    activeUsers: 0,
    completedCourses: 0
  });
  const router = useRouter();

  useEffect(() => {
    const currentUser = authManager.user;
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    calculateStats();
    setLoading(false);
  }, [router]);

  const calculateStats = () => {
    const totalUsers = users.length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalCourses = courses.length;
    
    // Calculate active users (users with active courses)
    const now = new Date();
    const activeUsers = users.filter(u => {
      if (u.purchasedCourses && Array.isArray(u.purchasedCourses) && u.purchasedCourses.length > 0) {
        return u.purchasedCourses.some((course: any) => {
          const expiryDate = new Date(course.expiryDate);
          return course.isActive && expiryDate > now;
        });
      }
      return false;
    }).length;

    // Calculate completed courses
    let completedCourses = 0;
    users.forEach(u => {
      Object.values(u.progress || {}).forEach(progress => {
        if (progress.progressPercentage === 100) {
          completedCourses++;
        }
      });
    });

    setStats({
      totalUsers,
      totalStudents,
      totalCourses,
      activeUsers,
      completedCourses
    });
  };

  const handleLogout = () => {
    authManager.logout();
    router.push('/login');
  };

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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <i className="fas fa-user-graduate text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <i className="fas fa-book text-purple-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <i className="fas fa-user-check text-yellow-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <i className="fas fa-trophy text-indigo-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
              <p className="text-sm text-gray-600">Add, edit, or remove users</p>
            </div>
          </Link>

          <Link
            href="/admin/courses"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book text-green-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Courses</h3>
              <p className="text-sm text-gray-600">Create and edit courses</p>
            </div>
          </Link>

          <Link
            href="/admin/transactions"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-credit-card text-orange-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Transactions</h3>
              <p className="text-sm text-gray-600">View payment history</p>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-chart-bar text-purple-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
              <p className="text-sm text-gray-600">View detailed reports</p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-cog text-yellow-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
              <p className="text-sm text-gray-600">System configuration</p>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {users.filter(u => u.role === 'student').slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-gray-600"></i>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{student.username}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Courses: {student.enrolledCourses.length}</p>
                      <p className="text-xs text-gray-500">Status: Active</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/users"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  View all users →
                </Link>
              </div>
            </div>
          </div>

          {/* Course Progress */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => {
                  const enrolledCount = users.filter(u => 
                    u.enrolledCourses.includes(course.id)
                  ).length;
                  const completedCount = users.filter(u => 
                    u.progress?.[course.id]?.progressPercentage === 100
                  ).length;
                  
                  return (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <i className={`${course.icon} text-blue-600`}></i>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{course.title}</p>
                          <p className="text-xs text-gray-500">{course.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Enrolled: {enrolledCount}</p>
                        <p className="text-xs text-gray-500">Completed: {completedCount}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4">
                <Link
                  href="/admin/courses"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  View all courses →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}