# Secure Voting System - Complete Setup Guide

This guide will help you set up and run the complete secure voting system with both backend and frontend.

## 🚀 Quick Start

### Option 1: Automated Setup (Windows)
```bash
# Run the automated setup script
start-voting-system.bat
```

### Option 2: Manual Setup

#### 1. Start Backend Server
```bash
# Install dependencies (if not already done)
npm install

# Start the backend server
npm start
```
Backend will run on: http://localhost:3000

#### 2. Start Frontend (in a new terminal)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```
Frontend will run on: http://localhost:3001

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🏗️ Project Structure

```
sih/
├── src/                    # Backend source code
│   ├── api/               # API routes
│   ├── blockchain/        # Blockchain implementation
│   ├── crypto/            # Cryptographic utilities
│   ├── services/          # Business logic services
│   └── types/             # TypeScript type definitions
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── services/      # API services
│   └── public/            # Static files
├── dist/                  # Compiled backend
├── package.json           # Backend dependencies
└── README.md             # Project documentation
```

## 🔧 Configuration

### Backend Configuration
The backend uses environment variables (optional):
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### Frontend Configuration
The frontend uses environment variables in `frontend/.env`:
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3000/api/voting)

## 🗳️ How to Use the Voting System

### 1. Access the System
- Open your browser and go to: http://localhost:3001
- You'll see the fingerprint authentication screen

### 2. Fingerprint Authentication
- Click "Start Fingerprint Scan"
- Wait for the simulated scanning process (2 seconds)
- The system will check if this fingerprint has already voted
- If not, you'll be authenticated and can proceed to vote

### 3. Voting Process
- Choose between BJP (🕉️) or Congress (✋)
- Click on your preferred party card
- Confirm your vote in the popup
- Your vote will be submitted to the blockchain

### 4. View Results
- After voting, you'll see the results page
- Navigate to "Results" to see live voting statistics
- View vote counts, percentages, and system integrity

### 5. Admin Panel
- Navigate to "Admin" to access the admin panel
- View all registered voters
- Monitor system statistics
- Check blockchain integrity
- View tamper detection alerts

## 🔒 Security Features

### Fingerprint Authentication
- Simulated fingerprint scanning
- Duplicate vote prevention
- Encrypted fingerprint storage

### Cryptographic Security
- Elliptic curve digital signatures
- Zero-knowledge proofs for vote privacy
- SHA-256 hashing for data integrity

### Blockchain Security
- Immutable vote storage
- Merkle tree verification
- Proof-of-work mining
- Chain integrity verification

### Tamper Detection
- Signature verification
- Duplicate vote detection
- Hash tampering detection
- Suspicious activity monitoring

## 🛠️ Development

### Backend Development
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📊 API Endpoints

### Voter Registration
- `POST /api/voting/register` - Register a new voter
- `POST /api/voting/generate-keys` - Generate key pair
- `GET /api/voting/voters` - Get all voters
- `GET /api/voting/voter/:id` - Get specific voter

### Voting Operations
- `POST /api/voting/submit` - Submit a vote
- `POST /api/voting/create-vote` - Create vote with ZK proof
- `GET /api/voting/votes` - Get all votes
- `GET /api/voting/results` - Get voting results
- `GET /api/voting/stats` - Get comprehensive statistics

### Security & Monitoring
- `GET /api/voting/blockchain/integrity` - Verify blockchain integrity
- `GET /api/voting/tamper-detection/activities` - Get suspicious activities
- `GET /api/voting/tamper-detection/stats` - Get tamper detection stats

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if port 3000 is available
   - Run `npm install` to ensure dependencies are installed
   - Check for TypeScript compilation errors

2. **Frontend won't start**
   - Check if port 3001 is available
   - Run `npm install` in the frontend directory
   - Check for React compilation errors

3. **API connection issues**
   - Ensure backend is running on port 3000
   - Check the `REACT_APP_API_URL` in frontend/.env
   - Verify CORS settings in backend

4. **Fingerprint authentication fails**
   - This is simulated - just wait for the scanning process
   - Check browser console for errors
   - Ensure localStorage is enabled

### Debug Mode

Enable debug logging by setting environment variables:
```bash
# Backend
NODE_ENV=development npm start

# Frontend
REACT_APP_DEBUG=true npm start
```

## 📝 Testing

### Backend Testing
```bash
# Run the demo
node dist/examples/usage.js

# Test API endpoints
curl http://localhost:3000/health
curl http://localhost:3000/api/voting
```

### Frontend Testing
- Open browser developer tools
- Check console for errors
- Test fingerprint authentication
- Verify vote submission
- Check results display

## 🚀 Production Deployment

### Backend Deployment
1. Build the project: `npm run build`
2. Set production environment variables
3. Use a process manager like PM2
4. Set up reverse proxy (nginx)
5. Enable HTTPS

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy the `build` folder to a web server
3. Configure environment variables
4. Set up HTTPS

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Review the console logs
3. Verify all dependencies are installed
4. Ensure both servers are running

## 🎯 Features Summary

✅ **Fingerprint Authentication** - Simulated biometric verification
✅ **Party Selection** - BJP and Congress voting options
✅ **Real-time Results** - Live voting statistics
✅ **Admin Panel** - System monitoring and management
✅ **Duplicate Prevention** - One vote per fingerprint
✅ **Blockchain Security** - Immutable vote storage
✅ **Tamper Detection** - Advanced security monitoring
✅ **Responsive Design** - Works on all devices

The system is now ready for use! 🎉
