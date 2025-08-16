const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Comprehensive CORS middleware 
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000'
  ];
  
  if (allowedOrigins.includes(origin) || !origin) {
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

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Minimal server running',
    cors: 'enabled'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', cors: 'working' });
});

// Mock database
let users = [];
let applications = [];
let bookmarks = [];

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // Simple token validation for testing
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  console.log('Registration request received:', req.body);
  
  const { firstName, lastName, email, password, phone, city } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'All fields are required' 
    });
  }
  
  // Check existing user
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ 
      success: false,
      message: 'User already exists' 
    });
  }
  
  // Create user
  const user = {
    id: Date.now().toString(),
    firstName,
    lastName,
    email,
    phone,
    city,
    role: 'CANDIDATE',
    createdAt: new Date().toISOString()
  };
  
  users.push(user);
  
  // Create simple token
  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const token = 'header.' + Buffer.from(JSON.stringify(tokenPayload)).toString('base64') + '.signature';
  
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
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  }
  
  const tokenPayload = { userId: user.id, email: user.email, role: user.role };
  const token = 'header.' + Buffer.from(JSON.stringify(tokenPayload)).toString('base64') + '.signature';
  
  res.json({
    success: true,
    message: 'Login successful',
    data: { token, user }
  });
});

// Candidate endpoints
app.get('/api/candidates/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    success: true,
    data: user
  });
});

app.put('/api/candidates/profile', authenticateToken, (req, res) => {
  const userIndex = users.findIndex(u => u.id === req.user.userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users[userIndex] = { ...users[userIndex], ...req.body };
  
  res.json({
    success: true,
    message: 'Profile updated',
    data: users[userIndex]
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

// Additional candidate endpoints
app.get('/api/candidates/profile/completion', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const fields = ['firstName', 'lastName', 'email', 'phone', 'city', 'bio', 'experience', 'skills'];
  const completed = fields.filter(field => user[field] && user[field].length > 0);
  const percentage = Math.round((completed.length / fields.length) * 100);
  
  res.json({
    success: true,
    data: {
      percentage,
      completed: completed.length,
      total: fields.length,
      missing: fields.filter(field => !user[field] || user[field].length === 0)
    }
  });
});

app.get('/api/candidates/dashboard/stats', authenticateToken, (req, res) => {
  const userApplications = applications.filter(app => app.candidateId === req.user.userId);
  const userBookmarks = bookmarks.filter(b => b.candidateId === req.user.userId);
  
  res.json({
    success: true,
    data: {
      totalApplications: userApplications.length,
      pendingApplications: userApplications.filter(app => app.status === 'pending').length,
      rejectedApplications: userApplications.filter(app => app.status === 'rejected').length,
      interviewScheduled: userApplications.filter(app => app.status === 'interview').length,
      profileViews: Math.floor(Math.random() * 100),
      bookmarks: userBookmarks.length,
      profileCompletion: 75
    }
  });
});

app.post('/api/candidates/applications/:jobId', authenticateToken, (req, res) => {
  const { jobId } = req.params;
  const application = {
    id: Date.now().toString(),
    candidateId: req.user.userId,
    jobId,
    status: 'pending',
    appliedAt: new Date().toISOString(),
    job: {
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Mumbai'
    }
  };
  
  applications.push(application);
  
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully',
    data: application
  });
});

app.post('/api/candidates/bookmarks', authenticateToken, (req, res) => {
  const { jobId } = req.body;
  const bookmark = {
    id: Date.now().toString(),
    candidateId: req.user.userId,
    jobId,
    bookmarkedAt: new Date().toISOString(),
    job: {
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Mumbai'
    }
  };
  
  bookmarks.push(bookmark);
  
  res.status(201).json({
    success: true,
    message: 'Job bookmarked successfully',
    data: bookmark
  });
});

app.delete('/api/candidates/bookmarks/:bookmarkId', authenticateToken, (req, res) => {
  const { bookmarkId } = req.params;
  const index = bookmarks.findIndex(b => b.id === bookmarkId && b.candidateId === req.user.userId);
  
  if (index === -1) {
    return res.status(404).json({ 
      success: false,
      message: 'Bookmark not found' 
    });
  }
  
  bookmarks.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Bookmark removed successfully'
  });
});

app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    data: [
      { 
        id: 'job-1', 
        title: 'Frontend Developer', 
        company: 'Tech Corp',
        location: 'Mumbai',
        type: 'FULL_TIME',
        salary: '$50,000 - $70,000',
        description: 'Looking for a skilled frontend developer',
        requirements: ['React', 'JavaScript', 'CSS'],
        postedAt: new Date().toISOString()
      },
      { 
        id: 'job-2', 
        title: 'Backend Developer', 
        company: 'StartupXYZ',
        location: 'Delhi',
        type: 'FULL_TIME',
        salary: '$60,000 - $80,000',
        description: 'Backend developer position available',
        requirements: ['Node.js', 'Express', 'MongoDB'],
        postedAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/skills', (req, res) => {
  res.json({
    success: true,
    data: ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'MongoDB', 'TypeScript', 'Express', 'Vue.js']
  });
});

app.get('/api/cities', (req, res) => {
  res.json({
    success: true,
    data: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running on http://0.0.0.0:${PORT}`);
  console.log('CORS enabled for all origins');
});