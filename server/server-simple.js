const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Mock database for testing
let users = [];
let applications = [];
let bookmarks = [];

// CORS configuration with enhanced preflight support
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://0.0.0.0:3000',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://0.0.0.0:5000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(null, true); // Allow for testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Basic endpoints
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Lokalhunt API Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is healthy',
    cors: 'enabled',
    endpoints: ['auth', 'candidates', 'jobs']
  });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      phone,
      city,
      passwordHash,
      role: 'CANDIDATE',
      createdAt: new Date().toISOString()
    };
    
    users.push(user);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          city: user.city,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          city: user.city,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed', 
      error: error.message 
    });
  }
});

// Candidate Routes
app.get('/api/candidates/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      bio: user.bio || null,
      experience: user.experience || null,
      skills: user.skills || [],
      education: user.education || null,
      resume: user.resume || null
    }
  });
});

app.put('/api/candidates/profile', authenticateToken, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.userId);
  if (userIndex === -1) {
    return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
  }

  // Update user
  users[userIndex] = { ...users[userIndex], ...req.body };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: users[userIndex]
  });
});

app.get('/api/candidates/profile/completion', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ 
      success: false,
      message: 'User not found' 
    });
  }

  const completionFields = ['firstName', 'lastName', 'email', 'phone', 'city', 'bio', 'experience', 'skills'];
  const completedFields = completionFields.filter(field => user[field] && user[field].length > 0);
  const percentage = Math.round((completedFields.length / completionFields.length) * 100);

  res.json({
    success: true,
    data: {
      percentage,
      completedFields: completedFields.length,
      totalFields: completionFields.length,
      missingFields: completionFields.filter(field => !user[field] || user[field].length === 0)
    }
  });
});

app.get('/api/candidates/applications', authenticateToken, (req, res) => {
  const userApplications = applications.filter(app => app.candidateId === req.user.userId);
  res.json({
    success: true,
    data: userApplications,
    total: userApplications.length
  });
});

app.get('/api/candidates/bookmarks', authenticateToken, (req, res) => {
  const userBookmarks = bookmarks.filter(b => b.candidateId === req.user.userId);
  res.json({
    success: true,
    data: userBookmarks,
    total: userBookmarks.length
  });
});

app.get('/api/candidates/dashboard/stats', authenticateToken, (req, res) => {
  const userApplications = applications.filter(app => app.candidateId === req.user.userId);
  const userBookmarks = bookmarks.filter(b => b.candidateId === req.user.userId);
  
  res.json({
    success: true,
    data: {
      applications: userApplications.length,
      bookmarks: userBookmarks.length,
      profileViews: Math.floor(Math.random() * 100),
      messageCount: Math.floor(Math.random() * 10)
    }
  });
});

app.get('/api/jobs', (req, res) => {
  const sampleJobs = [
    {
      id: 'job-1',
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Test City',
      type: 'FULL_TIME',
      salary: '$50,000 - $70,000',
      description: 'Looking for a skilled frontend developer'
    },
    {
      id: 'job-2', 
      title: 'Backend Developer',
      company: 'StartupXYZ',
      location: 'Test City',
      type: 'FULL_TIME',
      salary: '$60,000 - $80,000',
      description: 'Backend developer position available'
    }
  ];
  
  res.json({
    success: true,
    data: sampleJobs,
    total: sampleJobs.length
  });
});

app.get('/api/skills', (req, res) => {
  const skills = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'TypeScript'];
  res.json({
    success: true,
    data: skills
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('CORS enabled for frontend connections');
  console.log('Database connected successfully (mock mode)');
});

module.exports = app;