
# LokalHunt - Role-wise Functionality Testing Guide

## Overview
This document provides comprehensive testing guidelines for all user roles in the LokalHunt platform. The platform serves three main user types: Candidates, Employers, and Branch Admins, each with distinct functionalities and access levels.

## Table of Contents
1. [Common/Public Features](#commonpublic-features)
2. [Candidate Role Testing](#candidate-role-testing)
3. [Employer Role Testing](#employer-role-testing)
4. [Branch Admin Role Testing](#branch-admin-role-testing)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Test Data Requirements](#test-data-requirements)
7. [Mobile App Testing](#mobile-app-testing)

---

## Common/Public Features

### 1. Landing Page (`/`)
- **Components to Test:**
  - Hero section with job search filters
  - Featured jobs display
  - Platform statistics (jobs, companies, candidates, cities)
  - Testimonials section
  - Footer with links

- **Test Cases:**
  - Verify responsive design across devices
  - Test job search functionality from landing page
  - Validate statistics accuracy
  - Check all navigation links
  - Test form submissions

### 2. Authentication System
- **Registration Flow:**
  - Phone/Email based registration
  - OTP verification (SMS/Email)
  - Password setup
  - Role selection (Candidate/Employer)
  - City selection

- **Login Flow:**
  - Phone/Email + Password authentication
  - Role-based redirection
  - JWT token handling
  - Session persistence

- **Password Reset:**
  - Forgot password via email
  - Forgot password via mobile (OTP)
  - Password reset with OTP verification

- **Test Cases:**
  - Valid/Invalid registration data
  - OTP expiry and resend functionality
  - Password strength validation
  - Account verification flows
  - Cross-platform login consistency

### 3. Public Job Search (`/jobs`)
- **Features:**
  - Job listing with filters (city, category, experience)
  - Job detail view
  - Pagination
  - Search functionality
  - Sort options (newest, oldest, salary)

- **Test Cases:**
  - Filter combinations
  - Search accuracy
  - Job detail information completeness
  - Pagination functionality
  - Mobile responsiveness

---

## Candidate Role Testing

### 1. Dashboard (`/candidate/dashboard`)
- **Components:**
  - Profile completion status
  - Application statistics
  - Recent job recommendations
  - Quick actions (apply, bookmark)

- **Test Cases:**
  - Profile completion percentage calculation
  - Statistics accuracy (applications, bookmarks)
  - Job recommendations relevance
  - Quick action functionality

### 2. Profile Management (`/candidate/profile`)
- **Features:**
  - Personal information editing
  - Experience management
  - Education details
  - Skills and certifications
  - Job preferences
  - Resume upload

- **Modals to Test:**
  - EditProfileModal.jsx
  - EditAboutModal.jsx
  - EditExperienceModal.jsx
  - EditEducationModal.jsx
  - EditSkillsModal.jsx
  - EditSkillsWithExperienceModal.jsx
  - EditPreferencesModal.jsx

- **Test Cases:**
  - All form validations
  - File upload (resume) - size limits, format validation
  - Data persistence across sessions
  - Modal functionality and UX
  - Profile picture upload

### 3. LinkedIn-style Profile (`/candidate/profile/linkedin`)
- **Features:**
  - Professional profile display
  - Open to work status toggle
  - Skills showcase
  - Experience timeline
  - Education history
  - Downloadable/printable format

- **Test Cases:**
  - Profile data accuracy
  - Open to work toggle functionality
  - Print/export functionality
  - Mobile responsive design
  - Social sharing capabilities

### 4. Job Applications (`/candidate/applications`)
- **Features:**
  - Application history
  - Status tracking (Applied, Screened, Hired, Rejected)
  - Application details view
  - Withdrawal functionality

- **Test Cases:**
  - Application status updates
  - Data accuracy
  - Status filter functionality
  - Application timeline
  - Notification integration

### 5. Job Search & Apply (`/candidate/jobs`)
- **Features:**
  - Advanced job filtering
  - Job bookmarking
  - Quick apply functionality
  - Job recommendations
  - Application tracking

- **Test Cases:**
  - Apply button states (applied/not applied)
  - Bookmark functionality
  - Filter persistence
  - Application submission
  - Duplicate application prevention

### 6. Bookmarks (`/candidate/bookmarks`)
- **Features:**
  - Saved jobs management
  - Remove bookmarks
  - Apply from bookmarks
  - Bookmark organization

- **Test Cases:**
  - Add/remove bookmark functionality
  - Bookmark persistence
  - Apply from bookmark flow
  - Empty state handling

### 7. Notifications (`/candidate/notifications`)
- **Features:**
  - Application updates
  - Job recommendations
  - Profile views
  - System notifications
  - Push notification settings

- **Notification Types:**
  - JOB_ALERT
  - APPLICATION_UPDATE
  - PROFILE_VIEWED
  - WELCOME
  - JOB_BOOKMARKED

- **Test Cases:**
  - Real-time notifications
  - Mark as read/unread
  - Notification history
  - Push notification delivery
  - Notification preferences

### 8. Onboarding Process
- **Steps:**
  1. Basic Information (BasicInfoStep.jsx)
  2. Job Preferences (JobPreferencesStep.jsx)
  3. Skills & Experience (SkillsExperienceStep.jsx)
  4. Final Setup (FinalSetupStep.jsx)

- **Test Cases:**
  - Step-by-step navigation
  - Data validation at each step
  - Progress tracking
  - Skip functionality
  - Data persistence between steps

---

## Employer Role Testing

### 1. Dashboard (`/employer/dashboard`)
- **Features:**
  - Job posting statistics
  - Application metrics
  - Recent applications
  - Quick actions (post job, view candidates)

- **Test Cases:**
  - Metrics accuracy
  - Real-time data updates
  - Quick action functionality
  - Performance with large datasets

### 2. Job Management (`/employer/ads`)
- **Features:**
  - Create new job postings
  - Edit existing jobs
  - Job status management (Draft, Active, Paused, Closed)
  - Job performance analytics
  - Duplicate job functionality

- **Job Form Fields:**
  - Title, description, requirements
  - Salary range, job type
  - Experience level
  - Skills required
  - Application deadline
  - Number of vacancies

- **Test Cases:**
  - Form validation for all fields
  - Job posting workflow
  - Status change functionality
  - Job analytics accuracy
  - SEO-friendly job URLs

### 3. Candidate Management (`/employer/candidates`)
- **Features:**
  - Candidate search and filtering
  - Profile viewing
  - Application status management
  - Candidate communication
  - Shortlisting functionality

- **Test Cases:**
  - Search functionality accuracy
  - Filter combinations
  - Profile view permissions
  - Status update workflow
  - Communication tracking

### 4. Applications per Job (`/employer/ads/:id/candidates`)
- **Features:**
  - Application management for specific jobs
  - Candidate screening interface
  - Status updates (Screened, Shortlisted, Hired, Rejected)
  - Bulk actions
  - Application timeline

- **Test Cases:**
  - Application list accuracy
  - Status update functionality
  - Bulk operation performance
  - Timeline accuracy
  - Notification triggers

### 5. Company Management (`/employer/companies`)
- **Features:**
  - Multiple company profiles
  - Company information editing
  - Logo upload
  - Default company selection
  - Company verification status

- **Test Cases:**
  - Company creation/editing
  - Logo upload functionality
  - Default company selection
  - Multi-company management
  - Verification process

### 6. Premium Candidates (`/employer/premium-candidates`)
- **Features:**
  - Access to premium candidate profiles
  - Advanced search filters
  - Contact information access
  - Subscription-based access

- **Test Cases:**
  - Subscription validation
  - Premium feature access
  - Contact information display
  - Search functionality
  - Access restrictions for non-premium users

### 7. MOU Management (`/employer/mou`)
- **Features:**
  - View active MOUs
  - MOU terms and conditions
  - Fee structure display
  - MOU status tracking

- **Test Cases:**
  - MOU data accuracy
  - Fee calculation
  - Status updates
  - Document viewing

### 8. Subscription Management (`/employer/subscription`)
- **Available Plans:**
  - Self-Service (Basic)
  - Standard
  - Premium
  - Enterprise

- **Features:**
  - Plan comparison
  - Upgrade/downgrade functionality
  - Payment processing
  - Usage tracking
  - Feature limitations

- **Test Cases:**
  - Plan feature enforcement
  - Payment flow
  - Usage limit validation
  - Upgrade/downgrade process
  - Billing accuracy

---

## Branch Admin Role Testing

### 1. Dashboard (`/branch-admin/dashboard`)
- **KPI Cards:**
  - Total applications this month
  - Applications screened
  - Pending ad approvals
  - Active MOUs in city

- **Recent Activities:**
  - Application submissions
  - Ad approvals
  - Candidate allocations

- **Test Cases:**
  - KPI calculation accuracy
  - Real-time data updates
  - City-specific filtering
  - Performance metrics

### 2. Employer Management (`/branch-admin/employers`)
- **Features:**
  - Employer list with filtering
  - Employer detail view
  - Company management
  - MOU oversight
  - Activity tracking

- **Employer Details Tabs:**
  - Overview (OverviewTab.jsx)
  - Companies (CompaniesTab.jsx)
  - Job Ads (JobAdsTab.jsx)
  - MOUs (MousTab.jsx)
  - Allocations (AllocationsTab.jsx)

- **Test Cases:**
  - Employer search and filtering
  - Detail view navigation
  - Tab functionality
  - Data accuracy across tabs
  - Permission validations

### 3. Ad Approvals (`/branch-admin/ads-approvals`)
- **Features:**
  - Pending ad review queue
  - Ad approval/rejection workflow
  - Bulk approval actions
  - Approval comments/feedback
  - Ad modification requests

- **Test Cases:**
  - Approval workflow
  - Rejection with feedback
  - Bulk operations
  - Notification triggers
  - Status change tracking

### 4. Candidate Screening (`/branch-admin/screening`)
- **Features:**
  - Application review interface
  - Candidate rating system
  - Screening comments
  - Application forwarding to employers
  - Bulk screening actions

- **Screening Workflow:**
  - APPLIED → SCREENED → ALLOCATED

- **Test Cases:**
  - Screening workflow
  - Rating system functionality
  - Comment system
  - Status progression
  - Allocation process

### 5. MOU Management (`/branch-admin/mou`)
- **Features:**
  - Create new MOUs
  - MOU approval workflow
  - Fee structure setup
  - Term management
  - MOU status tracking

- **Test Cases:**
  - MOU creation process
  - Approval workflow
  - Fee calculation setup
  - Status management
  - Document generation

### 6. Reports (`/branch-admin/reports`)
- **Report Types:**
  - Application statistics
  - Ad approval metrics
  - Candidate allocation reports
  - Revenue reports
  - Performance analytics

- **Test Cases:**
  - Report generation accuracy
  - Date range filtering
  - Export functionality
  - Data visualization
  - Performance with large datasets

### 7. Activity Logs (`/branch-admin/logs`)
- **Features:**
  - System activity tracking
  - User action logs
  - Audit trail
  - Log filtering and search
  - Export capabilities

- **Test Cases:**
  - Log accuracy and completeness
  - Search functionality
  - Filter combinations
  - Export functionality
  - Performance optimization

### 8. Create Employer (`/branch-admin/create-employer`)
- **Features:**
  - New employer registration
  - Company setup
  - Initial MOU creation
  - Account activation
  - Welcome notifications

- **Test Cases:**
  - Registration workflow
  - Data validation
  - Account creation process
  - Initial setup completion
  - Notification delivery

---

## API Endpoints Reference

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset with OTP
- `GET /api/auth/profile` - Get user profile

### Candidate Endpoints
- `GET /api/candidate/profile` - Get candidate profile
- `PUT /api/candidate/profile` - Update candidate profile
- `GET /api/candidate/applications` - Get applications
- `POST /api/candidate/apply/:jobId` - Apply for job
- `GET /api/candidate/bookmarks` - Get bookmarked jobs
- `POST /api/candidate/bookmark/:jobId` - Bookmark job
- `GET /api/candidate/dashboard/stats` - Dashboard statistics

### Employer Endpoints
- `GET /api/employers/dashboard/stats` - Dashboard statistics
- `GET /api/employers/ads` - Get job listings
- `POST /api/employers/ads` - Create job posting
- `PUT /api/employers/ads/:id` - Update job posting
- `GET /api/employers/ads/:id/candidates` - Get job applications
- `PUT /api/employers/applications/:id/status` - Update application status
- `GET /api/employers/companies` - Get companies
- `POST /api/employers/companies` - Create company

### Branch Admin Endpoints
- `GET /api/branch-admins/dashboard/stats` - Dashboard statistics
- `GET /api/branch-admins/employers` - Get employers list
- `GET /api/branch-admins/ads/pending` - Pending ad approvals
- `PUT /api/branch-admins/ads/:id/approve` - Approve ad
- `GET /api/branch-admins/screening/applications` - Applications for screening
- `PUT /api/branch-admins/applications/:id/screen` - Screen application

### Public Endpoints
- `GET /api/public/jobs` - Public job search
- `GET /api/public/cities` - Get cities list
- `GET /api/public/categories` - Get job categories
- `GET /api/public/stats` - Platform statistics

---

## Test Data Requirements

### User Accounts for Testing
```
Branch Admin:
- Email: admin@test.com
- Phone: +919999999999
- City: Hyderabad

Employer:
- Email: employer@test.com  
- Phone: +918888888888
- Company: Test Company Ltd

Candidate:
- Email: candidate@test.com
- Phone: +917777777777
- Skills: JavaScript, React, Node.js
```

### Job Categories
- Administrative & Clerk Roles
- Banking & Office Staff
- Cook / Chef / Kitchen Staff
- Delivery & Courier
- Engineering & Technical
- IT & Computer Operator
- Medical & Healthcare Support
- Teacher / Trainer / Tutor

### Job Roles (Local & Tech)
**Local Jobs:**
- Delivery Driver
- Sales Executive
- Customer Support
- Retail Associate
- Food Service
- Security Guard
- Electrician
- Data Entry Operator

**Tech Jobs:**
- Software Developer
- Web Developer
- Mobile App Developer
- UI/UX Designer
- Data Analyst
- Digital Marketing
- System Administrator

### Cities (Telangana & Andhra Pradesh)
- Hyderabad, Telangana
- Vijayawada, Andhra Pradesh
- Warangal, Telangana
- Guntur, Andhra Pradesh
- Karimnagar, Telangana

---

## Mobile App Testing

### Capacitor Integration
- **Platform Support:** Android, iOS
- **Features to Test:**
  - Push notifications
  - File uploads (resume, photos)
  - Camera integration
  - Offline functionality
  - App store deployment

### Push Notifications
- **Types:**
  - Job alerts
  - Application updates
  - Profile views
  - Welcome notifications
  - System announcements

- **Test Cases:**
  - Notification delivery
  - Deep linking
  - Notification history
  - Settings management
  - Platform-specific behavior

### Mobile-Specific Features
- **Safe Area Management:**
  - Notch/dynamic island handling
  - Navigation gesture areas
  - Keyboard avoidance
  - Orientation changes

- **Performance:**
  - App launch time
  - Memory usage
  - Battery consumption
  - Network optimization
  - Offline capabilities

---

## Testing Environment Setup

### Prerequisites
1. Node.js environment
2. Database access (PostgreSQL)
3. Test data seeded
4. SMS/Email service configured
5. File upload storage configured

### Test Execution
1. **Unit Testing:** Component-level testing
2. **Integration Testing:** API endpoint testing
3. **E2E Testing:** Complete user workflows
4. **Performance Testing:** Load and stress testing
5. **Security Testing:** Authentication and authorization
6. **Mobile Testing:** Device-specific functionality

### Key Testing Areas
1. **Authentication flows**
2. **Role-based access control**
3. **Data validation and integrity**
4. **File upload functionality**
5. **Real-time notifications**
6. **Payment processing**
7. **Search and filtering**
8. **Mobile responsiveness**
9. **Performance optimization**
10. **Security vulnerabilities**

This document should serve as a comprehensive guide for testing all aspects of the LokalHunt platform across different user roles and scenarios.
