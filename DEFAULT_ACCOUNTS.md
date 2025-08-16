# Default Test Accounts - LokalHunt Platform

This document provides information about the default test accounts created for each role in the LokalHunt platform.

## Quick Access Credentials

### 🔧 Super Admin
- **Email**: `admin@lokalhunt.com`
- **Password**: `admin123`
- **Capabilities**: 
  - Full platform oversight
  - User management across all roles
  - System configuration
  - Master data management

### 🏢 Branch Admin
- **Email**: `admin.mumbai@lokalhunt.com`
- **Password**: `admin123`
- **City**: Mumbai
- **Capabilities**:
  - City-specific operations
  - Job ad approval workflow
  - Candidate screening and rating
  - MOU management with employers
  - Performance analytics

### 🏭 Employer
- **Email**: `employer@techcorp.com`
- **Password**: `employer123`
- **Company**: TechCorp Solutions
- **Status**: Verified ✅
- **City**: Mumbai
- **Capabilities**:
  - Job posting (with MOU requirement)
  - Candidate search and filtering
  - Candidate bookmarking
  - Application management
  - MOU creation and management

### 👤 Candidate
- **Email**: `candidate@example.com`
- **Password**: `candidate123`
- **Name**: John Doe
- **City**: Mumbai
- **Status**: Active Profile
- **Capabilities**:
  - Profile management
  - Job search and application
  - Job bookmarking
  - Application tracking
  - Dashboard analytics

## Database Overview

- **Total Users**: 16 accounts
- **Candidates**: 6 (including the default test account)
- **Employers**: 4 (including the default test account)
- **Branch Admins**: 5 (covering major cities)
- **Super Admins**: 1

## Additional Existing Accounts

The platform also includes additional test accounts from the original seed data:

### Branch Admins by City
- Mumbai: `admin.mumbai@lokalhunt.com`
- Delhi: `admin.delhi@lokalhunt.com`
- Bangalore: `admin.bangalore@lokalhunt.com`
- Pune: `admin.pune@lokalhunt.com`
- Hyderabad: `admin.hyderabad@lokalhunt.com`

### Additional Test Accounts
- **Employers**: `employer1@company.com`, `employer2@company.com`, `employer3@company.com` (password: `employer123`)
- **Candidates**: `candidate1@example.com` through `candidate5@example.com` (password: `candidate123`)

## Authentication Flow

1. Navigate to the appropriate login page:
   - Candidates: `/candidate/login`
   - Other roles: Use the main login with role selection

2. Use any of the above credentials to test role-specific functionality

3. Each role has access to different parts of the platform based on their permissions

## Testing Scenarios

### For Candidates
- Login with `candidate@example.com` / `candidate123`
- Test profile completion
- Browse and apply for jobs
- Manage bookmarks and applications

### For Employers
- Login with `employer@techcorp.com` / `employer123`
- Search and bookmark candidates
- Post new job ads (requires MOU)
- Manage company profile

### For Branch Admins
- Login with `admin.mumbai@lokalhunt.com` / `admin123`
- Approve pending job ads
- Screen and rate candidates
- Manage city-specific operations

### For Super Admins
- Login with `admin@lokalhunt.com` / `admin123`
- Oversee platform operations
- Manage user accounts
- Access system-wide analytics

## Security Notes

- All passwords are hashed using bcrypt with 12 salt rounds
- Default passwords should be changed in production
- JWT tokens are used for session management
- Role-based access control is enforced at API level

---

**Last Updated**: August 2025
**Database Status**: All accounts verified and functional
**Testing Status**: Full authentication flow operational