import crypto from 'crypto';

// Dynamic iPaymu Configuration based on environment
const getIPaymuConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.NEXT_PUBLIC_BASE_URL?.includes('amplifyapp.com');
  
  if (isProduction) {
    // Production configuration
    return {
      VA: process.env.IPAYMU_VA || '1179001287807501',
      API_KEY: process.env.IPAYMU_API_KEY || '9A3D7A1F-DFB9-4529-A5F8-16474EC480F8',
      BASE_URL: 'https://my.ipaymu.com/api/v2',
      REDIRECT_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-amplify-domain.amplifyapp.com',
      NOTIFY_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://your-amplify-domain.amplifyapp.com'
    };
  } else {
    // Sandbox configuration for local development
    return {
      VA: '0000001287807501',
      API_KEY: 'SANDBOX555CF92B-F01F-4B9D-83C1-A3D2C551F597',
      BASE_URL: 'https://sandbox.ipaymu.com/api/v2',
      REDIRECT_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      NOTIFY_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    };
  }
};

export const IPAYMU_CONFIG = getIPaymuConfig();

// Course pricing
export const COURSE_PRICING = {
  MONTHLY_SUBSCRIPTION: 150000, // Rp 150,000 per month for all courses
  PER_COURSE: 150000, // Rp 150,000 per course per month (30 days access)
  CURRENCY: 'IDR',
  COURSE_ACCESS_DAYS: 30 // 30 days access per course purchase
};

// Generate signature for iPaymu API
export function generateSignature(method: string, va: string, apiKey: string, body?: any): string {
  let bodyHash = '';
  if (body && Object.keys(body).length > 0) {
    const bodyString = JSON.stringify(body);
    bodyHash = crypto.createHash('sha256').update(bodyString).digest('hex').toLowerCase();
  }
  
  const stringToSign = `${method.toUpperCase()}:${va}:${bodyHash}:${apiKey}`;
  const signature = crypto.createHmac('sha256', apiKey).update(stringToSign).digest('hex');
  
  return signature;
}

// Create payment request
export async function createPayment({
  amount,
  product,
  buyerName,
  buyerEmail,
  buyerPhone,
  referenceId
}: {
  amount: number;
  product: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  referenceId: string;
}) {
  const body = {
    product: [product],
    qty: [1],
    price: [amount],
    description: [`Pembelian ${product}`],
    returnUrl: `${IPAYMU_CONFIG.REDIRECT_URL}/payment/success`,
    notifyUrl: `${IPAYMU_CONFIG.NOTIFY_URL}/api/payment/notify`,
    cancelUrl: `${IPAYMU_CONFIG.REDIRECT_URL}/payment/cancel`,
    buyerName,
    buyerEmail,
    buyerPhone,
    referenceId
  };

  const signature = generateSignature('POST', IPAYMU_CONFIG.VA, IPAYMU_CONFIG.API_KEY, body);

  try {
    const response = await fetch(`${IPAYMU_CONFIG.BASE_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'va': IPAYMU_CONFIG.VA,
        'signature': signature
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('iPaymu payment creation error:', error);
    throw error;
  }
}

// Check payment status
export async function checkPaymentStatus(transactionId: string) {
  const signature = generateSignature('POST', IPAYMU_CONFIG.VA, IPAYMU_CONFIG.API_KEY);

  try {
    const response = await fetch(`${IPAYMU_CONFIG.BASE_URL}/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'va': IPAYMU_CONFIG.VA,
        'signature': signature
      },
      body: JSON.stringify({
        transactionId
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('iPaymu payment status check error:', error);
    throw error;
  }
}

// Payment status types
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';

export interface PaymentResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  message?: string;
  data?: any;
}

export interface PaymentStatusResult {
  success: boolean;
  status?: PaymentStatus;
  amount?: number;
  paidAt?: string;
  message?: string;
  data?: any;
}