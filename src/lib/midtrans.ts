import crypto from 'crypto';

// Dynamic Midtrans Configuration based on environment
const getMidtransConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.NEXT_PUBLIC_BASE_URL?.includes('amplifyapp.com');
  
  if (isProduction) {
    // Production configuration
    return {
      SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || '',
      CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || '',
      MERCHANT_ID: process.env.MIDTRANS_MERCHANT_ID || '',
      BASE_URL: 'https://api.midtrans.com/v2',
      SNAP_URL: 'https://app.midtrans.com/snap/v1/transactions',
      REDIRECT_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-amplify-domain.amplifyapp.com',
      NOTIFY_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-amplify-domain.amplifyapp.com'
    };
  } else {
    // Sandbox configuration for local development
    return {
      SERVER_KEY: process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-_J-T2lq1eaelp4lbAHdCAczV',
      CLIENT_KEY: process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-gMyrpl3ZFmLE0wJG',
      MERCHANT_ID: process.env.MIDTRANS_MERCHANT_ID || 'M116485',
      BASE_URL: 'https://api.sandbox.midtrans.com/v2',
      SNAP_URL: 'https://app.sandbox.midtrans.com/snap/v1/transactions',
      REDIRECT_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      NOTIFY_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    };
  }
};

export const MIDTRANS_CONFIG = getMidtransConfig();

// Course pricing
export const COURSE_PRICING = {
  MONTHLY_SUBSCRIPTION: 150000, // Rp 150,000 per month for all courses
  PER_COURSE: 150000, // Rp 150,000 per course per month (30 days access)
  CURRENCY: 'IDR',
  COURSE_ACCESS_DAYS: 30 // 30 days access per course purchase
};

// Generate signature for Midtrans
export function generateSignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string): string {
  const signatureString = orderId + statusCode + grossAmount + serverKey;
  return crypto.createHash('sha512').update(signatureString).digest('hex');
}

// Create Snap transaction
export async function createSnapTransaction({
  orderId,
  amount,
  customerDetails,
  itemDetails
}: {
  orderId: string;
  amount: number;
  customerDetails: {
    first_name: string;
    email: string;
    phone?: string;
  };
  itemDetails: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}) {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount
    },
    credit_card: {
      secure: true
    },
    customer_details: customerDetails,
    item_details: itemDetails,
    callbacks: {
      finish: `${MIDTRANS_CONFIG.REDIRECT_URL}/payment/success?order_id=${orderId}`
    }
  };

  const authString = Buffer.from(MIDTRANS_CONFIG.SERVER_KEY + ':').toString('base64');

  try {
    console.log('Creating Midtrans Snap transaction:', parameter);
    console.log('Using SERVER_KEY:', MIDTRANS_CONFIG.SERVER_KEY);
    console.log('Using SNAP_URL:', MIDTRANS_CONFIG.SNAP_URL);
    const response = await fetch(MIDTRANS_CONFIG.SNAP_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(parameter)
    });

    const result = await response.json();
    console.log('Midtrans Snap response:', result);
    return result;
  } catch (error) {
    console.error('Midtrans Snap transaction creation error:', error);
    throw error;
  }
}

// Check transaction status
export async function checkTransactionStatus(orderId: string) {
  const authString = Buffer.from(MIDTRANS_CONFIG.SERVER_KEY + ':').toString('base64');

  try {
    const response = await fetch(`${MIDTRANS_CONFIG.BASE_URL}/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Midtrans transaction status check error:', error);
    throw error;
  }
}

// Payment status types
export type PaymentStatus = 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'failure';

export interface PaymentResult {
  success: boolean;
  token?: string;
  redirect_url?: string;
  message?: string;
  data?: any;
}

export interface PaymentStatusResult {
  success: boolean;
  transaction_status?: PaymentStatus;
  gross_amount?: string;
  transaction_time?: string;
  message?: string;
  data?: any;
}

// Verify notification signature
export function verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
  const expectedSignature = generateSignature(orderId, statusCode, grossAmount, MIDTRANS_CONFIG.SERVER_KEY);
  return expectedSignature === signatureKey;
}