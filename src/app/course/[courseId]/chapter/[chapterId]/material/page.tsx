'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, BookOpen, Save, RotateCcw, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function MaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lastReadPosition, setLastReadPosition] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const courseId = params.courseId as string;
  const chapterId = parseInt(params.chapterId as string);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadMaterial();
  }, [courseId, chapterId, user, router]);

  useEffect(() => {
    // Add scroll listener to track reading progress
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = element.scrollHeight;
        
        const scrollPercent = Math.min(
          100,
          Math.max(0, (scrollTop / (documentHeight - windowHeight)) * 100)
        );
        
        setProgress(scrollPercent);
        setLastReadPosition(scrollTop);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [content]);

  const loadMaterial = async () => {
    try {
      // Simulate loading material content
      // In real implementation, this would load and convert DOCX file
      const mockContent = `
        <h2>Materi BAB ${chapterId}: Dasar-dasar Mengemudi Truk</h2>
        
        <h3>1. Pengenalan Truk</h3>
        <p>Truk adalah kendaraan bermotor yang dirancang khusus untuk mengangkut barang atau muatan. Truk memiliki berbagai jenis dan ukuran, mulai dari truk kecil hingga truk besar yang dapat mengangkut puluhan ton barang.</p>
        
        <h4>Jenis-jenis Truk:</h4>
        <ul>
          <li><strong>Truk Ringan:</strong> Kapasitas muatan hingga 3 ton</li>
          <li><strong>Truk Sedang:</strong> Kapasitas muatan 3-8 ton</li>
          <li><strong>Truk Berat:</strong> Kapasitas muatan di atas 8 ton</li>
        </ul>
        
        <h3>2. Komponen Utama Truk</h3>
        <p>Setiap truk memiliki komponen-komponen penting yang harus dipahami oleh pengemudi:</p>
        
        <h4>a. Mesin</h4>
        <p>Mesin truk umumnya menggunakan bahan bakar diesel karena lebih efisien untuk kendaraan berat. Mesin diesel memiliki torsi yang tinggi, cocok untuk mengangkut beban berat.</p>
        
        <h4>b. Sistem Transmisi</h4>
        <p>Truk dapat menggunakan transmisi manual atau otomatis. Transmisi manual memberikan kontrol lebih baik untuk kondisi jalan yang bervariasi.</p>
        
        <h4>c. Sistem Rem</h4>
        <p>Sistem rem pada truk sangat penting karena beban yang berat memerlukan jarak pengereman yang lebih panjang. Banyak truk modern dilengkapi dengan sistem ABS (Anti-lock Braking System).</p>
        
        <h3>3. Keselamatan Berkendara</h3>
        <p>Keselamatan adalah prioritas utama dalam mengemudi truk. Beberapa hal yang perlu diperhatikan:</p>
        
        <h4>Blind Spot (Titik Buta)</h4>
        <p>Truk memiliki area blind spot yang lebih besar dibandingkan mobil biasa. Pengemudi harus selalu memeriksa kaca spion dan melakukan shoulder check sebelum berbelok atau berganti jalur.</p>
        
        <h4>Jarak Aman</h4>
        <p>Karena massa truk yang besar, jarak pengereman lebih panjang. Selalu jaga jarak aman minimal 3 detik dari kendaraan di depan.</p>
        
        <h4>Kecepatan</h4>
        <p>Patuhi batas kecepatan yang ditetapkan. Truk memiliki stabilitas yang berbeda pada kecepatan tinggi, terutama saat berbelok.</p>
        
        <h3>4. Perawatan Rutin</h3>
        <p>Perawatan rutin sangat penting untuk menjaga performa dan keselamatan truk:</p>
        
        <ul>
          <li>Pemeriksaan oli mesin secara berkala</li>
          <li>Pengecekan tekanan ban sebelum perjalanan</li>
          <li>Pemeriksaan sistem rem</li>
          <li>Pengecekan lampu dan sistem kelistrikan</li>
          <li>Pemeriksaan sistem pendingin</li>
        </ul>
        
        <h3>5. Regulasi dan Peraturan</h3>
        <p>Pengemudi truk harus memahami berbagai regulasi yang berlaku:</p>
        
        <h4>SIM (Surat Izin Mengemudi)</h4>
        <p>Untuk mengemudi truk, diperlukan SIM B1 (truk ringan) atau B2 (truk berat). Pastikan SIM selalu dalam kondisi berlaku.</p>
        
        <h4>STNK dan Dokumen Kendaraan</h4>
        <p>Selalu bawa STNK, surat kir (untuk truk umum), dan dokumen muatan yang lengkap.</p>
        
        <h4>Jam Kerja Pengemudi</h4>
        <p>Patuhi regulasi jam kerja pengemudi untuk mencegah kelelahan. Istirahat yang cukup sangat penting untuk keselamatan.</p>
        
        <h3>Kesimpulan</h3>
        <p>Mengemudi truk memerlukan keterampilan, pengetahuan, dan tanggung jawab yang tinggi. Dengan memahami dasar-dasar yang telah dijelaskan, diharapkan pengemudi dapat menjalankan tugasnya dengan aman dan profesional.</p>
        
        <p><em>Ingat: Keselamatan adalah prioritas utama. Selalu patuhi peraturan lalu lintas dan jaga kondisi kendaraan dengan baik.</em></p>
      `;

      setContent(mockContent);
      setLoading(false);
    } catch (error) {
      console.error('Error loading material:', error);
      setLoading(false);
    }
  };

  const saveProgress = () => {
    // Save current reading progress
    localStorage.setItem(
      `material_progress_${courseId}_${chapterId}`,
      JSON.stringify({
        progress,
        lastReadPosition,
        timestamp: new Date().toISOString()
      })
    );
    
    // Show notification
    alert('Progress tersimpan!');
  };

  const restorePosition = () => {
    const saved = localStorage.getItem(`material_progress_${courseId}_${chapterId}`);
    if (saved) {
      const data = JSON.parse(saved);
      window.scrollTo({ top: data.lastReadPosition, behavior: 'smooth' });
      setProgress(data.progress);
    } else {
      alert('Belum ada posisi yang tersimpan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat materi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
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
                  Materi BAB {chapterId}
                </h1>
                <p className="text-gray-600 text-sm">
                  Progress Membaca: {Math.round(progress)}%
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="w-24" />
              <Button 
                variant="outline" 
                size="sm"
                onClick={restorePosition}
                title="Kembali ke posisi terakhir"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={saveProgress}
                title="Simpan progress"
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Materi Pembelajaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={contentRef}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                lineHeight: '1.8',
                fontSize: '16px'
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
        <Button 
          className="rounded-full w-12 h-12 shadow-lg"
          onClick={restorePosition}
          title="Kembali ke posisi terakhir"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button 
          className="rounded-full w-12 h-12 shadow-lg"
          onClick={saveProgress}
          title="Simpan progress"
        >
          <Save className="h-5 w-5" />
        </Button>
      </div>

      <style jsx>{`
        .prose h2 {
          color: #1e40af;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 0.5rem;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .prose h3 {
          color: #1e40af;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .prose h4 {
          color: #374151;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .prose p {
          margin-bottom: 1rem;
          text-align: justify;
        }
        .prose ul {
          margin-bottom: 1rem;
        }
        .prose li {
          margin-bottom: 0.5rem;
        }
        .prose strong {
          color: #1e40af;
        }
        .prose em {
          background-color: #fef3c7;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}