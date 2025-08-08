import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@/lib/dynamodb-service';
const PaymentService = require('@/lib/PaymentService');

interface Payment {
  id: string;
  courseId: string;
  orderId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  purchaseDate: string;
  expiryDate: string;
  isActive: boolean;
  transactionTime: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication from cookies
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }

    // Initialize PaymentService
    const paymentService = new PaymentService();
    
    // Get payment history for the user
    const payments = await paymentService.getSuccessfulPaymentsByUserId(user.id);
    
    // Format the response
    const formattedPayments = payments.map((payment: Payment) => ({
      id: payment.id,
      courseId: payment.courseId,
      orderId: payment.orderId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      purchaseDate: payment.purchaseDate,
      expiryDate: payment.expiryDate,
      isActive: payment.isActive,
      transactionTime: payment.transactionTime,
      createdAt: payment.createdAt
    }));

    return NextResponse.json({
      success: true,
      payments: formattedPayments
    });
    
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}