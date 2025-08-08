# Demo Access Information for iPaymu Verification

**To:** verifikasi@ipaymu.com  
**Subject:** Demo Login Access for Transaction Testing - SSW Learning Platform

---

## Platform Information

**Website:** https://main.d2qghussyraf.amplifyapp.com/  
**Platform Name:** SSW Learning  
**Business Type:** Online Learning Platform  

## Demo Account Credentials

### Student Account (for testing course purchases)
**Email:** demo@sswlearning.com  
**Password:** Demo123!  

### Admin Account (for backend access)
**Email:** admin@sswlearning.com  
**Password:** Admin123!  

## How to Test Transactions

### 1. Student Purchase Flow
1. Login using the student demo account above
2. Navigate to the course catalog
3. Select any course (all courses are priced at Rp 150,000)
4. Click "Beli Kursus" (Buy Course)
5. You will be redirected to iPaymu payment gateway
6. Complete the payment using iPaymu sandbox/testing methods
7. After successful payment, you should be redirected back to our platform
8. The course should appear in the student's dashboard under "Kursus Saya"

### 2. Available Courses for Testing
- **Restoran** - Restaurant management course
- **Driver Taxi** - Taxi driver training course  
- **Driver Bis** - Bus driver training course

All courses have 30-day access period and include:
- Video lessons
- Downloadable materials
- Progress tracking
- Certificate upon completion

### 3. Payment Integration Details
- **Payment Gateway:** iPaymu
- **Environment:** Production (with sandbox testing capability)
- **Supported Methods:** Bank Transfer, E-wallet, Credit Card
- **Currency:** IDR (Indonesian Rupiah)
- **Webhook URL:** https://main.d2qghussyraf.amplifyapp.com/api/payment/notify

### 4. Required Pages for Verification
- **FAQ:** https://main.d2qghussyraf.amplifyapp.com/faq
- **Refund Policy:** https://main.d2qghussyraf.amplifyapp.com/refund-policy
- **Terms & Conditions:** https://main.d2qghussyraf.amplifyapp.com/terms

## Technical Implementation

### Payment Flow
1. User selects course and clicks purchase
2. System creates payment session with iPaymu
3. User redirected to iPaymu payment page
4. After payment, iPaymu sends webhook notification to our system
5. System verifies payment and grants course access
6. User redirected to success page

### Security Features
- HMAC signature verification for webhooks
- Environment-based configuration
- Secure payment session handling
- User authentication and authorization

## Contact Information

**Technical Contact:** developer@sswlearning.com  
**Business Contact:** business@sswlearning.com  
**Support:** support@sswlearning.com  

## Additional Notes

1. The platform is built with Next.js and deployed on AWS Amplify
2. All payment notifications are logged for debugging purposes
3. The system supports both sandbox and production environments
4. Course access is automatically granted upon successful payment verification
5. Users receive email confirmations for successful purchases

---

**Please feel free to contact us if you need any additional information or encounter any issues during testing.**

**Best regards,**  
**SSW Learning Development Team**