const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Quick Deploy - Secure Voting System');
console.log('=====================================');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this from the project root.');
  process.exit(1);
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
  console.error('❌ Error: Node.js 18+ is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version:', nodeVersion);

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('⚠️  Warning: .env file not found. Creating from example...');
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env');
    console.log('✅ Created .env file from env.example');
    console.log('📝 Please update .env with your actual Supabase credentials');
  } else {
    console.log('❌ Error: No .env or env.example file found');
    process.exit(1);
  }
}

// Build the application
console.log('\n🔨 Building application...');
try {
  execSync('npm install', { stdio: 'inherit' });
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Application built successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check if Vercel CLI is available
let vercelAvailable = false;
try {
  execSync('vercel --version', { stdio: 'pipe' });
  vercelAvailable = true;
  console.log('✅ Vercel CLI found');
} catch (error) {
  console.log('⚠️  Vercel CLI not found');
}

// Check if Railway CLI is available
let railwayAvailable = false;
try {
  execSync('railway --version', { stdio: 'pipe' });
  railwayAvailable = true;
  console.log('✅ Railway CLI found');
} catch (error) {
  console.log('⚠️  Railway CLI not found');
}

// Check if Heroku CLI is available
let herokuAvailable = false;
try {
  execSync('heroku --version', { stdio: 'pipe' });
  herokuAvailable = true;
  console.log('✅ Heroku CLI found');
} catch (error) {
  console.log('⚠️  Heroku CLI not found');
}

console.log('\n🌐 Available deployment options:');

if (vercelAvailable) {
  console.log('1) Vercel (Recommended)');
}
if (railwayAvailable) {
  console.log('2) Railway');
}
if (herokuAvailable) {
  console.log('3) Heroku');
}

console.log('4) Manual deployment instructions');
console.log('5) Install deployment tools');

// Simple deployment function
function deployToVercel() {
  console.log('\n🚀 Deploying to Vercel...');
  try {
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Successfully deployed to Vercel!');
    console.log('📝 Don\'t forget to set your environment variables in the Vercel dashboard');
  } catch (error) {
    console.error('❌ Vercel deployment failed:', error.message);
  }
}

function deployToRailway() {
  console.log('\n🚀 Deploying to Railway...');
  try {
    execSync('railway up', { stdio: 'inherit' });
    console.log('✅ Successfully deployed to Railway!');
    console.log('📝 Don\'t forget to set your environment variables in the Railway dashboard');
  } catch (error) {
    console.error('❌ Railway deployment failed:', error.message);
  }
}

function deployToHeroku() {
  console.log('\n🚀 Deploying to Heroku...');
  try {
    // Check if git repo exists
    try {
      execSync('git status', { stdio: 'pipe' });
    } catch (error) {
      console.log('📝 Initializing git repository...');
      execSync('git init', { stdio: 'inherit' });
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    }
    
    // Create Heroku app
    execSync('heroku create secure-voting-system', { stdio: 'inherit' });
    
    // Set environment variables
    execSync('heroku config:set NODE_ENV=production', { stdio: 'inherit' });
    
    // Deploy
    execSync('git push heroku main', { stdio: 'inherit' });
    
    console.log('✅ Successfully deployed to Heroku!');
  } catch (error) {
    console.error('❌ Heroku deployment failed:', error.message);
  }
}

function showManualInstructions() {
  console.log('\n📋 Manual Deployment Instructions:');
  console.log('==================================');
  console.log('\n1. Vercel:');
  console.log('   - Go to https://vercel.com');
  console.log('   - Import your GitHub repository');
  console.log('   - Set build command: npm run build');
  console.log('   - Set output directory: dist');
  console.log('   - Add environment variables');
  console.log('   - Deploy!');
  
  console.log('\n2. Railway:');
  console.log('   - Go to https://railway.app');
  console.log('   - Connect your GitHub repository');
  console.log('   - Add environment variables');
  console.log('   - Deploy!');
  
  console.log('\n3. Heroku:');
  console.log('   - Go to https://heroku.com');
  console.log('   - Create new app');
  console.log('   - Connect GitHub repository');
  console.log('   - Add environment variables');
  console.log('   - Enable automatic deploys');
  console.log('   - Deploy!');
  
  console.log('\n4. DigitalOcean App Platform:');
  console.log('   - Go to https://cloud.digitalocean.com/apps');
  console.log('   - Create new app');
  console.log('   - Connect GitHub repository');
  console.log('   - Set build command: npm run build');
  console.log('   - Set run command: npm start');
  console.log('   - Add environment variables');
  console.log('   - Deploy!');
}

function installDeploymentTools() {
  console.log('\n🔧 Installing deployment tools...');
  
  try {
    console.log('Installing Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed');
  } catch (error) {
    console.log('❌ Failed to install Vercel CLI');
  }
  
  try {
    console.log('Installing Railway CLI...');
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    console.log('✅ Railway CLI installed');
  } catch (error) {
    console.log('❌ Failed to install Railway CLI');
  }
  
  console.log('\n📝 Heroku CLI:');
  console.log('   Download from: https://devcenter.heroku.com/articles/heroku-cli');
  
  console.log('\n✅ Deployment tools installation completed!');
  console.log('   Run this script again to deploy.');
}

// Main deployment logic
if (process.argv.length > 2) {
  const option = process.argv[2];
  
  switch (option) {
    case '1':
    case 'vercel':
      if (vercelAvailable) {
        deployToVercel();
      } else {
        console.log('❌ Vercel CLI not available. Install it first.');
      }
      break;
    case '2':
    case 'railway':
      if (railwayAvailable) {
        deployToRailway();
      } else {
        console.log('❌ Railway CLI not available. Install it first.');
      }
      break;
    case '3':
    case 'heroku':
      if (herokuAvailable) {
        deployToHeroku();
      } else {
        console.log('❌ Heroku CLI not available. Install it first.');
      }
      break;
    case '4':
    case 'manual':
      showManualInstructions();
      break;
    case '5':
    case 'install':
      installDeploymentTools();
      break;
    default:
      console.log('❌ Invalid option. Use: node quick-deploy.js [1-5]');
  }
} else {
  // Interactive mode
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\nSelect deployment option (1-5): ', (answer) => {
    switch (answer) {
      case '1':
        if (vercelAvailable) {
          deployToVercel();
        } else {
          console.log('❌ Vercel CLI not available. Install it first.');
        }
        break;
      case '2':
        if (railwayAvailable) {
          deployToRailway();
        } else {
          console.log('❌ Railway CLI not available. Install it first.');
        }
        break;
      case '3':
        if (herokuAvailable) {
          deployToHeroku();
        } else {
          console.log('❌ Heroku CLI not available. Install it first.');
        }
        break;
      case '4':
        showManualInstructions();
        break;
      case '5':
        installDeploymentTools();
        break;
      default:
        console.log('❌ Invalid option.');
    }
    
    rl.close();
  });
}
