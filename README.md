# 🗳️ Secure Voting System

A comprehensive, secure, and transparent voting system built with blockchain technology, zero-knowledge proofs, and public transparency features.

## 🌟 Features

### 🔐 Security Features
- **Cryptographic Security**: Elliptic curve cryptography for voter authentication
- **Zero-Knowledge Proofs**: Vote privacy without revealing choices
- **Blockchain Integrity**: Immutable vote records with tamper detection
- **Public Key Infrastructure**: Secure voter registration and verification
- **Rate Limiting**: Protection against abuse and spam

### 🌐 Transparency Features
- **Public Voter Registry**: Anyone can see who has registered to vote
- **Voting Status Visibility**: Real-time information about who has voted
- **Live Statistics**: Real-time voting percentages and counts
- **Vote Verification**: All votes are publicly verifiable
- **Complete Audit Trail**: Full transparency and accountability

### 📱 Multi-Platform Support
- **Backend API**: Node.js/Express with TypeScript
- **Web Frontend**: React with modern UI/UX
- **Mobile App**: Expo/React Native for iOS and Android
- **Public API**: RESTful API with comprehensive documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd secure-voting-system
```

2. **Install dependencies**
```bash
# Backend
npm install

# Frontend
cd frontend && npm install

# Mobile App
cd ../voting-app && npm install
```

3. **Set up environment variables**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your Supabase credentials
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

4. **Set up database**
- Go to your Supabase dashboard
- Open SQL Editor
- Copy and paste the contents of `setup-database.sql`
- Execute the script

5. **Start the system**
```bash
# Backend
npm start

# Frontend (in another terminal)
cd frontend && npm start

# Mobile App (in another terminal)
cd voting-app && npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/voting
```

### Complete API Documentation
Visit: `http://localhost:3000/api/docs`

### Key Endpoints

#### Voter Registration
```bash
POST /api/voting/register
Content-Type: application/json

{
  "voterId": "voter_12345",
  "publicKey": "04a1b2c3d4e5f6...",
  "registrationData": {
    "name": "John Doe"
  }
}
```

#### Vote Submission
```bash
POST /api/voting/submit
Content-Type: application/json

{
  "voterId": "voter_12345",
  "candidateId": "candidate_1"
}
```

#### Public Transparency
```bash
# Get all voters with voting status
GET /api/voting/public/voters

# Get voting statistics
GET /api/voting/public/voting-status

# Get all votes (public info)
GET /api/voting/public/votes

# Get comprehensive transparency data
GET /api/voting/public/transparency
```

## 🏗️ Project Structure

```
secure-voting-system/
├── src/                          # Backend source code
│   ├── api/                      # API routes
│   │   ├── routes/
│   │   │   ├── voting.ts         # Voting endpoints
│   │   │   └── docs.ts           # API documentation
│   ├── blockchain/               # Blockchain implementation
│   ├── crypto/                   # Cryptographic functions
│   ├── services/                 # Business logic services
│   └── types/                    # TypeScript type definitions
├── frontend/                     # React web application
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── services/             # API services
│   │   └── theme/                # UI theme
├── voting-app/                   # Expo mobile application
│   ├── src/
│   │   ├── screens/              # Mobile screens
│   │   ├── services/             # API services
│   │   └── context/              # React context
├── scripts/                      # Utility scripts
├── docs/                         # Documentation
├── deploy.sh                     # Deployment script
├── quick-deploy.js              # Quick deployment tool
└── setup-database.sql           # Database schema
```

## 🔧 Development

### Backend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Frontend Development
```bash
cd frontend

# Start development server
npm start

# Build for production
npm run build
```

### Mobile App Development
```bash
cd voting-app

# Start Expo development server
npm start

# Build for production
npm run build:android
npm run build:ios
```

## 🚀 Deployment

### Quick Deployment
```bash
# Automated deployment to multiple platforms
node quick-deploy.js

# Or use the deployment script
./deploy.sh
```

### Manual Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway up
```

#### Heroku
```bash
# Install Heroku CLI
# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test

# Mobile app tests
cd voting-app && npm test
```

### Test Scripts
- `test-complete-system.js` - Complete system integration test
- `test-public-endpoints.js` - Public API endpoints test
- `test-deployed-system.js` - Deployed system test

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### System Statistics
```bash
curl http://localhost:3000/api/voting/stats
```

### Blockchain Integrity
```bash
curl http://localhost:3000/api/voting/blockchain/integrity
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate keys regularly

### Database Security
- Enable Row Level Security (RLS)
- Use service role key only on backend
- Regular security audits

### API Security
- Configure CORS for your domains only
- Use HTTPS in production
- Implement rate limiting

## 📈 Performance

### Optimization Features
- Database indexing for fast queries
- Caching for frequently accessed data
- Rate limiting to prevent abuse
- Efficient blockchain operations

### Monitoring
- Real-time performance metrics
- Error tracking and logging
- Usage analytics
- System health monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](http://localhost:3000/api/docs)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Setup Guide](SETUP_GUIDE.md)

### Getting Help
- Check the troubleshooting section
- Review the API documentation
- Test locally first
- Check logs for errors

## 🎯 Roadmap

### Phase 1 ✅
- [x] Core voting system
- [x] Blockchain integration
- [x] Public transparency
- [x] Mobile app
- [x] Web frontend
- [x] API documentation

### Phase 2 🔄
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced security features
- [ ] Performance optimizations

### Phase 3 📋
- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Integration with external systems
- [ ] Scalability improvements

## 🏆 Acknowledgments

- Built with modern web technologies
- Secure by design
- Transparent and auditable
- Production-ready

---

**Your secure voting system is ready for production use! 🎉**