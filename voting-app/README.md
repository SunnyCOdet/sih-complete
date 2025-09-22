# Secure Voting App - Expo React Native

A modern, secure voting application built with Expo React Native featuring real fingerprint authentication, beautiful UI, and comprehensive voting management.

## 🚀 Features

### 🔐 Real Fingerprint Authentication
- **Expo LocalAuthentication** - Uses actual device fingerprint scanners
- **Biometric Security** - Face ID, Touch ID, and Android fingerprint support
- **Secure Storage** - User data encrypted with Expo SecureStore
- **Fallback Support** - Graceful degradation for devices without biometrics

### 🗳️ Voting System
- **Two-Party Voting** - BJP and Congress candidates
- **Real-time Results** - Live vote counting and statistics
- **Vote Verification** - Cryptographic vote hashing and signatures
- **Duplicate Prevention** - One vote per person enforcement

### 👤 User Management
- **User Registration** - New user onboarding with fingerprint
- **User Profiles** - Name, registration date, voting status
- **Session Management** - Secure login/logout functionality
- **Data Persistence** - JSON storage with Expo SecureStore

### 📊 Admin Panel
- **Real-time Statistics** - Total users, votes, new registrations
- **User Management** - View all registered users and their status
- **Results Monitoring** - Live vote counts and percentages
- **Data Export** - Export voting data for analysis

### 🎨 Modern UI/UX
- **Material Design 3** - React Native Paper components
- **Gradient Backgrounds** - Beautiful linear gradients
- **Smooth Animations** - React Native Reanimated
- **Responsive Design** - Works on phones and tablets
- **Dark/Light Themes** - Consistent theming throughout

## 🛠️ Technology Stack

- **Expo SDK 54** - React Native development platform
- **TypeScript** - Type-safe development
- **React Navigation** - Screen navigation
- **React Native Paper** - Material Design components
- **Expo LocalAuthentication** - Biometric authentication
- **Expo SecureStore** - Secure data storage
- **Expo Crypto** - Cryptographic functions
- **Axios** - HTTP client for API calls
- **React Context** - State management

## 📱 Platform Support

- **iOS** - Face ID, Touch ID support
- **Android** - Fingerprint, Face unlock support
- **Web** - Fallback authentication (development)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voting-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Backend Integration

The app connects to the secure voting backend API:

- **Backend URL**: `http://localhost:3000/api/voting`
- **Endpoints**: Registration, voting, results, admin
- **Authentication**: Public/private key cryptography
- **Security**: Zero-knowledge proofs, vote hashing

## 📱 App Screens

### 1. Splash Screen
- App initialization
- Authentication status check
- Beautiful loading animation

### 2. Fingerprint Authentication
- Real biometric authentication
- Device compatibility check
- Fallback options

### 3. User Name Input
- New user registration
- Existing user login
- User data validation

### 4. Voting Interface
- Candidate selection
- Vote confirmation
- Real-time validation

### 5. Results Display
- Live vote counts
- Percentage calculations
- Winner announcement
- Statistics dashboard

### 6. Admin Panel
- User management
- Vote monitoring
- Data export
- System statistics

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:3000/api/voting
```

### App Configuration
Update `app.json` for:
- App name and branding
- Platform-specific permissions
- Biometric authentication settings

## 🚀 Building for Production

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

### Web Build
```bash
expo build:web
```

## 🔒 Security Features

- **Biometric Authentication** - Real fingerprint/Face ID
- **Secure Storage** - Encrypted local data storage
- **Cryptographic Hashing** - Vote data integrity
- **Digital Signatures** - Vote authenticity
- **Zero-Knowledge Proofs** - Privacy preservation
- **Session Management** - Secure user sessions

## 📊 Data Management

- **Local Storage** - Expo SecureStore for sensitive data
- **JSON Format** - Structured data storage
- **User Profiles** - Complete user information
- **Vote Records** - Immutable vote history
- **Statistics** - Real-time analytics

## 🎯 Key Features

### Real Fingerprint Scanning
- Uses actual device biometric sensors
- No simulation or mock authentication
- Platform-specific optimizations
- Graceful error handling

### Beautiful UI
- Material Design 3 components
- Smooth animations and transitions
- Gradient backgrounds
- Responsive layouts

### Comprehensive Admin
- Real-time monitoring
- User management
- Data export capabilities
- System statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- Multi-language support
- Advanced analytics
- Offline voting capability
- Blockchain integration
- Advanced biometric options
- Real-time notifications

---

**Built with ❤️ using Expo React Native**
