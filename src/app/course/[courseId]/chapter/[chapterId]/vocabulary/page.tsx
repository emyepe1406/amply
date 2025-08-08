'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Volume2, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface VocabularyItem {
  id: number;
  japanese: string;
  indonesian: string;
  romaji: string;
  category: string;
  example?: string;
  mastered: boolean;
}

interface VocabularyQuiz {
  question: string;
  options: string[];
  correctAnswer: number;
  vocabularyId: number;
}

export default function VocabularyPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>([]);
  const [currentMode, setCurrentMode] = useState<'study' | 'quiz'>('study');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [quizData, setQuizData] = useState<VocabularyQuiz[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [loading, setLoading] = useState(true);

  const courseId = params.courseId as string;
  const chapterId = parseInt(params.chapterId as string);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadVocabulary();
  }, [courseId, chapterId, user, router]);

  const loadVocabulary = async () => {
    try {
      // Simulate loading vocabulary data from Excel
      const mockVocabulary: VocabularyItem[] = [
        {
          id: 1,
          japanese: "トラック",
          indonesian: "Truk",
          romaji: "torakku",
          category: "Kendaraan",
          example: "大きなトラックが道路を走っています。(Torakku besar sedang berjalan di jalan.)",
          mastered: false
        },
        {
          id: 2,
          japanese: "運転手",
          indonesian: "Pengemudi",
          romaji: "untenshu",
          category: "Profesi",
          example: "彼は経験豊富な運転手です。(Dia adalah pengemudi yang berpengalaman.)",
          mastered: false
        },
        {
          id: 3,
          japanese: "安全",
          indonesian: "Keselamatan",
          romaji: "anzen",
          category: "Keselamatan",
          example: "安全運転を心がけましょう。(Mari kita mengutamakan mengemudi yang aman.)",
          mastered: false
        },
        {
          id: 4,
          japanese: "荷物",
          indonesian: "Barang/Muatan",
          romaji: "nimotsu",
          category: "Muatan",
          example: "トラックに荷物を積みます。(Memuat barang ke dalam truk.)",
          mastered: false
        },
        {
          id: 5,
          japanese: "ブレーキ",
          indonesian: "Rem",
          romaji: "bureeki",
          category: "Komponen",
          example: "急ブレーキをかけました。(Mengerem mendadak.)",
          mastered: false
        },
        {
          id: 6,
          japanese: "道路",
          indonesian: "Jalan",
          romaji: "douro",
          category: "Infrastruktur",
          example: "この道路は工事中です。(Jalan ini sedang dalam perbaikan.)",
          mastered: false
        },
        {
          id: 7,
          japanese: "信号",
          indonesian: "Lampu Lalu Lintas",
          romaji: "shingou",
          category: "Lalu Lintas",
          example: "信号が赤になりました。(Lampu lalu lintas menjadi merah.)",
          mastered: false
        },
        {
          id: 8,
          japanese: "駐車",
          indonesian: "Parkir",
          romaji: "chuusha",
          category: "Aktivitas",
          example: "ここに駐車してください。(Silakan parkir di sini.)",
          mastered: false
        }
      ];

      setVocabularies(mockVocabulary);
      generateQuiz(mockVocabulary);
      setLoading(false);
    } catch (error) {
      console.error('Error loading vocabulary:', error);
      setLoading(false);
    }
  };

  const generateQuiz = (vocabList: VocabularyItem[]) => {
    const quiz: VocabularyQuiz[] = vocabList.map(vocab => {
      // Create wrong options by selecting other vocabulary items
      const wrongOptions = vocabList
        .filter(v => v.id !== vocab.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(v => v.indonesian);
      
      const allOptions = [vocab.indonesian, ...wrongOptions].sort(() => Math.random() - 0.5);
      const correctAnswer = allOptions.indexOf(vocab.indonesian);

      return {
        question: `Apa arti dari "${vocab.japanese}" (${vocab.romaji})?`,
        options: allOptions,
        correctAnswer,
        vocabularyId: vocab.id
      };
    });

    setQuizData(quiz);
  };

  const toggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };

  const markAsMastered = (mastered: boolean) => {
    const updatedVocab = [...vocabularies];
    updatedVocab[currentIndex].mastered = mastered;
    setVocabularies(updatedVocab);
  };

  const nextVocabulary = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowTranslation(false);
    } else {
      setCurrentIndex(0);
      setShowTranslation(false);
    }
  };

  const prevVocabulary = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowTranslation(false);
    } else {
      setCurrentIndex(vocabularies.length - 1);
      setShowTranslation(false);
    }
  };

  const startQuiz = () => {
    setCurrentMode('quiz');
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setQuizScore(0);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuizQuestion = () => {
    if (selectedAnswer !== null) {
      if (selectedAnswer === quizData[currentQuizIndex].correctAnswer) {
        setQuizScore(quizScore + 1);
      }

      if (currentQuizIndex < quizData.length - 1) {
        setCurrentQuizIndex(currentQuizIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowQuizResult(true);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuizIndex(0);
    setSelectedAnswer(null);
    setShowQuizResult(false);
    setQuizScore(0);
  };

  const getMasteredCount = () => {
    return vocabularies.filter(v => v.mastered).length;
  };

  const getProgress = () => {
    return vocabularies.length > 0 ? (getMasteredCount() / vocabularies.length) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kosakata...</p>
        </div>
      </div>
    );
  }

  if (currentMode === 'quiz') {
    if (showQuizResult) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Hasil Kuis Kosakata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-6xl font-bold text-blue-600">
                  {Math.round((quizScore / quizData.length) * 100)}%
                </div>
                <p className="text-lg">
                  Anda menjawab {quizScore} dari {quizData.length} pertanyaan dengan benar
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={resetQuiz}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Ulangi Kuis
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentMode('study')}>
                    Kembali ke Belajar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    const currentQuiz = quizData[currentQuizIndex];
    const quizProgress = ((currentQuizIndex + 1) / quizData.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Quiz Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kuis Kosakata BAB {chapterId}</h1>
                <p className="text-gray-600 text-sm">Pertanyaan {currentQuizIndex + 1} dari {quizData.length}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Progress value={quizProgress} className="w-24" />
                <Button variant="outline" onClick={() => setCurrentMode('study')}>Kembali</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-xl font-medium mb-6">{currentQuiz.question}</div>
              <div className="space-y-3 mb-6">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleQuizAnswer(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentMode('study')}
                >
                  Kembali ke Belajar
                </Button>
                <Button 
                  onClick={nextQuizQuestion}
                  disabled={selectedAnswer === null}
                >
                  {currentQuizIndex === quizData.length - 1 ? 'Selesai' : 'Selanjutnya'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentVocab = vocabularies[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kosakata BAB {chapterId}</h1>
                <p className="text-gray-600 text-sm">
                  {getMasteredCount()} dari {vocabularies.length} kosakata dikuasai
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Progress</p>
                <div className="flex items-center space-x-2">
                  <Progress value={getProgress()} className="w-24" />
                  <span className="text-sm font-medium">{Math.round(getProgress())}%</span>
                </div>
              </div>
              <Button onClick={startQuiz}>
                Mulai Kuis
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Vocabulary Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {/* Vocabulary Card */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-6 w-6 mr-2" />
                    Kosakata {currentIndex + 1} dari {vocabularies.length}
                  </CardTitle>
                  <Badge variant={currentVocab.mastered ? "default" : "secondary"}>
                    {currentVocab.mastered ? "Dikuasai" : "Belum Dikuasai"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {currentVocab.japanese}
                  </div>
                  <div className="text-lg text-gray-600 mb-4">
                    {currentVocab.romaji}
                  </div>
                  <Badge variant="outline">{currentVocab.category}</Badge>
                </div>

                {showTranslation && (
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-800 mb-2">
                      {currentVocab.indonesian}
                    </div>
                    {currentVocab.example && (
                      <div className="text-sm text-blue-700 mt-4">
                        <strong>Contoh:</strong><br />
                        {currentVocab.example}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center">
                  <Button onClick={toggleTranslation}>
                    {showTranslation ? 'Sembunyikan Arti' : 'Tampilkan Arti'}
                  </Button>
                </div>

                {showTranslation && (
                  <div className="flex justify-center space-x-4">
                    <Button 
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => markAsMastered(false)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Belum Dikuasai
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => markAsMastered(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sudah Dikuasai
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-center space-x-4">
              <Button 
                variant="outline" 
                onClick={prevVocabulary}
                disabled={vocabularies.length <= 1}
              >
                ← Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                onClick={nextVocabulary}
                disabled={vocabularies.length <= 1}
              >
                Selanjutnya →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}