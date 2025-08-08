'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Brain, PenTool, Trophy, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthValidation } from '@/hooks/useUserValidation';

interface Module {
  completed: boolean;
  progress: number;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  modules: {
    flashcard: Module;
    vocabulary: Module;
    material: Module;
    exercise: Module;
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

const moduleDescriptions = {
  material: 'Pelajari materi pembelajaran dalam bentuk teks dan gambar',
  flashcard: 'Latihan menggunakan kartu flash untuk mengingat konsep penting',
  vocabulary: 'Pelajari kosakata dan istilah-istilah penting',
  exercise: 'Kerjakan latihan soal untuk menguji pemahaman'
};

export default function ChapterPage() {
  // Hook untuk validasi otomatis dan logout jika user dihapus
  useAuthValidation();
  
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  const courseId = params.courseId as string;
  const chapterId = parseInt(params.chapterId as string);

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
        const chapterInfo = courseInfo.chapters.find(c => c.id === chapterId);
        if (chapterInfo) {
          setChapter(chapterInfo);
        }
      }
      setLoading(false);
    }, 1000);
  }, [courseId, chapterId, user, router]);

  const handleModuleClick = (moduleType: string) => {
    if (!course || !chapter || !chapter.unlocked) return;
    router.push(`/course/${courseId}/chapter/${chapterId}/${moduleType}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat bab...</p>
        </div>
      </div>
    );
  }

  if (!course || !chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Bab Tidak Ditemukan</h1>
          <Button onClick={() => router.push(`/course/${courseId}`)}>Kembali ke Kursus</Button>
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
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/course/${courseId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{chapter.title}</h1>
                <p className="text-gray-600 mt-2">{chapter.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Progress Bab</div>
              <div className="flex items-center space-x-2">
                <Progress value={chapter.overallProgress} className="w-32" />
                <span className="text-sm font-medium">{chapter.overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Modul Pembelajaran</h2>
          <p className="text-gray-600">Pilih modul pembelajaran yang ingin Anda pelajari</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(chapter.modules).map(([moduleType, moduleData]) => {
            const Icon = moduleIcons[moduleType as keyof typeof moduleIcons];
            const moduleName = moduleNames[moduleType as keyof typeof moduleNames];
            const moduleDescription = moduleDescriptions[moduleType as keyof typeof moduleDescriptions];
            
            return (
              <Card 
                key={moduleType}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  !chapter.unlocked ? 'pointer-events-none opacity-60' : 'hover:scale-105'
                }`}
                onClick={() => handleModuleClick(moduleType)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      moduleData.completed ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-8 w-8 ${
                        moduleData.completed ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{moduleName}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-4">{moduleDescription}</p>
                  
                  <div className="mb-4">
                    <Progress value={moduleData.progress} className="mb-2" />
                    <p className="text-xs text-gray-500">{moduleData.progress}% selesai</p>
                  </div>

                  {moduleData.completed ? (
                    <Badge variant="outline" className="w-full justify-center">
                      <Trophy className="h-3 w-3 mr-1" />
                      Selesai
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="w-full justify-center">
                      {moduleData.progress > 0 ? 'Lanjutkan' : 'Mulai'}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Chapter Summary */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Bab</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-sm text-gray-600">Total Modul</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(chapter.modules).filter(m => m.completed).length}
                  </div>
                  <div className="text-sm text-gray-600">Modul Selesai</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Object.values(chapter.modules).filter(m => m.progress > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Modul Dimulai</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{chapter.overallProgress}%</div>
                  <div className="text-sm text-gray-600">Progress Keseluruhan</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}