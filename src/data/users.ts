import { User } from '@/types';

export const users: User[] = [
  // Admin users
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@kinabaru.com',
    role: 'admin',
    enrolledCourses: [],
    progress: {},

  },
  {
    id: 'admin-2',
    username: 'superadmin',
    email: 'superadmin@kinabaru.com',
    role: 'admin',
    enrolledCourses: [],
    progress: {},

  },
  
  // Student users
  {
    id: 'student-1',
    username: 'tri_hartarto',
    email: 'tri.hartarto@email.com',
    role: 'student',
    enrolledCourses: ['driver-truk', 'driver-bis'],
    progress: {
      'driver-truk': {
        courseId: 'driver-truk',
        completedChapters: [1, 2],
        completedExercises: [],
        examResults: [],
        lastAccessed: '2025-01-15',
        progressPercentage: 50
      }
    },

  },
  {
    id: 'student-2',
    username: 'andri_suwanto',
    email: 'andri.suwanto@email.com',
    role: 'student',
    enrolledCourses: ['driver-truk'],
    progress: {
      'driver-truk': {
        courseId: 'driver-truk',
        completedChapters: [1, 2, 3, 4],
        completedExercises: [],
        examResults: [
          {
            examId: 'driver-truk-final',
            score: 85,
            totalQuestions: 50,
            correctAnswers: 42,
            completedAt: '2025-01-10',
            timeSpent: 75,
            passed: true
          }
        ],
        lastAccessed: '2025-01-10',
        progressPercentage: 100
      }
    }
  },
  {
    id: 'student-3',
    username: 'dahsyat_persada',
    email: 'dahsyat.persada@email.com',
    role: 'student',
    enrolledCourses: ['driver-truk', 'seibi'],
    progress: {
      'driver-truk': {
        courseId: 'driver-truk',
        completedChapters: [1, 2, 3],
        completedExercises: [],
        examResults: [],
        lastAccessed: '2025-01-12',
        progressPercentage: 75
      }
    }
  },
  {
    id: 'student-4',
    username: 'demo',
    email: 'demo@student.com',
    role: 'student',
    enrolledCourses: ['driver-bis', 'driver-taxi', 'restoran'],
    progress: {
      'driver-bis': {
        courseId: 'driver-bis',
        completedChapters: [1],
        completedExercises: [],
        examResults: [],
        lastAccessed: '2025-01-14',
        progressPercentage: 33
      }
    }
  },
  {
    id: 'student-5',
    username: 'test_user',
    email: 'test@user.com',
    role: 'student',
    enrolledCourses: ['ground-handling', 'building-cleaning'],
    progress: {}
  }
];

// Default passwords for demo (in real app, these would be hashed)
export const userCredentials: Record<string, string> = {
  'admin': 'admin123',
  'superadmin': 'super123',
  'tri_hartarto': 'password123',
  'andri_suwanto': 'password123',
  'dahsyat_persada': 'password123',
  'demo': 'demo123',
  'test_user': 'test123'
};

export const getUserByUsername = (username: string): User | undefined => {
  return users.find(user => user.username === username);
};

export const validateCredentials = (username: string, password: string): boolean => {
  return userCredentials[username] === password;
};

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const updateUser = (updatedUser: User): boolean => {
  const index = users.findIndex(user => user.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    return true;
  }
  return false;
};

export const addUser = (newUser: User): boolean => {
  // Check if user already exists
  const existingUser = users.find(user => user.id === newUser.id || user.username === newUser.username);
  if (existingUser) {
    return false;
  }
  users.push(newUser);
  return true;
};

export const deleteUser = (userId: string): boolean => {
  const index = users.findIndex(user => user.id === userId);
  if (index !== -1) {
    users.splice(index, 1);
    return true;
  }
  return false;
};

export const getAllUsers = (): User[] => {
  return [...users];
};