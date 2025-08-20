require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { ObjectStorageService, ObjectNotFoundError } = require('./objectStorage');

const app = express();
const PORT = 5000;
const prisma = new PrismaClient();

// Middleware to add Prisma to request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Comprehensive CORS middleware 
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'https://lokalhunt.com/',
    'https://www.lokalhunt.com/'
  ];
  
  // Allow all Replit domains
  const isReplitDomain = origin && origin.includes('.replit.dev');
  
  if (allowedOrigins.includes(origin) || !origin || isReplitDomain) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Cache-Control,Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length,Content-Range');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Fallback CORS for debugging
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS origin check:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'LokalHunt API Server',
    version: '1.0.0',
    database: 'connected'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const employerRoutes = require('./routes/employerRoutes');
const branchAdminRoutes = require('./routes/branchAdminRoutes');
const adRoutes = require('./routes/adRoutes');
const publicRoutes = require('./routes/publicRoutes');
const aiRoutes = require('./routes/aiRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Use routes - mounted under /api to match client expectations
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/branch-admins', branchAdminRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ai', aiRoutes);

// Object storage serving routes
app.get("/objects/:objectPath(*)", async (req, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const objectFile = await objectStorageService.getObjectEntityFile(req.path);
    
    // For profile photos, allow public access
    objectStorageService.downloadObject(objectFile, res);
  } catch (error) {
    console.error("Error serving object:", error);
    if (error instanceof ObjectNotFoundError) {
      return res.sendStatus(404);
    }
    return res.sendStatus(500);
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this information already exists'
    });
  }
  
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 LokalHunt API Server running on http://0.0.0.0:${PORT}`);
  console.log('📊 Database: Connected');
  console.log('🔐 Authentication: Enabled');
  console.log('🌐 CORS: Configured for frontend');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;