'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy, PenTool } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  userAnswer?: number;
  isCorrect?: boolean;
}

interface ExerciseResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completed: boolean;
}

export default function ExercisePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [exerciseResult, setExerciseResult] = useState<ExerciseResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const courseId = params.courseId as string;
  const chapterId = parseInt(params.chapterId as string);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadQuestions();
    setStartTime(new Date());
  }, [courseId, chapterId, user, router]);

  const loadQuestions = async () => {
    try {
      // Simulate loading questions from Excel file
      const mockQuestions: Question[] = [
        {
          id: 1,
          question: "Apa yang harus dilakukan sebelum memulai perjalanan dengan truk?",
          options: [
            "Langsung menyalakan mesin",
            "Melakukan pemeriksaan keliling kendaraan",
            "Mengisi bahan bakar",
            "Memeriksa dokumen saja"
          ],
          correctAnswer: 1,
          explanation: "Pemeriksaan keliling kendaraan (walk around check) adalah prosedur wajib untuk memastikan kondisi kendaraan aman sebelum perjalanan."
        },
        {
          id: 2,
          question: "Berapa jarak aman minimum yang harus dijaga saat mengikuti kendaraan lain?",
          options: [
            "1 detik",
            "2 detik",
            "3 detik",
            "5 detik"
          ],
          correctAnswer: 2,
          explanation: "Jarak aman minimum 3 detik memberikan waktu reaksi yang cukup untuk menghindari tabrakan, terutama untuk kendaraan berat seperti truk."
        },
        {
          id: 3,
          question: "Apa fungsi utama sistem ABS pada truk?",
          options: [
            "Mempercepat pengereman",
            "Mencegah roda terkunci saat pengereman",
            "Mengurangi konsumsi bahan bakar",
            "Meningkatkan kecepatan maksimum"
          ],
          correctAnswer: 1,
          explanation: "ABS (Anti-lock Braking System) mencegah roda terkunci saat pengereman mendadak, sehingga kendaraan tetap dapat dikendalikan."
        },
        {
          id: 4,
          question: "Kapan sebaiknya melakukan pengecekan tekanan ban?",
          options: [
            "Setelah perjalanan jauh",
            "Sebelum perjalanan saat ban masih dingin",
            "Saat ban sudah panas",
            "Hanya saat ada masalah"
          ],
          correctAnswer: 1,
          explanation: "Tekanan ban harus diperiksa saat ban masih dingin untuk mendapatkan pembacaan yang akurat, karena tekanan akan meningkat saat ban panas."
        },
        {
          id: 5,
          question: "Apa yang dimaksud dengan blind spot pada truk?",
          options: [
            "Area yang tidak terlihat oleh pengemudi",
            "Bagian truk yang rusak",
            "Lampu yang mati",
            "Ban yang kempes"
          ],
          correctAnswer: 0,
          explanation: "Blind spot adalah area di sekitar kendaraan yang tidak dapat dilihat pengemudi melalui kaca spion, sangat berbahaya jika tidak diwaspadai."
        }
      ];

      setQuestions(mockQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isReviewMode) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null && !isReviewMode) return;

    // Save answer
    if (!isReviewMode && selectedAnswer !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestionIndex].userAnswer = selectedAnswer;
      updatedQuestions[currentQuestionIndex].isCorrect = 
        selectedAnswer === updatedQuestions[currentQuestionIndex].correctAnswer;
      setQuestions(updatedQuestions);
    }

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if (!isReviewMode) {
        setSelectedAnswer(null);
      } else {
        setSelectedAnswer(questions[currentQuestionIndex + 1].userAnswer || null);
      }
    } else {
      if (!isReviewMode) {
        finishExercise();
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      if (isReviewMode) {
        setSelectedAnswer(questions[currentQuestionIndex - 1].userAnswer || null);
      } else {
        setSelectedAnswer(null);
      }
    }
  };

  const finishExercise = () => {
    if (!startTime) return;

    const endTime = new Date();
    const timeSpent = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60); // in minutes
    const correctAnswers = questions.filter(q => q.isCorrect).length;
    const score = Math.round((correctAnswers / questions.length) * 100);

    const result: ExerciseResult = {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      timeSpent,
      completed: true
    };

    setExerciseResult(result);
    setShowResult(true);
  };

  const startReview = () => {
    setIsReviewMode(true);
    setShowResult(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(questions[0].userAnswer || null);
  };

  const resetExercise = () => {
    const resetQuestions = questions.map(q => ({
      ...q,
      userAnswer: undefined,
      isCorrect: undefined
    }));
    setQuestions(resetQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setExerciseResult(null);
    setIsReviewMode(false);
    setStartTime(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat soal latihan...</p>
        </div>
      </div>
    );
  }

  if (showResult && exerciseResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Trophy className="h-8 w-8 mr-2 text-yellow-500" />
                Latihan Selesai!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-bold text-blue-600">
                {exerciseResult.score}%
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {exerciseResult.correctAnswers}
                  </div>
                  <div className="text-sm text-green-700">Jawaban Benar</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {exerciseResult.totalQuestions - exerciseResult.correctAnswers}
                  </div>
                  <div className="text-sm text-red-700">Jawaban Salah</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {exerciseResult.timeSpent}
                  </div>
                  <div className="text-sm text-blue-700">Menit</div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={startReview} variant="outline">
                  Review Jawaban
                </Button>
                <Button onClick={resetExercise}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Ulangi Latihan
                </Button>
                <Button onClick={() => router.back()} variant="outline">
                  Kembali
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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
                <h1 className="text-2xl font-bold text-gray-900">
                  {isReviewMode ? 'Review' : 'Latihan Soal'} BAB {chapterId}
                </h1>
                <p className="text-gray-600 text-sm">
                  Soal {currentQuestionIndex + 1} dari {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isReviewMode && (
                <Badge variant="outline">Mode Review</Badge>
              )}
              <div className="text-right">
                <p className="text-sm text-gray-600">Progress</p>
                <div className="flex items-center space-x-2">
                  <Progress value={progress} className="w-24" />
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PenTool className="h-6 w-6 mr-2" />
              Pertanyaan {currentQuestionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">
              {currentQuestion.question}
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full text-left p-4 border rounded-lg transition-colors ";
                
                if (isReviewMode) {
                  if (index === currentQuestion.correctAnswer) {
                    buttonClass += "border-green-500 bg-green-50 text-green-700";
                  } else if (index === currentQuestion.userAnswer && index !== currentQuestion.correctAnswer) {
                    buttonClass += "border-red-500 bg-red-50 text-red-700";
                  } else {
                    buttonClass += "border-gray-200 hover:border-gray-300";
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += "border-blue-500 bg-blue-50 text-blue-700";
                  } else {
                    buttonClass += "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
                  }
                }

                return (
                  <button
                    key={index}
                    className={buttonClass}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isReviewMode}
                  >
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center mr-3 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {isReviewMode && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="h-5 w-5 ml-auto text-green-600" />
                      )}
                      {isReviewMode && index === currentQuestion.userAnswer && index !== currentQuestion.correctAnswer && (
                        <XCircle className="h-5 w-5 ml-auto text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {isReviewMode && currentQuestion.explanation && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Penjelasan:</h4>
                <p className="text-blue-800">{currentQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Sebelumnya
              </Button>
              
              <Button 
                onClick={handleNextQuestion}
                disabled={!isReviewMode && selectedAnswer === null}
              >
                {currentQuestionIndex === questions.length - 1 
                  ? (isReviewMode ? 'Selesai Review' : 'Selesai') 
                  : 'Selanjutnya →'
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}