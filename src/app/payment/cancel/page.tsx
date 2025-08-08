'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function PaymentCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
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
    }
    
    setLoading(false);
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
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Pembayaran Dibatalkan
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-2">
            <p className="text-gray-600">
              Pembayaran Anda telah dibatalkan atau tidak dapat diproses.
            </p>
            <p className="text-sm text-gray-500">
              Jangan khawatir, tidak ada biaya yang dikenakan.
            </p>
          </div>

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
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard" className="flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            Jika Anda mengalami masalah, silakan hubungi customer service kami.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCancel() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  );
}