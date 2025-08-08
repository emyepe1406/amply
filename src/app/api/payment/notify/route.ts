import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/dynamodb-service';
import { IPAYMU_CONFIG, generateSignature } from '@/lib/ipaymu';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Payment notification received:', body);

    // Verify signature from iPaymu
    const receivedSignature = request.headers.get('signature');
    const expectedSignature = generateSignature('POST', IPAYMU_CONFIG.VA, IPAYMU_CONFIG.API_KEY, body);

    if (receivedSignature !== expectedSignature) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Extract payment information
    const {
      status,
      reference_id,
      transaction_id,
      amount,
      buyer_email
    } = body;

    // Process payment based on status
    if (status === 'berhasil' || status === 'paid') {
      // Payment successful - activate course access
      try {
        const user = await UserService.getUserByEmail(buyer_email);
        if (user && reference_id) {
          // Extract course info from reference_id
          // Format: COURSE_{userId}_{courseId}_{timestamp}
          const refParts = reference_id.split('_');
          if (refParts.length >= 3 && refParts[0] === 'COURSE') {
            const courseId = refParts[2];
            
            // Calculate expiry date (30 days from now)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);
            
            // Add course to user's purchasedCourses
             let updatedPurchasedCourses: any;
             
             // Handle both array and object formats
             if (Array.isArray(user.purchasedCourses)) {
               updatedPurchasedCourses = [...user.purchasedCourses];
               
               // Check if course already exists
               const existingCourseIndex = updatedPurchasedCourses.findIndex(
                 (course: any) => course.courseId === courseId
               );
               
               if (existingCourseIndex >= 0) {
                 // Update existing course
                 updatedPurchasedCourses[existingCourseIndex] = {
                   courseId,
                   isActive: true,
                   expiryDate: expiryDate.toISOString(),
                   purchaseDate: new Date().toISOString()
                 };
               } else {
                 // Add new course
                 updatedPurchasedCourses.push({
                   courseId,
                   isActive: true,
                   expiryDate: expiryDate.toISOString(),
                   purchaseDate: new Date().toISOString()
                 });
               }
             } else {
               // Handle object format or create new array
               updatedPurchasedCourses = [{
                 courseId,
                 isActive: true,
                 expiryDate: expiryDate.toISOString(),
                 purchaseDate: new Date().toISOString()
               }];
             }
             
             // Update user data
             await UserService.updateUser(user.id, {
               purchasedCourses: updatedPurchasedCourses
             });
            
            console.log(`Course ${courseId} activated for user ${buyer_email}`);
          } else {
            console.log(`Invalid reference_id format: ${reference_id}`);
          }
        }
      } catch (error) {
        console.error('Error processing payment notification:', error);
      }
    }

    // Log payment transaction
    console.log(`Payment ${status} for reference ${reference_id}, transaction ${transaction_id}, amount ${amount}`);

    return NextResponse.json({ success: true, message: 'Notification processed' });
  } catch (error) {
    console.error('Payment notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET request (for testing)
export async function GET() {
  return NextResponse.json({ message: 'Payment notification endpoint is working' });
}