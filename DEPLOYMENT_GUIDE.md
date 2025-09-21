# 🚀 Secure Voting System - Deployment Guide

This guide covers deploying the complete Secure Voting System to various cloud platforms.

## 📋 Prerequisites

### Required Tools
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com/)

### Environment Variables
Before deploying, ensure you have these environment variables:
```bash
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NODE_ENV=production
PORT=3000
```

## 🎯 Quick Deployment Options

### Option 1: Automated Deployment (Recommended)
```bash
# For Linux/Mac
chmod +x deploy.sh
./deploy.sh

# For Windows
deploy.bat
```

### Option 2: Manual Platform-Specific Deployment

## 🌐 Platform-Specific Deployment

### 1. Vercel (Recommended for Quick Start)

**Advantages:** Fast, easy, great for prototypes
**Cost:** Free tier available

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

**Frontend Deployment:**
```bash
cd frontend
npm install
npm run build
vercel --prod
```

### 2. Railway

**Advantages:** Simple, good for full-stack apps
**Cost:** Pay-as-you-go

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up

# Set environment variables in Railway dashboard
```

### 3. Heroku

**Advantages:** Mature platform, good documentation
**Cost:** Free tier discontinued, paid plans available

```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login and create app
heroku login
heroku create secure-voting-system

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_ANON_KEY=your-key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Deploy
git push heroku main
```

### 4. DigitalOcean App Platform

**Advantages:** Good performance, reasonable pricing
**Cost:** Starting at $5/month

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Create new app
3. Connect GitHub repository
4. Set build command: `npm run build`
5. Set run command: `npm start`
6. Add environment variables
7. Deploy

### 5. AWS (Elastic Beanstalk)

**Advantages:** Scalable, enterprise-grade
**Cost:** Pay for resources used

```bash
# Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# Configure AWS
aws configure

# Create application
aws elasticbeanstalk create-application \
  --application-name secure-voting-system \
  --description "Secure Voting System"

# Deploy
eb init
eb create production
eb deploy
```

### 6. Google Cloud Platform (Cloud Run)

**Advantages:** Serverless, auto-scaling
**Cost:** Pay per request

```bash
# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Deploy to Cloud Run
gcloud run deploy secure-voting-system \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 📱 Mobile App Deployment

### Android (Google Play Store)

1. **Build APK:**
```bash
cd voting-app
npm install
npx expo build:android --type apk
```

2. **Upload to Play Console:**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - Upload APK
   - Fill in store listing
   - Submit for review

### iOS (Apple App Store)

1. **Build iOS App:**
```bash
cd voting-app
npx expo build:ios --type archive
```

2. **Upload to App Store Connect:**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create new app
   - Upload build
   - Fill in app information
   - Submit for review

## 🗄️ Database Setup

### Supabase Configuration

1. **Create Supabase Project:**
   - Go to [Supabase](https://supabase.com)
   - Create new project
   - Note down URL and keys

2. **Run Database Schema:**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `setup-database.sql`
   - Execute the script

3. **Configure Row Level Security:**
   - The schema includes RLS policies
   - Review and adjust as needed

## 🔧 Environment Configuration

### Backend Environment Variables
```bash
# Production
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional
CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables
```bash
# Create frontend/.env.production
REACT_APP_API_URL=https://your-backend-domain.com/api/voting
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile App Environment Variables
```bash
# Create voting-app/.env.production
EXPO_PUBLIC_API_URL=https://your-backend-domain.com/api/voting
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl https://your-backend-domain.com/health
```

### 2. API Endpoints Test
```bash
# Test public endpoints
curl https://your-backend-domain.com/api/voting/public/voters
curl https://your-backend-domain.com/api/voting/public/voting-status
```

### 3. Frontend Test
- Open your frontend URL
- Test voter registration
- Test voting process
- Test results display

### 4. Mobile App Test
- Install APK on Android device
- Test all features
- Verify API connectivity

## 📊 Monitoring and Logging

### 1. Application Monitoring
- Set up monitoring with services like:
  - **Sentry** - Error tracking
  - **LogRocket** - Session replay
  - **New Relic** - Performance monitoring

### 2. Database Monitoring
- Use Supabase dashboard for database metrics
- Set up alerts for unusual activity
- Monitor query performance

### 3. Security Monitoring
- Enable Supabase security features
- Monitor for suspicious activities
- Set up alerts for failed authentication

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate keys regularly

### 2. CORS Configuration
- Configure CORS for your domains only
- Use HTTPS in production
- Implement rate limiting

### 3. Database Security
- Enable Row Level Security (RLS)
- Use service role key only on backend
- Regular security audits

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version (18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

2. **Database Connection Issues:**
   - Verify Supabase credentials
   - Check network connectivity
   - Verify database schema is created

3. **CORS Errors:**
   - Update CORS configuration
   - Check frontend API URLs
   - Verify HTTPS usage

4. **Mobile App Issues:**
   - Check Expo configuration
   - Verify API endpoints
   - Test on physical devices

### Getting Help

- Check the logs in your deployment platform
- Review Supabase logs
- Test locally first
- Use the test scripts provided

## 📈 Scaling Considerations

### 1. Database Scaling
- Supabase handles scaling automatically
- Consider read replicas for high traffic
- Monitor query performance

### 2. Application Scaling
- Use load balancers for multiple instances
- Implement caching strategies
- Monitor resource usage

### 3. CDN for Frontend
- Use Vercel's global CDN
- Implement proper caching headers
- Optimize static assets

## 🎉 Post-Deployment Checklist

- [ ] Backend API is accessible
- [ ] Database is connected and working
- [ ] Frontend is deployed and functional
- [ ] Mobile app is built and ready
- [ ] Environment variables are set
- [ ] SSL certificates are active
- [ ] Monitoring is configured
- [ ] Security measures are in place
- [ ] Documentation is updated
- [ ] Team is trained on deployment

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review platform-specific documentation
3. Check the troubleshooting section
4. Contact platform support if needed

---

**Happy Deploying! 🚀**

Your Secure Voting System is now ready for production use!