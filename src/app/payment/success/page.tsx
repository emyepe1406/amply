'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Home, Calendar, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseService } from '@/lib/dynamodb-service';
import { getCourseById as getLocalCourseById } from '@/data/courses';
import { Course } from '@/types';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [expiryDate, setExpiryDate] = useState<string>('');

  useEffect(() => {
    const loadPaymentInfo = async () => {
      // Get payment info from URL params
      const sessionId = searchParams.get('sessionId');
      const referenceId = searchParams.get('referenceId');
      const status = searchParams.get('status');

      if (sessionId || referenceId) {
        setPaymentInfo({
          sessionId,
          referenceId,
          status
        });

        // Extract course ID from reference ID
        // Format: COURSE_{userId}_{courseId}_{timestamp} or COURSE_user_{userId}_{courseId}_{timestamp}
        if (referenceId) {
          const refParts = referenceId.split('_');
          let courseId = null;
          
          // Handle different formats
          if (refParts.length >= 4 && refParts[0] === 'COURSE') {
            if (refParts[1] === 'user' && refParts.length >= 5) {
              // Format: COURSE_user_{userId}_{courseId}_{timestamp}
              courseId = refParts[3];
            } else if (refParts[1] !== 'user') {
              // Format: COURSE_{userId}_{courseId}_{timestamp}
              courseId = refParts[2];
            } else {
              // Format: COURSE_user123_{courseId}_{timestamp} (user123 as single part)
              courseId = refParts[2];
            }
          }
          
          if (courseId) {
             try {
               // Get course information
               let course = await CourseService.getCourseById(courseId);
               
               // If not found in DB, try local data
                if (!course) {
                  course = getLocalCourseById(courseId) || null;
                }
               if (course) {
                 setCourseInfo(course);
                
                // Calculate expiry date (30 days from now)
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                const expiryString = expiry.toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                setExpiryDate(expiryString);
              } else {
                // Fallback course info for testing
                const fallbackCourse = {
                   id: courseId,
                   title: `Kursus ${courseId}`,
                   description: 'Kursus yang telah Anda beli',
                   icon: '📚',
                   logo: '',
                   chapters: [],
                   category: 'technical' as const
                 };
                setCourseInfo(fallbackCourse);
                // Set expiry date to 30 days from now
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                const expiryString = expiry.toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                setExpiryDate(expiryString);
              }
            } catch (error) {
                // Fallback course info for testing
                const fallbackCourse = {
                   id: courseId,
                   title: `Kursus ${courseId}`,
                   description: 'Kursus yang telah Anda beli',
                   icon: '📚',
                   logo: '',
                   chapters: [],
                   category: 'technical' as const
                 };
                setCourseInfo(fallbackCourse);
                // Set expiry date to 30 days from now
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 30);
                const expiryString = expiry.toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                setExpiryDate(expiryString);
              }
            }
        }
      }
      
      setLoading(false);
    };

    loadPaymentInfo();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pembayaran Berhasil!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              Terima kasih! Pembayaran Anda telah berhasil diproses.
            </p>
            <p className="text-sm text-gray-500">
              Akses kursus Anda telah diaktifkan.
            </p>
          </div>



          {courseInfo && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-blue-800">
                <BookOpen className="w-5 h-5" />
                <span className="font-semibold">Kursus yang Dibeli</span>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-gray-900">
                  {courseInfo.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {courseInfo.description}
                </p>
              </div>
              {expiryDate && (
                <div className="flex items-center justify-center space-x-2 text-green-700 bg-green-50 rounded-md p-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Berlaku sampai: {expiryDate}
                  </span>
                </div>
              )}
            </div>
          )}

          {paymentInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Reference ID:</span>
                <span className="ml-2 text-gray-600 font-mono text-xs">
                  {paymentInfo.referenceId}
                </span>
              </div>
              {paymentInfo.sessionId && (
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Session ID:</span>
                  <span className="ml-2 text-gray-600 font-mono text-xs">
                    {paymentInfo.sessionId}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard" className="flex items-center justify-center">
                <Home className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            Jika ada pertanyaan, silakan hubungi customer service kami.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}