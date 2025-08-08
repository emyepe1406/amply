const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${command} completed successfully`);
        resolve(code);
      } else {
        console.log(`❌ ${command} failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error(`❌ Error running ${command}:`, error.message);
      reject(error);
    });
  });
}

function checkBuildOutput() {
  const buildDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(buildDir)) {
    throw new Error('Build directory not found');
  }
  
  if (!fs.existsSync(staticDir)) {
    throw new Error('Static directory not found in build');
  }
  
  const buildManifest = path.join(buildDir, 'build-manifest.json');
  if (!fs.existsSync(buildManifest)) {
    throw new Error('Build manifest not found');
  }
  
  console.log('✅ Build output validation passed');
}

function checkEnvironmentFiles() {
  const requiredFiles = [
    '.env.production',
    'amplify.yml',
    'DEPLOYMENT.md'
  ];
  
  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(process.cwd(), file);
    return !fs.existsSync(filePath);
  });
  
  if (missingFiles.length > 0) {
    throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
  }
  
  console.log('✅ Required files validation passed');
}

async function testProductionBuild() {
  console.log('🚀 Testing Production Build\n');
  
  try {
    // Step 1: Check required files
    console.log('📋 Step 1: Checking required files...');
    checkEnvironmentFiles();
    console.log('');
    
    // Step 2: Validate environment
    console.log('🔍 Step 2: Validating environment...');
    await runCommand('npm', ['run', 'validate-env']);
    console.log('');
    
    // Step 3: Install dependencies
    console.log('📦 Step 3: Installing dependencies...');
    await runCommand('npm', ['ci']);
    console.log('');
    
    // Step 4: Run linting
    console.log('🔍 Step 4: Running linter...');
    try {
      await runCommand('npm', ['run', 'lint']);
    } catch (error) {
      console.log('⚠️  Linting issues found, but continuing...');
    }
    console.log('');
    
    // Step 5: Build for production
    console.log('🏗️  Step 5: Building for production...');
    await runCommand('npm', ['run', 'build']);
    console.log('');
    
    // Step 6: Validate build output
    console.log('✅ Step 6: Validating build output...');
    checkBuildOutput();
    console.log('');
    
    // Step 7: Test production server (optional)
    console.log('🌐 Step 7: Testing production server...');
    console.log('💡 You can manually test with: npm start');
    console.log('💡 Then visit: http://localhost:3000');
    console.log('');
    
    // Success summary
    console.log('🎉 PRODUCTION BUILD TEST COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Test the app locally: npm start');
    console.log('   2. Setup AWS resources: npm run deploy-setup');
    console.log('   3. Deploy to Amplify: npm run amplify-publish');
    console.log('   4. Update Midtrans URLs with your Amplify domain');
    console.log('');
    console.log('📖 For detailed instructions, see DEPLOYMENT.md');
    
  } catch (error) {
    console.error('\n❌ PRODUCTION BUILD TEST FAILED!');
    console.error('Error:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Check .env.production configuration');
    console.log('   2. Verify all dependencies are installed');
    console.log('   3. Fix any linting or build errors');
    console.log('   4. See DEPLOYMENT.md for help');
    
    process.exit(1);
  }
}

if (require.main === module) {
  testProductionBuild();
}

module.exports = { testProductionBuild };