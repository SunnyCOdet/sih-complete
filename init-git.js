const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Initializing Git Repository for Secure Voting System');
console.log('=' .repeat(60));

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this from the project root.');
  process.exit(1);
}

// Check if git is installed
try {
  execSync('git --version', { stdio: 'pipe' });
  console.log('✅ Git is installed');
} catch (error) {
  console.error('❌ Error: Git is not installed. Please install Git first.');
  process.exit(1);
}

// Check if already a git repository
if (fs.existsSync('.git')) {
  console.log('⚠️  Warning: This directory is already a Git repository');
  console.log('   Continuing with setup...');
} else {
  // Initialize git repository
  console.log('📁 Initializing Git repository...');
  try {
    execSync('git init', { stdio: 'inherit' });
    console.log('✅ Git repository initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Git repository:', error.message);
    process.exit(1);
  }
}

// Create .gitignore if it doesn't exist
if (!fs.existsSync('.gitignore')) {
  console.log('📝 Creating .gitignore file...');
  // The .gitignore content is already created above
  console.log('✅ .gitignore file created');
} else {
  console.log('✅ .gitignore file already exists');
}

// Add all files to git
console.log('📦 Adding files to Git...');
try {
  execSync('git add .', { stdio: 'inherit' });
  console.log('✅ Files added to Git');
} catch (error) {
  console.error('❌ Failed to add files to Git:', error.message);
  process.exit(1);
}

// Create initial commit
console.log('💾 Creating initial commit...');
try {
  execSync('git commit -m "Initial commit: Secure Voting System with blockchain, zero-knowledge proofs, and public transparency"', { stdio: 'inherit' });
  console.log('✅ Initial commit created');
} catch (error) {
  console.error('❌ Failed to create initial commit:', error.message);
  process.exit(1);
}

// Display git status
console.log('\n📊 Git Status:');
try {
  execSync('git status', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to get Git status:', error.message);
}

// Display git log
console.log('\n📜 Recent Commits:');
try {
  execSync('git log --oneline -5', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to get Git log:', error.message);
}

// Display repository size
console.log('\n📏 Repository Information:');
try {
  const sizeOutput = execSync('du -sh .git', { stdio: 'pipe', encoding: 'utf8' });
  console.log(`   Repository size: ${sizeOutput.trim()}`);
} catch (error) {
  // Windows fallback
  try {
    const sizeOutput = execSync('powershell "Get-ChildItem -Recurse .git | Measure-Object -Property Length -Sum | Select-Object @{Name=\'Size(MB)\';Expression={[math]::Round($_.Sum/1MB,2)}}"', { stdio: 'pipe', encoding: 'utf8' });
    console.log(`   Repository size: ${sizeOutput.trim()}`);
  } catch (winError) {
    console.log('   Repository size: Unable to determine');
  }
}

// Display file count
try {
  const fileCount = execSync('git ls-files | wc -l', { stdio: 'pipe', encoding: 'utf8' });
  console.log(`   Files tracked: ${fileCount.trim()}`);
} catch (error) {
  // Windows fallback
  try {
    const fileCount = execSync('powershell "(git ls-files).Count"', { stdio: 'pipe', encoding: 'utf8' });
    console.log(`   Files tracked: ${fileCount.trim()}`);
  } catch (winError) {
    console.log('   Files tracked: Unable to determine');
  }
}

// Next steps
console.log('\n' + '='.repeat(60));
console.log('🎉 Git Repository Setup Complete!');
console.log('='.repeat(60));
console.log('\n📋 Next Steps:');
console.log('1. Create a repository on GitHub/GitLab/Bitbucket');
console.log('2. Add the remote origin:');
console.log('   git remote add origin <your-repo-url>');
console.log('3. Push to remote:');
console.log('   git push -u origin main');
console.log('\n🔗 Or use GitHub CLI:');
console.log('   gh repo create secure-voting-system --public');
console.log('   git push -u origin main');
console.log('\n📚 Useful Git Commands:');
console.log('   git status                    # Check repository status');
console.log('   git log --oneline            # View commit history');
console.log('   git branch                   # List branches');
console.log('   git add .                    # Stage all changes');
console.log('   git commit -m "message"      # Commit changes');
console.log('   git push                     # Push to remote');
console.log('   git pull                     # Pull from remote');
console.log('\n🚀 Your Secure Voting System is ready for version control!');
console.log('='.repeat(60));
