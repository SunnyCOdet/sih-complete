#!/bin/bash

# Secure Voting System Deployment Script
# This script deploys the system to various platforms

set -e

echo "🚀 Secure Voting System Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build the application
build_app() {
    print_status "Building the application..."
    
    # Install dependencies
    npm install
    
    # Build TypeScript
    npm run build
    
    print_success "Application built successfully"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    vercel --prod
    
    print_success "Deployed to Vercel successfully"
}

# Deploy to Railway
deploy_railway() {
    print_status "Deploying to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    railway login
    
    # Deploy
    railway up
    
    print_success "Deployed to Railway successfully"
}

# Deploy to Heroku
deploy_heroku() {
    print_status "Deploying to Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        print_warning "Heroku CLI not found. Please install from https://devcenter.heroku.com/articles/heroku-cli"
        return 1
    fi
    
    # Login to Heroku
    heroku login
    
    # Create app if it doesn't exist
    if ! heroku apps:info secure-voting-system &> /dev/null; then
        heroku create secure-voting-system
    fi
    
    # Set environment variables
    heroku config:set NODE_ENV=production
    heroku config:set SUPABASE_URL=$SUPABASE_URL
    heroku config:set SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
    heroku config:set SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
    
    # Deploy
    git push heroku main
    
    print_success "Deployed to Heroku successfully"
}

# Deploy to DigitalOcean App Platform
deploy_digitalocean() {
    print_status "Deploying to DigitalOcean App Platform..."
    
    print_warning "DigitalOcean deployment requires manual setup through the web interface"
    print_status "1. Go to https://cloud.digitalocean.com/apps"
    print_status "2. Create a new app"
    print_status "3. Connect your GitHub repository"
    print_status "4. Set the build command to: npm run build"
    print_status "5. Set the run command to: npm start"
    print_status "6. Add environment variables for Supabase"
    
    print_success "DigitalOcean deployment instructions provided"
}

# Deploy to AWS
deploy_aws() {
    print_status "Deploying to AWS..."
    
    if ! command -v aws &> /dev/null; then
        print_warning "AWS CLI not found. Please install from https://aws.amazon.com/cli/"
        return 1
    fi
    
    # Create Elastic Beanstalk application
    aws elasticbeanstalk create-application \
        --application-name secure-voting-system \
        --description "Secure Voting System with Blockchain and Zero-Knowledge Proofs"
    
    # Create environment
    aws elasticbeanstalk create-environment \
        --application-name secure-voting-system \
        --environment-name secure-voting-prod \
        --solution-stack-name "64bit Amazon Linux 2 v5.8.0 running Node.js 18"
    
    print_success "AWS deployment initiated"
}

# Deploy to Google Cloud Platform
deploy_gcp() {
    print_status "Deploying to Google Cloud Platform..."
    
    if ! command -v gcloud &> /dev/null; then
        print_warning "Google Cloud CLI not found. Please install from https://cloud.google.com/sdk/docs/install"
        return 1
    fi
    
    # Deploy to Cloud Run
    gcloud run deploy secure-voting-system \
        --source . \
        --platform managed \
        --region us-central1 \
        --allow-unauthenticated
    
    print_success "Deployed to Google Cloud Run successfully"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    cd frontend
    
    # Install dependencies
    npm install
    
    # Build frontend
    npm run build
    
    # Deploy to Vercel
    if command -v vercel &> /dev/null; then
        vercel --prod
        print_success "Frontend deployed to Vercel"
    else
        print_warning "Vercel CLI not found. Please deploy frontend manually."
    fi
    
    cd ..
}

# Deploy mobile app
deploy_mobile() {
    print_status "Deploying mobile app..."
    
    cd voting-app
    
    # Install dependencies
    npm install
    
    # Build for production
    npx expo build:android --type apk
    npx expo build:ios --type archive
    
    print_success "Mobile app built successfully"
    print_status "Upload the generated files to Google Play Store and Apple App Store"
    
    cd ..
}

# Main deployment function
main() {
    echo "Select deployment platform:"
    echo "1) Vercel (Recommended for quick deployment)"
    echo "2) Railway"
    echo "3) Heroku"
    echo "4) DigitalOcean App Platform"
    echo "5) AWS Elastic Beanstalk"
    echo "6) Google Cloud Platform"
    echo "7) Deploy all components (Backend + Frontend + Mobile)"
    echo "8) Custom deployment"
    
    read -p "Enter your choice (1-8): " choice
    
    case $choice in
        1)
            check_dependencies
            build_app
            deploy_vercel
            ;;
        2)
            check_dependencies
            build_app
            deploy_railway
            ;;
        3)
            check_dependencies
            build_app
            deploy_heroku
            ;;
        4)
            check_dependencies
            build_app
            deploy_digitalocean
            ;;
        5)
            check_dependencies
            build_app
            deploy_aws
            ;;
        6)
            check_dependencies
            build_app
            deploy_gcp
            ;;
        7)
            check_dependencies
            build_app
            deploy_vercel
            deploy_frontend
            deploy_mobile
            ;;
        8)
            print_status "Custom deployment selected"
            print_status "Please follow the deployment instructions for your chosen platform"
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    print_success "Deployment completed!"
    print_status "Don't forget to:"
    print_status "1. Set up your Supabase database"
    print_status "2. Configure environment variables"
    print_status "3. Test the deployed application"
    print_status "4. Set up monitoring and logging"
}

# Run main function
main "$@"