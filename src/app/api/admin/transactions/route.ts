import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserService } from '@/lib/dynamodb-service';
import { courses } from '@/data/courses';
const PaymentService = require('@/lib/PaymentService');

export async function GET(request: NextRequest) {
  try {
    // Check authentication from cookies
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    if (!user || !user.id || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    console.log('Fetching transactions for admin:', { page, limit, status, search });

    // Initialize PaymentService
    const paymentService = new PaymentService();
    
    // Get all payments from the database
    const allPayments = await paymentService.getAllPayments();
    
    // Sort by creation date (newest first)
    const sortedPayments = allPayments.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply filters
    let filteredPayments = sortedPayments;
    
    // Filter by status
    if (status !== 'all') {
      filteredPayments = filteredPayments.filter((payment: any) => payment.status === status);
    }
    
    // Filter by search term (order ID, email, course)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPayments = filteredPayments.filter((payment: any) => {
        const course = courses.find(c => c.id === payment.courseId);
        return (
          payment.orderId?.toLowerCase().includes(searchLower) ||
          payment.transactionId?.toLowerCase().includes(searchLower) ||
          course?.title?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedPayments = filteredPayments.slice(offset, offset + limit);
    
    // Enrich payment data with course and user information
    const enrichedPayments = await Promise.all(
      paginatedPayments.map(async (payment: any) => {
        try {
          // Get course information
          const course = courses.find(c => c.id === payment.courseId);
          
          // Get user information
          let userInfo: any = null;
          try {
            userInfo = await UserService.getUserById(payment.userId);
          } catch (error) {
            console.warn(`User not found for payment ${payment.id}:`, error);
          }
          
          return {
            ...payment,
            courseTitle: course?.title || 'Unknown Course',
            courseIcon: course?.icon || '📚',
            userEmail: userInfo?.email || 'Unknown User',
            userName: userInfo?.username || 'Unknown User',
            formattedAmount: new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR'
            }).format(payment.amount),
            formattedDate: new Date(payment.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        } catch (error) {
          console.error('Error enriching payment data:', error);
          return {
            ...payment,
            courseTitle: 'Error loading course',
            courseIcon: '❌',
            userEmail: 'Error loading user',
            userName: 'Error loading user',
            formattedAmount: 'Rp 0',
            formattedDate: 'Invalid date'
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      transactions: enrichedPayments,
      total: filteredPayments.length,
      hasMore: offset + limit < filteredPayments.length,
      page,
      limit
    });
    
  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}