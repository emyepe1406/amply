import { NextRequest, NextResponse } from 'next/server';
import { createSnapTransaction, COURSE_PRICING } from '@/lib/midtrans';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName } = await request.json();
    console.log('Midtrans subscription payment request received:', { userId, userEmail, userName });

    // Validate required fields
    if (!userId || !userEmail || !userName) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        success: false,
        message: 'Missing required user information' 
      }, { status: 400 });
    }

    // Generate unique order ID for subscription
    const orderId = `SUB_${userId}_${Date.now()}`;
    console.log('Generated order ID:', orderId);

    // Prepare customer details
    const customerDetails = {
      first_name: userName,
      email: userEmail,
      phone: '08123456789' // Default phone, should be collected from user
    };

    // Prepare item details
    const itemDetails = [{
      id: 'subscription',
      price: COURSE_PRICING.MONTHLY_SUBSCRIPTION,
      quantity: 1,
      name: 'Akses Kursus Bulanan'
    }];

    // Create Snap transaction with Midtrans
    console.log('Creating subscription payment with Midtrans Snap...');
    const snapResult = await createSnapTransaction({
      orderId,
      amount: COURSE_PRICING.MONTHLY_SUBSCRIPTION,
      customerDetails,
      itemDetails
    });
    console.log('Midtrans Snap response:', snapResult);

    if (snapResult.token) {
      return NextResponse.json({
        success: true,
        data: {
          token: snapResult.token,
          redirect_url: snapResult.redirect_url,
          orderId,
          amount: COURSE_PRICING.MONTHLY_SUBSCRIPTION
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: snapResult.error_messages?.[0] || 'Failed to create payment'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Midtrans subscription payment creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}