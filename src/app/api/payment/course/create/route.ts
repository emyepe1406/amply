import { NextRequest, NextResponse } from 'next/server';
import { createPayment, COURSE_PRICING } from '@/lib/ipaymu';
import { getCourseById } from '@/data/courses';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName, courseId } = await request.json();
    console.log('Course payment request received:', { userId, userEmail, userName, courseId });

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

    // Generate unique reference ID for course purchase
    const referenceId = `COURSE_${userId}_${courseId}_${Date.now()}`;
    console.log('Generated reference ID:', referenceId);

    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COURSE_PRICING.COURSE_ACCESS_DAYS);

    // Create payment with iPaymu
    console.log('Creating course payment with iPaymu...');
    const paymentResult = await createPayment({
      amount: COURSE_PRICING.PER_COURSE,
      product: `Kursus ${course.title}`,
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
          amount: COURSE_PRICING.PER_COURSE,
          courseId,
          courseTitle: course.title
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: paymentResult.Message || 'Failed to create payment'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Course payment creation error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

// Handle GET request to get course pricing info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');
  
  if (courseId) {
    const course = getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ 
        success: false,
        message: 'Course not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      courseId,
      courseTitle: course.title,
      price: COURSE_PRICING.PER_COURSE,
      currency: COURSE_PRICING.CURRENCY,
      formattedPrice: new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
      }).format(COURSE_PRICING.PER_COURSE)
    });
  }
  
  return NextResponse.json({
    perCoursePrice: COURSE_PRICING.PER_COURSE,
    currency: COURSE_PRICING.CURRENCY,
    formattedPrice: new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(COURSE_PRICING.PER_COURSE)
  });
}