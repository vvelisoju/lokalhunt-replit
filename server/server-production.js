
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Import your existing server setup
const apiRoutes = require('./routes');

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', apiRoutes);

// Serve static files from client build
if (process.env.REPLIT_DEPLOYMENT) {
  // Serve static files with caching headers
  app.use(express.static(path.join(__dirname, '../client/dist'), {
    maxAge: '1d',
    etag: true
  }));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
