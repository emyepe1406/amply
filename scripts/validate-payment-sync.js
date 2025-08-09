#!/usr/bin/env node

/**
 * Validation Script: Check Payment Data Integrity
 * 
 * Script ini akan:
 * 1. Validasi integritas data antara lms-payments dan user.purchasedCourses
 * 2. Identifikasi data yang hilang atau tidak konsisten
 * 3. Otomatis perbaiki masalah yang ditemukan (optional)
 * 4. Generate detailed report
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const PaymentSyncService = require('../src/lib/PaymentSyncService');

require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.local' });

class PaymentValidator {
  constructor() {
    const awsRegion = process.env.AMPLIFY_AWS_REGION || 'ap-southeast-1';
    const awsAccessKeyId = process.env.AMPLIFY_AWS_ACCESS_KEY_ID;
    const awsSecretAccessKey = process.env.AMPLIFY_AWS_SECRET_ACCESS_KEY;

    const client = new DynamoDBClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey
      }
    });

    this.docClient = DynamoDBDocumentClient.from(client);
    this.paymentsTable = process.env.DYNAMODB_PAYMENTS_TABLE || 'lms-payments';
    this.usersTable = process.env.DYNAMODB_USERS_TABLE || 'lms-users';
    this.syncService = new PaymentSyncService();
  }

  async validateAllData(fixIssues = false) {
    console.log('🔍 Starting payment data validation...');
    
    const report = {
      timestamp: new Date().toISOString(),
      totalUsers: 0,
      totalPayments: 0,
      issues: [],
      fixed: [],
      summary: {}
    };

    try {
      // 1. Ambil semua data payments
      const allPayments = await this.getAllPayments();
      report.totalPayments = allPayments.length;
      console.log(`📊 Total payments found: ${allPayments.length}`);

      // 2. Ambil semua users
      const allUsers = await this.getAllUsers();
      report.totalUsers = allUsers.length;
      console.log(`👥 Total users found: ${allUsers.length}`);

      // 3. Validasi per user
      for (const user of allUsers) {
        const userValidation = await this.validateUser(user, allPayments);
        
        if (userValidation.issues.length > 0) {
          report.issues.push(...userValidation.issues);
          
          // Auto-fix jika di-enable
          if (fixIssues && userValidation.canFix) {
            const fixResult = await this.fixUserIssues(user, userValidation);
            if (fixResult.success) {
              report.fixed.push(fixResult);
            }
          }
        }
      }

      // 4. Validasi payments yang tidak memiliki user
      const orphanedPayments = await this.findOrphanedPayments(allPayments, allUsers);
      if (orphanedPayments.length > 0) {
        report.issues.push({
          type: 'ORPHANED_PAYMENTS',
          count: orphanedPayments.length,
          payments: orphanedPayments
        });
      }

      // 5. Generate summary
      this.generateSummary(report);

      return report;

    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  async validateUser(user, allPayments) {
    const userPayments = allPayments.filter(p => p.userId === user.id);
    const purchasedCourses = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];

    const validation = {
      userId: user.id,
      username: user.username,
      email: user.email,
      issues: [],
      canFix: false,
      data: {
        paymentsCount: userPayments.length,
        purchasedCoursesCount: purchasedCourses.length,
        missingInPurchased: [],
        missingInPayments: [],
        inconsistentData: []
      }
    };

    // Cek missing payments in purchasedCourses
    userPayments.forEach(payment => {
      const exists = purchasedCourses.some(course => 
        course.courseId === payment.courseId && 
        new Date(course.expiryDate).getTime() === new Date(payment.expiryDate).getTime()
      );

      if (!exists) {
        validation.data.missingInPurchased.push({
          courseId: payment.courseId,
          paymentId: payment.id,
          expiryDate: payment.expiryDate,
          amount: payment.amount
        });
      }
    });

    // Cek missing purchasedCourses in payments
    purchasedCourses.forEach(course => {
      const exists = userPayments.some(payment => 
        payment.courseId === course.courseId && 
        new Date(payment.expiryDate).getTime() === new Date(course.expiryDate).getTime()
      );

      if (!exists && course.isActive) {
        validation.data.missingInPayments.push({
          courseId: course.courseId,
          expiryDate: course.expiryDate,
          purchaseDate: course.purchaseDate
        });
      }
    });

    // Cek data yang tidak konsisten
    userPayments.forEach(payment => {
      const course = purchasedCourses.find(c => c.courseId === payment.courseId);
      if (course) {
        const inconsistencies = [];
        
        if (new Date(course.expiryDate).getTime() !== new Date(payment.expiryDate).getTime()) {
          inconsistencies.push('expiry_date_mismatch');
        }
        
        if (course.isActive !== payment.isActive) {
          inconsistencies.push('active_status_mismatch');
        }

        if (inconsistencies.length > 0) {
          validation.data.inconsistentData.push({
            courseId: payment.courseId,
            paymentId: payment.id,
            inconsistencies,
            paymentData: payment,
            courseData: course
          });
        }
      }
    });

    // Generate issues
    if (validation.data.missingInPurchased.length > 0) {
      validation.issues.push({
        type: 'MISSING_IN_PURCHASED',
        userId: user.id,
        count: validation.data.missingInPurchased.length,
        details: validation.data.missingInPurchased
      });
      validation.canFix = true;
    }

    if (validation.data.missingInPayments.length > 0) {
      validation.issues.push({
        type: 'MISSING_IN_PAYMENTS',
        userId: user.id,
        count: validation.data.missingInPayments.length,
        details: validation.data.missingInPayments
      });
    }

    if (validation.data.inconsistentData.length > 0) {
      validation.issues.push({
        type: 'INCONSISTENT_DATA',
        userId: user.id,
        count: validation.data.inconsistentData.length,
        details: validation.data.inconsistentData
      });
      validation.canFix = true;
    }

    return validation;
  }

  async fixUserIssues(user, validation) {
    try {
      const currentCourses = Array.isArray(user.purchasedCourses) ? user.purchasedCourses : [];
      let updatedCourses = [...currentCourses];

      // Fix missing payments in purchasedCourses
      validation.data.missingInPurchased.forEach(missing => {
        const existingIndex = updatedCourses.findIndex(c => c.courseId === missing.courseId);
        const newCourse = {
          courseId: missing.courseId,
          purchaseDate: new Date().toISOString(),
          expiryDate: missing.expiryDate,
          isActive: true,
          transactionId: missing.paymentId,
          syncedFrom: 'auto_fix'
        };

        if (existingIndex >= 0) {
          updatedCourses[existingIndex] = newCourse;
        } else {
          updatedCourses.push(newCourse);
        }
      });

      // Fix inconsistent data
      validation.data.inconsistentData.forEach(inconsistent => {
        const index = updatedCourses.findIndex(c => c.courseId === inconsistent.courseId);
        if (index >= 0) {
          updatedCourses[index] = {
            ...updatedCourses[index],
            expiryDate: inconsistent.paymentData.expiryDate,
            isActive: inconsistent.paymentData.isActive,
            syncedFrom: 'auto_fix'
          };
        }
      });

      // Update user
      await this.updateUserPurchasedCourses(user.id, updatedCourses);

      return {
        success: true,
        userId: user.id,
        username: user.username,
        coursesAdded: validation.data.missingInPurchased.length,
        inconsistenciesFixed: validation.data.inconsistentData.length
      };

    } catch (error) {
      return {
        success: false,
        userId: user.id,
        error: error.message
      };
    }
  }

  async getAllPayments() {
    const command = new ScanCommand({
      TableName: this.paymentsTable
    });

    const result = await this.docClient.send(command);
    return result.Items || [];
  }

  async getAllUsers() {
    const command = new ScanCommand({
      TableName: this.usersTable,
      ProjectionExpression: 'id, username, email, purchasedCourses, createdAt'
    });

    const result = await this.docClient.send(command);
    return result.Items || [];
  }

  async findOrphanedPayments(payments, users) {
    const userIds = new Set(users.map(u => u.id));
    return payments.filter(p => !userIds.has(p.userId));
  }

  async updateUserPurchasedCourses(userId, courses) {
    const command = new UpdateCommand({
      TableName: this.usersTable,
      Key: { id: userId },
      UpdateExpression: 'SET purchasedCourses = :courses, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':courses': courses,
        ':updatedAt': new Date().toISOString()
      }
    });

    await this.docClient.send(command);
  }

  generateSummary(report) {
    const issues = report.issues;
    const summary = {
      totalIssues: issues.length,
      byType: {
        MISSING_IN_PURCHASED: 0,
        MISSING_IN_PAYMENTS: 0,
        INCONSISTENT_DATA: 0,
        ORPHANED_PAYMENTS: 0
      },
      usersAffected: new Set(),
      totalCoursesMissing: 0,
      totalInconsistencies: 0
    };

    issues.forEach(issue => {
      summary.byType[issue.type] = (summary.byType[issue.type] || 0) + 1;
      summary.usersAffected.add(issue.userId);
      
      if (issue.type === 'MISSING_IN_PURCHASED') {
        summary.totalCoursesMissing += issue.count;
      } else if (issue.type === 'INCONSISTENT_DATA') {
        summary.totalInconsistencies += issue.count;
      }
    });

    summary.usersAffected = summary.usersAffected.size;

    console.log('\n📋 Validation Summary:');
    console.log('====================');
    console.log(`Total Issues: ${summary.totalIssues}`);
    console.log(`Users Affected: ${summary.usersAffected}`);
    console.log(`Courses Missing: ${summary.totalCoursesMissing}`);
    console.log(`Data Inconsistencies: ${summary.totalInconsistencies}`);
    console.log(`\nBy Type:`);
    console.log(`- Missing in purchasedCourses: ${summary.byType.MISSING_IN_PURCHASED}`);
    console.log(`- Missing in payments: ${summary.byType.MISSING_IN_PAYMENTS}`);
    console.log(`- Inconsistent data: ${summary.byType.INCONSISTENT_DATA}`);
    console.log(`- Orphaned payments: ${summary.byType.ORPHANED_PAYMENTS}`);

    if (report.fixed.length > 0) {
      console.log(`\n✅ Fixed Issues: ${report.fixed.length}`);
      report.fixed.forEach(fix => {
        console.log(`- ${fix.username} (${fix.userId}): ${fix.coursesAdded} courses added, ${fix.inconsistenciesFixed} fixed`);
      });
    }

    report.summary = summary;
  }
}

// Main execution
async function main() {
  const fixIssues = process.argv.includes('--fix');
  const validator = new PaymentValidator();

  console.log('🔍 Starting payment data validation...');
  console.log(`Mode: ${fixIssues ? 'FIX' : 'VALIDATE'}`);
  
  try {
    const report = await validator.validateAllData(fixIssues);
    
    // Save report to file
    const fs = require('fs');
    const reportPath = `payment-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    if (report.issues.length === 0) {
      console.log('🎉 All data is consistent! No issues found.');
    } else if (!fixIssues) {
      console.log('💡 Run with --fix flag to automatically fix issues');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PaymentValidator;