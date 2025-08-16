# Employer API Documentation

The Employer API provides comprehensive endpoints for employers to manage their profile, companies, job ads, MOUs, and candidate interactions in the Lokalhunt platform.

## Authentication

All endpoints require:
- `Authorization: Bearer <JWT_TOKEN>` header
- `EMPLOYER` role in the JWT token

## API Endpoints

### 🔧 Profile Management

#### GET /api/employer/profile
Get complete employer profile with analytics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "employer-uuid",
    "contactDetails": {...},
    "user": {...},
    "companies": [...],
    "mous": [...],
    "profileCompleteness": 85,
    "hasActiveCompanies": true,
    "hasActiveMOU": true,
    "_count": {
      "companies": 2,
      "ads": 5,
      "mous": 1
    }
  }
}
```

#### PUT /api/employer/profile
Update employer profile information.

**Request Body:**
```json
{
  "contactDetails": {
    "companyAddress": "123 Business St",
    "contactPerson": "HR Manager",
    "website": "https://company.com"
  }
}
```

### 🏢 Company Management

#### GET /api/employer/companies
List all companies owned by the employer.

#### GET /api/employer/companies/:companyId
Get detailed information about a specific company.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "company-uuid",
    "name": "TechCorp Inc",
    "description": "Leading technology company",
    "city": {...},
    "ads": [...],
    "_count": {
      "ads": 3
    }
  }
}
```

#### POST /api/employer/companies
Create a new company.

**Request Body:**
```json
{
  "name": "Company Name",
  "description": "Company description",
  "cityId": "city-uuid",
  "industry": "Technology",
  "size": "51-200",
  "website": "https://company.com"
}
```

#### PUT /api/employer/companies/:companyId
Update company information.

### 📋 Ad Management

#### GET /api/employer/ads
List all job ads posted by the employer.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by ad status
- `categoryName`: Filter by category

#### GET /api/employer/ads/:adId
Get detailed information about a specific ad with application statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "ad-uuid",
    "title": "Senior Developer",
    "company": {...},
    "location": {...},
    "allocations": [...],
    "applicationStats": {
      "total": 10,
      "applied": 3,
      "screened": 2,
      "allocated": 2,
      "shortlisted": 1,
      "hired": 1,
      "rejected": 1
    }
  }
}
```

#### POST /api/employer/ads
Create a new job ad (requires active MOU).

#### GET /api/employer/ads/:adId/candidates
Get allocated candidates for a specific ad.

### 📄 MOU Management

#### GET /api/employer/mous
List all MOU agreements.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status ('active' or all)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "mou-uuid",
      "feeType": "PERCENTAGE",
      "feeValue": "15",
      "terms": "Standard terms...",
      "status": "APPROVED",
      "signedAt": "2025-08-14T04:24:20.700Z",
      "branchAdmin": {...}
    }
  ]
}
```

#### POST /api/employer/mous
Create a new MOU agreement.

**Request Body:**
```json
{
  "branchAdminId": "branch-admin-uuid",
  "feeType": "PERCENTAGE", // or "FIXED"
  "feeAmount": 5000, // for FIXED type
  "feePercentage": 15, // for PERCENTAGE type
  "terms": "Agreement terms...",
  "notes": "Additional notes"
}
```

### 👥 Candidate Search & Management

#### GET /api/employer/candidates
Search and filter candidates.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `skills`: Comma-separated skills (e.g., "JavaScript,React")
- `cityId`: Filter by city
- `minRating`: Minimum overall rating
- `excludeApplied`: Exclude candidates who already applied ('true'/'false')

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "candidate-uuid",
      "tags": ["JavaScript", "React"],
      "overallRating": "8.5",
      "user": {
        "name": "Candidate Name",
        "email": "candidate@example.com",
        "city": {...}
      },
      "_count": {
        "allocations": 2
      }
    }
  ]
}
```

#### POST /api/employer/candidates/:candidateId/bookmark
Bookmark a candidate for future reference.

**Request Body:**
```json
{
  "notes": "Excellent JavaScript skills, good for frontend role"
}
```

#### DELETE /api/employer/candidates/:candidateId/bookmark
Remove a candidate bookmark.

#### GET /api/employer/candidates/bookmarks
Get all bookmarked candidates.

### 🔄 Legacy Candidate Management

#### PUT /api/employer/candidates/:allocationId/status
Update candidate status in an allocation.

**Request Body:**
```json
{
  "status": "SHORTLISTED", // SHORTLISTED, HIRED, REJECTED
  "notes": "Great interview performance"
}
```

## Features

### 🎯 Advanced Search & Filtering
- **Skills-based search**: Find candidates by specific technical skills
- **Rating filters**: Filter by minimum overall rating
- **City targeting**: Search candidates in specific cities
- **Application exclusion**: Exclude candidates who already applied

### 📊 Analytics & Insights
- **Profile completeness scoring**: Track profile completion percentage
- **Application statistics**: Detailed breakdown of application statuses
- **Company analytics**: Ad counts and performance metrics
- **MOU tracking**: Agreement status and fee information

### 🔖 Candidate Management
- **Bookmark system**: Save candidates for future opportunities
- **Notes functionality**: Add private notes to bookmarked candidates
- **Status tracking**: Monitor candidate progress through hiring pipeline

### 🏛️ Business Logic
- **MOU requirement**: Active MOU required for ad posting
- **Ownership verification**: All operations verify employer ownership
- **City-specific operations**: Branch admin assignments by city
- **Fee management**: Support for both fixed and percentage-based fees

## Error Handling

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2025-08-14T04:25:00.000Z"
}
```

Common error codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `409`: Conflict (duplicate operation)
- `500`: Internal Server Error

## Pagination

List endpoints support pagination with consistent format:

```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Business Rules

1. **MOU Requirement**: Employers must have an active MOU to post job ads
2. **Ownership Validation**: All operations verify employer owns the resource
3. **City Boundaries**: MOU agreements are city-specific through branch admins
4. **Fee Structures**: Support both fixed amount and percentage-based fees
5. **Status Progression**: Candidates follow: Applied → Screened → Allocated → Hired/Rejected
6. **Bookmark Uniqueness**: One bookmark per employer-candidate pair
7. **Profile Completeness**: Calculated based on essential profile fields

## Integration Examples

### Search React Developers
```bash
curl -X GET "http://localhost:5000/api/employer/candidates?skills=React,JavaScript&minRating=8" \
  -H "Authorization: Bearer <token>"
```

### Bookmark Top Candidate
```bash
curl -X POST "http://localhost:5000/api/employer/candidates/{candidateId}/bookmark" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Excellent technical skills, fits our React position"}'
```

### Create MOU Agreement
```bash
curl -X POST "http://localhost:5000/api/employer/mous" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "branchAdminId": "branch-admin-uuid",
    "feeType": "PERCENTAGE",
    "feePercentage": 15,
    "terms": "Standard recruitment agreement"
  }'
```

This API provides everything employers need to manage their recruitment process efficiently within the Lokalhunt platform.