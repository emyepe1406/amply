import { NextRequest, NextResponse } from 'next/server';
import { createPayment, COURSE_PRICING } from '@/lib/ipaymu';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName } = await request.json();
    console.log('Payment request received:', { userId, userEmail, userName });

    // Validate required fields
    if (!userId || !userEmail || !userName) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        success: false,
        message: 'Missing required user information' 
      }, { status: 400 });
    }

    // Generate unique reference ID
    const referenceId = `SUB_${userId}_${Date.now()}`;
    console.log('Generated reference ID:', referenceId);

    // Create payment with iPaymu
    console.log('Creating payment with iPaymu...');
    const paymentResult = await createPayment({
      amount: COURSE_PRICING.MONTHLY_SUBSCRIPTION,
      product: 'Akses Kursus',
      buyerName: userName,
      buyerEmail: userEmail,
      buyerPhone: '08123456789', // Default phone, should be collected from user
      referenceId
    });
    console.log('iPaymu response:', paymentResult);

    if (paymentResult.Success) {
      return NextResponse.json({
        success: true,
        data: {
          url: paymentResult.Data?.Url,
          sessionId: paymentResult.Data?.SessionID,
          referenceId,
          amount: COURSE_PRICING.MONTHLY_SUBSCRIPTION
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: paymentResult.Message || 'Failed to create payment'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Handle GET request to get pricing info
export async function GET() {
  return NextResponse.json({
    monthlyPrice: COURSE_PRICING.MONTHLY_SUBSCRIPTION,
    currency: COURSE_PRICING.CURRENCY,
    formattedPrice: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(COURSE_PRICING.MONTHLY_SUBSCRIPTION)
  });
}