# Lokalhunt - City-Focused Job Portal

## Overview
Lokalhunt is a comprehensive city-focused job portal built with Express.js, PostgreSQL, and React. The platform implements a sophisticated multi-role architecture supporting Candidates, Employers, Branch Admins, and Super Admins.

## 📱 Mobile App & Push Notifications

This project now supports native Android and iOS apps using **Capacitor** with **Firebase Push Notifications**. The React web app can be deployed as native mobile apps with full push notification support.

## Tech Stack

### Backend
- **Express.js** - Web application framework
- **PostgreSQL** - Database with Prisma ORM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend  
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Heroicons** - Icon library

## Project Structure

```
workspace/
├── client/                    # React Frontend Application
│   ├── src/                  # React source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components  
│   │   ├── services/        # API service functions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Frontend utilities
│   │   ├── context/         # React context providers
│   │   └── styles/          # CSS files
│   ├── public/              # Static assets
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind configuration
│   ├── postcss.config.js    # PostCSS configuration
│   └── package.json         # Client dependencies
│
├── server/                   # Express.js Backend API
│   ├── controllers/         # API controllers
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── prisma/             # Database schema
│   ├── docs/               # API documentation
│   ├── server.js           # Express server entry point
│   ├── .env                # Environment variables
│   └── package.json        # Server dependencies
│
└── PROJECT_STRUCTURE.md     # Detailed structure documentation
```

## Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL database

### Environment Variables
Create a `.env` file with:
```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

### Installation & Development

1. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies  
   cd ../client && npm install
   ```

2. **Set up database:**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

3. **Start development servers:**
   
   Backend (Port 5000):
   ```bash
   cd server && npm start
   ```
   
   Frontend (Port 3000):
   ```bash
   cd client && npm run dev
   ```

The frontend is configured to proxy API requests to the backend, so both servers work together seamlessly.

## Key Features

### Multi-Role System
- **Candidates**: Profile management, job search, applications, bookmarks
- **Employers**: Company management, job posting, candidate search
- **Branch Admins**: City-specific oversight, job approval, candidate screening
- **Super Admins**: Platform management

### Universal Ad Framework
- Designed for Jobs (current) with expansion ready for Local Deals, Events, Classifieds
- Category-specific fields using JSON storage
- Quality control through Branch Admin approval

### Advanced Features
- JWT-based authentication with role-based access control
- Real-time job search with filters and pagination
- Candidate rating system with permanent skill assessments
- MOU-based commercial framework for employer relationships
- City-scoped operations for local focus
- Responsive design with Tailwind CSS

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Candidates
- `GET /api/candidate/ads/discover` - Browse jobs
- `POST /api/candidate/ads/:id/apply` - Apply to job
- `GET /api/candidate/applications` - View applications
- `POST /api/candidate/ads/:id/bookmark` - Bookmark job

### Complete API documentation available in `/docs` directory.

## Development Workflow

### Backend Development
1. Make changes to controllers, routes, or middleware
2. Server auto-restarts with nodemon
3. Test API endpoints with provided examples

### Frontend Development  
1. Edit React components in `/src`
2. Vite provides hot module replacement
3. Tailwind classes are processed automatically
4. API calls go through configured proxy

### Database Changes
1. Update Prisma schema in `/prisma/schema.prisma`
2. Run `npx prisma db push` to apply changes
3. Run `npx prisma generate` to update client

## 🚀 Mobile App Deployment (Capacitor)

### Prerequisites for Mobile Deployment
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Firebase project with Push Notifications enabled
- `firebase-service-account.json` file in `/server` directory

### Step-by-Step Mobile App Deployment

#### 1. Build the React App
```bash
# Build the React app for production
cd client && npm run build
```

#### 2. Sync with Capacitor
```bash
# Copy web assets to native projects (run from project root)
npx cap copy
```

#### 3. Open Native Projects
```bash
# Open Android project in Android Studio
npx cap open android

# Open iOS project in Xcode (macOS only)
npx cap open ios
```

#### 4. Configure Firebase Push Notifications

**Android Setup:**
1. Add your `google-services.json` to `android/app/`
2. Build and run from Android Studio

**iOS Setup:**  
1. Add your `GoogleService-Info.plist` to the iOS project in Xcode
2. Enable Push Notifications capability in Xcode
3. Build and run from Xcode

#### 5. Start the Backend Server
```bash
# Run the backend (required for API calls)
cd server && npm start
```

#### 6. Test Push Notifications
```javascript
// Example: Using the push utility in server
const { sendPushNotification } = require('./server/push.js')

// Send a test notification
await sendPushNotification(
  'device_token_from_mobile_app', 
  'Welcome to LokalHunt!', 
  'Your job portal is now mobile-ready!'
)
```

### 📱 Mobile App Features

#### Push Notification Integration
- **Automatic Registration**: App automatically requests push permissions on launch
- **Foreground Notifications**: Shows notifications while app is active
- **Background Notifications**: Handles tapped notifications when app is closed
- **Device Token Logging**: Tokens are logged to console for testing
- **Manual Registration**: "Register for Push" button for manual trigger

#### Native Features Available
- **Full React App**: Complete web app functionality in native wrapper
- **Native Navigation**: Proper mobile navigation and gestures  
- **Push Notifications**: Firebase Cloud Messaging integration
- **Device APIs**: Access to camera, storage, and other native features
- **Offline Capabilities**: Basic offline functionality (can be extended)

### 🔧 Development Workflow for Mobile

#### Making Changes to Mobile App
```bash
# 1. Make changes to React app in /client
# 2. Build the React app
cd client && npm run build

# 3. Sync changes to native projects  
npx cap copy

# 4. For live reload during development
npx cap run android --livereload-url=http://localhost:3000
npx cap run ios --livereload-url=http://localhost:3000
```

#### Testing Push Notifications
```bash
# 1. Run the app on device/emulator
# 2. Check console for device token
# 3. Use server push utility to send test notifications

# Example test from server:
node -e "
const { sendPushNotification } = require('./push.js');
sendPushNotification('YOUR_DEVICE_TOKEN', 'Test', 'Hello from LokalHunt!');
"
```

### 📋 Mobile App Checklist

- [ ] React app builds successfully (`npm run build`)
- [ ] Firebase service account file is in `/server/firebase-service-account.json`
- [ ] Capacitor platforms added (`npx cap add android ios`)
- [ ] Google services files added to native projects
- [ ] Push notification permissions requested in app
- [ ] Device token appears in console logs
- [ ] Backend server running and accessible
- [ ] Test push notification sent successfully

## Production Deployment

The application is ready for deployment with:
- Production build: `npx vite build`
- Optimized static assets in `/dist`
- Environment-based configuration
- Database migrations ready
- **Mobile Apps**: Native Android/iOS apps via Capacitor

## Contributing

1. Follow the existing code structure
2. Update documentation for API changes
3. Test both frontend and backend changes
4. Ensure responsive design works on all devices

## License

This project is licensed under the ISC License.