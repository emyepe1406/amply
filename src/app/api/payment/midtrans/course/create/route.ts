import { NextRequest, NextResponse } from 'next/server';
import { createSnapTransaction, COURSE_PRICING } from '@/lib/midtrans';
import { getCourseById } from '@/data/courses';

// Updated to use correct Midtrans credentials

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName, courseId } = await request.json();
    console.log('Midtrans course payment request received:', { userId, userEmail, userName, courseId });

    // Validate required fields
    if (!userId || !userEmail || !userName || !courseId) {
      console.log('Missing required fields');
      return NextResponse.json({ 
        success: false,
        message: 'Missing required information' 
      }, { status: 400 });
    }

    // Validate course exists
    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ 
        success: false,
        message: 'Course not found' 
      }, { status: 404 });
    }

    // Generate unique order ID for course purchase (max 50 chars for Midtrans)
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const userIdShort = userId.slice(-8); // Last 8 chars of userId
    const orderId = `C_${userIdShort}_${courseId}_${timestamp}`;
    console.log('Generated order ID:', orderId);

    // Prepare customer details
    const customerDetails = {
      first_name: userName,
      email: userEmail,
      phone: '08123456789' // Default phone, should be collected from user
    };

    // Prepare item details
    const itemDetails = [{
      id: courseId,
      price: COURSE_PRICING.PER_COURSE,
      quantity: 1,
      name: `Kursus ${course.title}`
    }];

    // Create Snap transaction with Midtrans
    console.log('Creating course payment with Midtrans Snap...');
    const snapResult = await createSnapTransaction({
      orderId,
      amount: COURSE_PRICING.PER_COURSE,
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
          amount: COURSE_PRICING.PER_COURSE,
          courseId,
          courseTitle: course.title
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: snapResult.error_messages?.[0] || 'Failed to create payment'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Midtrans course payment creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}