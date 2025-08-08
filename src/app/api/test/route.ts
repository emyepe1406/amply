import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Test API called');
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test API working',
      receivedData: body
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error in test API'
    }, { status: 500 });
  }
}

export async function GET() {
  // Debug environment variables for Midtrans
  const envDebug = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY ? 'SET' : 'NOT_SET',
    MIDTRANS_CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY ? 'SET' : 'NOT_SET',
    NEXT_PUBLIC_MIDTRANS_CLIENT_KEY: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ? 'SET' : 'NOT_SET',
    MIDTRANS_MERCHANT_ID: process.env.MIDTRANS_MERCHANT_ID ? 'SET' : 'NOT_SET'
  };

  return NextResponse.json({
    success: true,
    message: 'Test API GET working',
    environment: envDebug,
    timestamp: new Date().toISOString()
  });
}