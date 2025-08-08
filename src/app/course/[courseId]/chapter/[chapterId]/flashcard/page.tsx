'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Check, X, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FlashcardData {
  id: number;
  front: string;
  back: string;
  known: boolean;
}

export default function FlashcardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const courseId = params.courseId as string;
  const chapterId = parseInt(params.chapterId as string);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadFlashcards();
  }, [courseId, chapterId, user, router]);

  const loadFlashcards = async () => {
    try {
      // Simulate loading flashcard data
      // In real implementation, this would load from Excel file
      const mockData: FlashcardData[] = [
        {
          id: 1,
          front: "Apa itu truk?",
          back: "Kendaraan bermotor yang dirancang untuk mengangkut barang atau muatan",
          known: false
        },
        {
          id: 2,
          front: "Berapa berat maksimum muatan truk?",
          back: "Tergantung jenis truk, umumnya antara 3-40 ton",
          known: false
        },
        {
          id: 3,
          front: "Apa yang dimaksud dengan blind spot?",
          back: "Area di sekitar kendaraan yang tidak terlihat oleh pengemudi melalui kaca spion",
          known: false
        },
        {
          id: 4,
          front: "Kapan harus melakukan pengecekan ban?",
          back: "Sebelum perjalanan dan secara berkala setiap minggu",
          known: false
        },
        {
          id: 5,
          front: "Apa fungsi rem ABS?",
          back: "Mencegah roda terkunci saat pengereman mendadak",
          known: false
        }
      ];

      setFlashcards(mockData);
      calculateProgress(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading flashcards:', error);
      setLoading(false);
    }
  };

  const calculateProgress = (cards: FlashcardData[]) => {
    const knownCards = cards.filter(card => card.known).length;
    const progressPercent = cards.length > 0 ? (knownCards / cards.length) * 100 : 0;
    setProgress(progressPercent);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsKnown = (known: boolean) => {
    const updatedCards = [...flashcards];
    updatedCards[currentIndex].known = known;
    setFlashcards(updatedCards);
    calculateProgress(updatedCards);
    
    // Auto advance to next card
    setTimeout(() => {
      nextCard();
    }, 500);
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Loop back to first card
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    } else {
      // Loop to last card
      setCurrentIndex(flashcards.length - 1);
      setIsFlipped(false);
    }
  };

  const resetProgress = () => {
    const resetCards = flashcards.map(card => ({ ...card, known: false }));
    setFlashcards(resetCards);
    calculateProgress(resetCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat flashcard...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Flashcard Tidak Tersedia</h1>
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

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
                  Flashcard BAB {chapterId}
                </h1>
                <p className="text-gray-600 text-sm">
                  Kartu {currentIndex + 1} dari {flashcards.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Progress</p>
                <div className="flex items-center space-x-2">
                  <Progress value={progress} className="w-24" />
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetProgress}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            {/* Flashcard */}
            <div className="relative h-96 mb-8">
              <div 
                className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-preserve-3d cursor-pointer ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={handleFlip}
              >
                {/* Front */}
                <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-80" />
                      <h2 className="text-2xl font-bold mb-4">{currentCard.front}</h2>
                      <p className="text-blue-100 text-sm">Klik untuk melihat jawaban</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <CardContent className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-4">{currentCard.back}</h2>
                      <p className="text-green-100 text-sm">Apakah Anda sudah mengetahui jawaban ini?</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <Button 
                variant="outline" 
                onClick={prevCard}
                disabled={flashcards.length <= 1}
              >
                ← Sebelumnya
              </Button>
              <Button 
                variant="outline" 
                onClick={nextCard}
                disabled={flashcards.length <= 1}
              >
                Selanjutnya →
              </Button>
            </div>

            {/* Knowledge Buttons */}
            {isFlipped && (
              <div className="flex justify-center space-x-4">
                <Button 
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => markAsKnown(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Belum Tahu
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => markAsKnown(true)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Sudah Tahu
                </Button>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex justify-center mt-6">
              <Badge 
                variant={currentCard.known ? "default" : "secondary"}
                className={currentCard.known ? "bg-green-600" : ""}
              >
                {currentCard.known ? "✓ Sudah Dikuasai" : "○ Belum Dikuasai"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}