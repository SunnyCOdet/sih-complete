# Secure Voting System Frontend

A React-based frontend for the secure voting system with fingerprint authentication, supporting BJP and Congress parties.

## Features

- **Fingerprint Authentication**: Simulated fingerprint scanning for voter verification
- **Party Selection**: Vote for BJP or Congress with visual party cards
- **Real-time Results**: Live voting results and statistics
- **Admin Panel**: System monitoring and voter management
- **Duplicate Prevention**: Ensures each fingerprint can only vote once
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:3000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

## Usage

### Voting Process

1. **Fingerprint Authentication**
   - Click "Start Fingerprint Scan"
   - Wait for simulated scanning process
   - System checks if fingerprint has already voted

2. **Party Selection**
   - Choose between BJP (🕉️) or Congress (✋)
   - Click on the party card to select
   - Confirm your vote

3. **Results Viewing**
   - View live results and statistics
   - See vote counts and percentages
   - Monitor system integrity

### Admin Features

- View all registered voters
- Monitor voting statistics
- Check blockchain integrity
- View tamper detection alerts

## Components

- **FingerprintAuth**: Handles fingerprint scanning and authentication
- **VotingInterface**: Party selection and vote submission
- **Results**: Live results display with statistics
- **AdminPanel**: System monitoring and management
- **Header**: Navigation and user status

## Services

- **VotingService**: API integration for voting operations
- **FingerprintService**: Fingerprint simulation and verification

## Security Features

- Fingerprint-based authentication
- Duplicate vote prevention
- Encrypted vote transmission
- Real-time tamper detection
- Blockchain integrity verification

## API Integration

The frontend integrates with the backend API endpoints:

- `POST /api/voting/register` - Voter registration
- `POST /api/voting/submit` - Vote submission
- `GET /api/voting/results` - Voting results
- `GET /api/voting/stats` - System statistics
- `GET /api/voting/voters` - Voter management

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3000/api/voting)
- `REACT_APP_TITLE`: Application title
- `REACT_APP_VERSION`: Application version

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx
│   ├── FingerprintAuth.tsx
│   ├── VotingInterface.tsx
│   ├── Results.tsx
│   └── AdminPanel.tsx
├── services/           # API services
│   ├── VotingService.ts
│   └── FingerprintService.ts
├── App.tsx            # Main app component
├── index.tsx          # Entry point
└── index.css          # Global styles
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE file for details.
