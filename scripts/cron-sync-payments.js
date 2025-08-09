#!/usr/bin/env node

/**
 * Cron Job: Background Payment Sync
 * 
 * Script untuk dijalankan secara berkala via cron job atau scheduler
 * Memastikan data antara lms-payments dan user.purchasedCourses selalu sinkron
 */

const PaymentSyncService = require('../src/lib/PaymentSyncService');

// Configure logging
const fs = require('fs');
const path = require('path');

class CronSyncService {
  constructor() {
    this.syncService = new PaymentSyncService();
    this.logFile = path.join(__dirname, '..', 'logs', 'payment-sync.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(message);
    fs.appendFileSync(this.logFile, logEntry);
  }

  async runSync() {
    this.log('🔄 Starting background payment sync...');
    
    try {
      const startTime = Date.now();
      
      // Jalankan sync
      const results = await this.syncService.syncAllUsers();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Hitung statistik
      const successful = results.filter(r => r.success && r.updated).length;
      const skipped = results.filter(r => r.success && !r.updated).length;
      const failed = results.filter(r => !r.success).length;
      const totalUsers = results.length;
      
      this.log(`✅ Sync completed successfully`);
      this.log(`📊 Total users processed: ${totalUsers}`);
      this.log(`✅ Users updated: ${successful}`);
      this.log(`⏭️  Users skipped: ${skipped}`);
      this.log(`❌ Users failed: ${failed}`);
      this.log(`⏱️  Duration: ${duration}ms`);
      
      // Validasi tambahan jika ada user yang gagal
      if (failed > 0) {
        const failedUsers = results.filter(r => !r.success);
        this.log(`❌ Failed users: ${failedUsers.map(u => u.userId).join(', ')}`);
      }
      
      return {
        success: true,
        totalUsers,
        successful,
        skipped,
        failed,
        duration
      };
      
    } catch (error) {
      this.log(`❌ Sync failed: ${error.message}`, 'ERROR');
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async runValidation() {
    this.log('🔍 Starting data validation...');
    
    try {
      const PaymentValidator = require('./validate-payment-sync');
      const validator = new PaymentValidator();
      
      const report = await validator.validateAllData(false); // Only validate, don't fix
      
      this.log(`📋 Validation completed`);
      this.log(`📊 Total issues found: ${report.issues.length}`);
      this.log(`👥 Users affected: ${report.summary.usersAffected || 0}`);
      this.log(`💰 Courses missing: ${report.summary.totalCoursesMissing || 0}`);
      
      if (report.issues.length > 0) {
        this.log(`💡 Consider running validation with --fix flag to resolve issues`);
      }
      
      return report;
      
    } catch (error) {
      this.log(`❌ Validation failed: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async runHealthCheck() {
    this.log('🏥 Running health check...');
    
    const health = {
      timestamp: new Date().toISOString(),
      database: 'unknown',
      services: {}
    };
    
    try {
      // Test database connection
      const command = {
        TableName: this.syncService.paymentsTable,
        Limit: 1
      };
      
      await this.syncService.docClient.send(new (require('@aws-sdk/lib-dynamodb').ScanCommand)(command));
      health.database = 'healthy';
      
      // Test sync service
      const users = await this.syncService.getUsersWithPayments();
      health.services.syncService = users.length > 0 ? 'healthy' : 'no_data';
      
      this.log(`🏥 Health check completed`);
      this.log(`📊 Database: ${health.database}`);
      this.log(`📊 Sync Service: ${health.services.syncService}`);
      this.log(`👥 Users with payments: ${users.length}`);
      
      return health;
      
    } catch (error) {
      health.database = 'error';
      health.error = error.message;
      this.log(`❌ Health check failed: ${error.message}`, 'ERROR');
      return health;
    }
  }
}

// Main execution
async function main() {
  const cronService = new CronSyncService();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'sync';
  
  try {
    switch (command) {
      case 'sync':
        await cronService.runSync();
        break;
        
      case 'validate':
        await cronService.runValidation();
        break;
        
      case 'health':
        await cronService.runHealthCheck();
        break;
        
      default:
        console.log('Usage: node cron-sync-payments.js [sync|validate|health]');
        process.exit(1);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Cron job failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CronSyncService;