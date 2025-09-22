import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import votingRoutes from './api/routes/voting';
import docsRoutes from './api/routes/docs';
import { initializeSupabase } from './services/supabaseService';

// Load environment variables
dotenv.config();

// Initialize Supabase
const supabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  anonKey: process.env.SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  console.error('❌ Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.');
  process.exit(1);
}

const supabaseService = initializeSupabase(supabaseConfig);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false // Set to true if you need to send cookies
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/voting', votingRoutes);
app.use('/api/docs', docsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Secure Voting Backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Secure Voting System Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      voting: '/api/voting',
      documentation: '/api/docs'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Secure Voting Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗳️  Voting API: http://localhost:${PORT}/api/voting`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});

export default app;
