export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'student' | 'admin';
  enrolledCourses: string[];
  progress: Record<string, CourseProgress>;
  purchasedCourses?: CourseAccess[]; // Array of purchased courses with 30-day expiry
}

export interface CourseAccess {
  courseId: string;
  purchaseDate: string;
  expiryDate: string;
  isActive: boolean;
  transactionId?: string;
  referenceId?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  logo: string;
  chapters: Chapter[];
  isPopular?: boolean;
  category: 'driver' | 'service' | 'technical';
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  materials?: Material[];
  flashcards?: Flashcard[];
  exercises?: Exercise[];
  exam?: Exam;
}

export interface Material {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document';
  url?: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  image?: string;
}

export interface Exercise {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  image?: string;
}

export interface Exam {
  id: string;
  title: string;
  duration: number; // in minutes
  questions: Exercise[];
  passingScore: number;
}

export interface CourseProgress {
  courseId: string;
  completedChapters: number[];
  completedExercises: string[];
  examResults: ExamResult[];
  lastAccessed: string;
  progressPercentage: number;
}

export interface ExamResult {
  examId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  timeSpent: number; // in minutes
  passed: boolean;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

export interface UserProgress {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  rating: number;
  comment: string;
  createdAt: string;
}