import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/dynamodb-service';
import { MIDTRANS_CONFIG, verifySignature } from '@/lib/midtrans';
import { COURSE_PRICING } from '@/lib/midtrans';
const PaymentService = require('@/lib/PaymentService');

// GET method for testing webhook URL accessibility
export async function GET(request: NextRequest) {
  console.log('=== MIDTRANS WEBHOOK TEST ===');
  console.log('GET request received for webhook test');
  console.log('Headers:', Object.fromEntries(request.headers.entries()));
  
  return NextResponse.json({
    status: 'ok',
    message: 'Midtrans webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== MIDTRANS PAYMENT NOTIFICATION DEBUG ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Base URL:', process.env.NEXT_PUBLIC_BASE_URL);
    console.log('Midtrans notification received:', body);
    console.log('Headers:', Object.fromEntries(request.headers.entries()));

    // Extract notification data
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_time,
      fraud_status
    } = body;

    // Verify signature from Midtrans
    const isValidSignature = verifySignature(order_id, status_code, gross_amount, signature_key);
    if (!isValidSignature) {
      console.error('Invalid Midtrans signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('Signature verified successfully');

    // Process payment based on transaction status
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      console.log('Processing successful payment...');
      
      try {
        // Initialize PaymentService
        const paymentService = new PaymentService();
        
        // Extract user and course info from order_id
        // Format: COURSE_{userId}_{courseId}_{timestamp} or C_{userId}_{courseId}_{timestamp}
        const orderParts = order_id.split('_');
        if (orderParts.length >= 3 && (orderParts[0] === 'COURSE' || orderParts[0] === 'C')) {
          const userId = orderParts[1];
          const courseId = orderParts[2];
          
          console.log('Extracted from order_id:', { userId, courseId });
          
          const user = await UserService.getUserById(userId);
          console.log('User found:', user ? 'Yes' : 'No');
          
          if (user) {
            // Calculate expiry date (30 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + COURSE_PRICING.COURSE_ACCESS_DAYS);
            
            // Create payment record in payments table
            const paymentData = {
              userId,
              courseId,
              orderId: order_id,
              transactionId: body.transaction_id || order_id,
              status: 'success',
              amount: parseFloat(gross_amount),
              currency: 'IDR',
              paymentMethod: body.payment_type || 'unknown',
              transactionTime: transaction_time,
              purchaseDate: new Date().toISOString(),
              expiryDate: expiryDate.toISOString(),
              isActive: true,
              midtransData: {
                transaction_status,
                fraud_status,
                status_code,
                payment_type: body.payment_type,
                bank: body.bank,
                va_numbers: body.va_numbers,
                biller_code: body.biller_code,
                bill_key: body.bill_key
              }
            };
            
            // Save payment record
            const paymentRecord = await paymentService.createPayment(paymentData);
            console.log('Payment record created:', paymentRecord.id);
            
            // Also update user's purchasedCourses for backward compatibility
            const currentCourses = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];
            const existingCourseIndex = currentCourses.findIndex(course => course.courseId === courseId);
            
            let updatedCourses;
            if (existingCourseIndex >= 0) {
              // Update existing course access
              updatedCourses = [...currentCourses];
              updatedCourses[existingCourseIndex] = {
                courseId,
                purchaseDate: new Date().toISOString(),
                expiryDate: expiryDate.toISOString(),
                isActive: true,
                transactionId: order_id,
                paymentId: paymentRecord.id // Link to payment record
              };
              console.log('Updated existing course access');
            } else {
              // Add new course access
              updatedCourses = [
                ...currentCourses,
                {
                  courseId,
                  purchaseDate: new Date().toISOString(),
                  expiryDate: expiryDate.toISOString(),
                  isActive: true,
                  transactionId: order_id,
                  paymentId: paymentRecord.id // Link to payment record
                }
              ];
              console.log('Added new course access');
            }
            
            // Update user with new course access
            const updateResult = await UserService.updateUser(userId, {
              purchasedCourses: updatedCourses
            });
            
            console.log('User update result:', updateResult);
            console.log('User purchasedCourses after:', updatedCourses);
            
            return NextResponse.json({ 
              success: true,
              message: 'Course access granted successfully'
            });
          } else {
            console.error('User not found for userId:', userId);
            return NextResponse.json({ 
              error: 'User not found' 
            }, { status: 404 });
          }
        } else {
          console.error('Invalid order_id format:', order_id);
          return NextResponse.json({ 
            error: 'Invalid order format' 
          }, { status: 400 });
        }
      } catch (error) {
        console.error('Error processing course access:', error);
        return NextResponse.json({ 
          error: 'Failed to process course access' 
        }, { status: 500 });
      }
    } else if (transaction_status === 'pending') {
      console.log('Payment is pending');
      return NextResponse.json({ 
        success: true,
        message: 'Payment pending'
      });
    } else {
      console.log('Payment failed or cancelled:', transaction_status);
      return NextResponse.json({ 
        success: true,
        message: `Payment ${transaction_status}`
      });
    }
  } catch (error) {
    console.error('Midtrans notification processing error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}