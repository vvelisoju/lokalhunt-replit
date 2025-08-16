# Lokalhunt Project Structure

## Overview
The project has been reorganized into a clean monorepo structure with separated client and server directories.

## Directory Structure

```
workspace/
├── client/                     # React Frontend Application
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable React components
│   │   │   ├── common/        # Generic components (JobCard, LoadingSpinner, etc.)
│   │   │   ├── forms/         # Form components (SearchFilter, etc.)
│   │   │   └── layout/        # Layout components (Header, Footer, Layout)
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── Login.jsx      # User authentication
│   │   │   ├── Register.jsx   # User registration
│   │   │   ├── Jobs.jsx       # Job listings
│   │   │   ├── JobDetail.jsx  # Individual job details
│   │   │   ├── Dashboard.jsx  # User dashboard
│   │   │   ├── Profile.jsx    # User profile management
│   │   │   └── NotFound.jsx   # 404 error page
│   │   ├── services/          # API service functions
│   │   │   ├── api.js         # Axios configuration and interceptors
│   │   │   ├── authService.js # Authentication API calls
│   │   │   └── jobService.js  # Job-related API calls
│   │   ├── context/           # React Context providers
│   │   │   └── AuthContext.jsx # Authentication state management
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useApi.js      # API call and pagination hooks
│   │   ├── utils/             # Utility functions
│   │   │   ├── constants.js   # Application constants
│   │   │   └── helpers.js     # Helper functions
│   │   └── styles/            # CSS files
│   │       └── index.css      # Tailwind CSS imports and custom styles
│   ├── public/                # Static assets
│   ├── index.html             # HTML entry point
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── postcss.config.js      # PostCSS configuration
│   ├── .eslintrc.js           # ESLint configuration for client
│   └── package.json           # Client dependencies and scripts
│
├── server/                     # Express.js Backend API
│   ├── controllers/           # Request handlers
│   │   ├── authController.js  # Authentication logic
│   │   ├── candidateController.js # Candidate operations
│   │   ├── employerController.js  # Employer operations
│   │   ├── branchAdminController.js # Branch admin operations
│   │   └── adController.js    # Advertisement management
│   ├── routes/                # API route definitions
│   │   ├── authRoutes.js      # Authentication routes
│   │   ├── candidateRoutes.js # Candidate API routes
│   │   ├── employerRoutes.js  # Employer API routes
│   │   ├── branchAdminRoutes.js # Branch admin API routes
│   │   ├── adRoutes.js        # Advertisement routes
│   │   └── index.js           # Route aggregation
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── errorHandler.js    # Global error handling
│   ├── utils/                 # Utility functions
│   │   └── response.js        # Response formatting utilities
│   ├── prisma/                # Database schema and configuration
│   │   └── schema.prisma      # Prisma schema definition
│   ├── docs/                  # API documentation
│   │   ├── CANDIDATE_API.md   # Candidate API documentation
│   │   ├── EMPLOYER_API.md    # Employer API documentation
│   │   └── BRANCH_ADMIN_API.md # Branch admin API documentation
│   ├── scripts/               # Database and utility scripts
│   │   └── seed.js            # Database seeding script
│   ├── server.js              # Express server entry point
│   ├── .env                   # Environment variables
│   ├── .eslintrc.js           # ESLint configuration for server
│   └── package.json           # Server dependencies and scripts
│
├── README.md                   # Project overview and setup instructions
├── PROJECT_STRUCTURE.md       # This file - detailed structure explanation
├── replit.md                  # Replit-specific configuration and history
└── attached_assets/           # Project documentation and requirements
```

## Development Workflows

### Server (Backend) - Port 5000
- **Command**: `cd server && node server.js`
- **Technologies**: Express.js, PostgreSQL, Prisma ORM, JWT
- **Features**: RESTful API, role-based authentication, database operations

### Client (Frontend) - Port 3000
- **Command**: `cd client && npx vite`
- **Technologies**: React 19, Vite, Tailwind CSS, React Router, Axios
- **Features**: Responsive UI, protected routes, API integration, state management

## Key Features

### Separated Concerns
- **Frontend**: Pure React application with modern tooling
- **Backend**: Express.js API server with database integration
- **Communication**: API proxy configuration for seamless development

### Development Experience
- **Hot Reload**: Both client and server support hot reloading
- **TypeScript Ready**: Project structure supports TypeScript migration
- **Modular Architecture**: Clean separation of components, services, and utilities

### Production Ready
- **Build Process**: Optimized Vite build for production deployment
- **Environment Configuration**: Separate environment handling for client/server
- **Database Integration**: Prisma ORM with PostgreSQL for robust data management

## Getting Started

1. **Install Dependencies**: Use the Replit package manager or run npm install in each directory
2. **Environment Setup**: Ensure database credentials are configured in server/.env
3. **Start Development**: Both workflows are configured and running automatically
4. **API Testing**: Server provides comprehensive REST API documented in server/docs/

## Configuration Updates

### Fixed ES Module Issues
- Updated PostCSS and Tailwind configs to use ES module syntax (export default)
- Separated ESLint configurations for client and server environments
- Maintained compatibility with modern JavaScript standards

### Dependency Management
- Cleaned up root-level node_modules and package files
- Organized dependencies by service (client vs server)
- Proper dependency installation and Prisma client generation

## Migration Notes

- Moved from root-level frontend files to organized client/ directory
- Separated backend files into server/ directory with dedicated package.json
- Moved scripts folder to server directory for database operations
- Updated proxy configuration to maintain API communication
- Maintained all existing functionality while improving project organization