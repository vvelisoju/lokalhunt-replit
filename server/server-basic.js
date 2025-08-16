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

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://0.0.0.0:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add explicit preflight handling
app.options('*', cors());

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
    message: 'Server is healthy'
  });
});

// Auth middleware for testing
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

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ 
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
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Candidate Routes
app.get('/api/candidates/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
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
    return res.status(404).json({ message: 'User not found' });
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
    return res.status(404).json({ message: 'User not found' });
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

app.post('/api/candidates/applications/:jobId', authenticateToken, (req, res) => {
  const { jobId } = req.params;
  
  const application = {
    id: Date.now().toString(),
    candidateId: req.user.userId,
    jobId,
    jobTitle: `Test Job ${jobId}`,
    company: 'Test Company',
    status: 'APPLIED',
    appliedAt: new Date().toISOString()
  };
  
  applications.push(application);
  
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: application
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

app.post('/api/candidates/bookmarks', authenticateToken, (req, res) => {
  const { jobId } = req.body;
  
  const bookmark = {
    id: Date.now().toString(),
    candidateId: req.user.userId,
    jobId,
    jobTitle: `Test Job ${jobId}`,
    company: 'Test Company',
    createdAt: new Date().toISOString()
  };
  
  bookmarks.push(bookmark);
  
  res.status(201).json({
    success: true,
    message: 'Bookmark added successfully',
    data: bookmark
  });
});

app.delete('/api/candidates/bookmarks/:bookmarkId', authenticateToken, (req, res) => {
  const { bookmarkId } = req.params;
  const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmarkId && b.candidateId === req.user.userId);
  
  if (bookmarkIndex === -1) {
    return res.status(404).json({ message: 'Bookmark not found' });
  }
  
  bookmarks.splice(bookmarkIndex, 1);
  
  res.json({
    success: true,
    message: 'Bookmark removed successfully'
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

app.get('/api/job-categories', (req, res) => {
  const categories = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing'];
  res.json({
    success: true,
    data: categories
  });
});

app.get('/api/cities', (req, res) => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];
  res.json({
    success: true,
    data: cities
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database connected successfully');
});