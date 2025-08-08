'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Brain, PenTool, Trophy, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Chapter {
  id: number;
  title: string;
  description: string;
  modules: {
    flashcard: { completed: boolean; progress: number };
    vocabulary: { completed: boolean; progress: number };
    material: { completed: boolean; progress: number };
    exercise: { completed: boolean; progress: number };
  };
  unlocked: boolean;
  overallProgress: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

const courseData: Record<string, Course> = {
  'drivertruk': {
    id: 'drivertruk',
    title: 'Mengemudi Truk',
    description: 'Kursus lengkap untuk menjadi driver truk profesional',
    chapters: [
      {
        id: 1,
        title: 'Bab 1: バス運転者の基本',
        description: 'Materi pembelajaran untuk bab ini',
        modules: {
          flashcard: { completed: true, progress: 100 },
          vocabulary: { completed: true, progress: 100 },
          material: { completed: true, progress: 100 },
          exercise: { completed: true, progress: 100 }
        },
        unlocked: true,
        overallProgress: 100
      },
      {
        id: 2,
        title: 'Bab 2: 乗客サービス',
        description: 'Materi pembelajaran untuk bab ini',
        modules: {
          flashcard: { completed: false, progress: 60 },
          vocabulary: { completed: false, progress: 40 },
          material: { completed: true, progress: 100 },
          exercise: { completed: false, progress: 20 }
        },
        unlocked: true,
        overallProgress: 55
      },
      {
        id: 3,
        title: 'Bab 3: 安全運転',
        description: 'Materi pembelajaran untuk bab ini',
        modules: {
          flashcard: { completed: false, progress: 0 },
          vocabulary: { completed: false, progress: 0 },
          material: { completed: false, progress: 0 },
          exercise: { completed: false, progress: 0 }
        },
        unlocked: false,
        overallProgress: 0
      }
    ]
  }
};

const moduleIcons = {
  material: FileText,
  flashcard: Brain,
  vocabulary: BookOpen,
  exercise: PenTool
};

const moduleNames = {
  material: 'Materi',
  flashcard: 'Flashcard',
  vocabulary: 'Kosakata',
  exercise: 'Latihan Soal'
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chapters');

  const courseId = params.courseId as string;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Simulate loading course data
    setTimeout(() => {
      const courseInfo = courseData[courseId];
      if (courseInfo) {
        setCourse(courseInfo);
      }
      setLoading(false);
    }, 1000);
  }, [courseId, user, router]);

  const handleChapterAction = (chapterId: number) => {
    if (!course) return;
    
    const chapter = course.chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.unlocked) return;

    // Navigate to chapter overview or first available module
    router.push(`/course/${courseId}/chapter/${chapterId}`);
  };

  const getChapterStatus = (chapter: Chapter) => {
    if (chapter.overallProgress === 100) return 'completed';
    if (chapter.overallProgress > 0) return 'in-progress';
    return 'not-started';
  };

  const getStatusIcon = (chapter: Chapter) => {
    const status = getChapterStatus(chapter);
    if (status === 'completed') return <CheckCircle className="h-6 w-6 text-white" />;
    if (status === 'in-progress') return <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">{chapter.id}</div>;
    if (!chapter.unlocked) return <Lock className="h-6 w-6 text-white" />;
    return <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">{chapter.id}</div>;
  };

  const getStatusColor = (chapter: Chapter) => {
    const status = getChapterStatus(chapter);
    if (status === 'completed') return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500';
    if (!chapter.unlocked) return 'bg-gray-400';
    return 'bg-blue-500';
  };

  const getActionButton = (chapter: Chapter) => {
    const status = getChapterStatus(chapter);
    if (!chapter.unlocked) return null;
    
    if (status === 'completed') {
      return (
        <Button 
          variant="outline" 
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          onClick={() => handleChapterAction(chapter.id)}
        >
          Review
        </Button>
      );
    }
    
    return (
      <Button 
        className="bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => handleChapterAction(chapter.id)}
      >
        {status === 'in-progress' ? 'Lanjutkan' : 'Mulai'}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kursus...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Kursus Tidak Ditemukan</h1>
          <Button onClick={() => router.push('/dashboard')}>Kembali ke Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
            >
              Kembali ke Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Ringkasan
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chapters' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('chapters')}
            >
              Daftar Bab ({course.chapters.length})
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requirements' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('requirements')}
            >
              Persyaratan
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chapters' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Daftar Bab</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {course.chapters.map((chapter) => (
                <div key={chapter.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(chapter)}`}>
                      {getStatusIcon(chapter)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
                      <p className="text-sm text-gray-500">{chapter.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {chapter.unlocked && chapter.overallProgress > 0 && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="text-sm font-medium">{chapter.overallProgress}%</div>
                      </div>
                    )}
                    {getActionButton(chapter)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ringkasan Kursus</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{course.chapters.length}</div>
                  <div className="text-sm text-gray-600">Total Bab</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {course.chapters.filter(c => c.overallProgress === 100).length}
                  </div>
                  <div className="text-sm text-gray-600">Bab Selesai</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(course.chapters.reduce((acc, c) => acc + c.overallProgress, 0) / course.chapters.length)}%
                  </div>
                  <div className="text-sm text-gray-600">Progress Keseluruhan</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Persyaratan</h2>
            <div className="prose max-w-none">
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Memiliki SIM A yang masih berlaku</li>
                <li>Pengalaman mengemudi minimal 2 tahun</li>
                <li>Sehat jasmani dan rohani</li>
                <li>Mampu membaca dan menulis</li>
                <li>Berusia minimal 21 tahun</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}