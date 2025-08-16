# Branch Admin API Documentation

The Branch Admin API provides comprehensive endpoints for branch administrators to manage ads, applications, candidate screening, and performance tracking within their assigned city in the Lokalhunt platform.

## Authentication

All endpoints require:
- `Authorization: Bearer <JWT_TOKEN>` header
- `BRANCH_ADMIN` role in the JWT token

## API Endpoints

### 🧑‍💼 Profile Management

#### GET /api/branch-admin/profile
Get complete branch admin profile with activity summary.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "branch-admin-uuid",
    "user": {...},
    "assignedCity": {...},
    "mous": [...],
    "activitySummary": {
      "pendingAds": 0,
      "recentApprovals": 1,
      "pendingScreenings": 1,
      "recentAllocations": 1
    },
    "hasActiveMOUs": true
  }
}
```

#### PUT /api/branch-admin/profile
Update branch admin profile information.

**Request Body:**
```json
{
  "performanceMetrics": {
    "adsApproved": 5,
    "candidatesScreened": 12,
    "allocationsCompleted": 8
  }
}
```

#### GET /api/branch-admin/performance
Get detailed performance metrics and analytics.

**Query Parameters:**
- `timeframe`: Number of days (default: 30)

**Response:**
```json
{
  "status": "success",
  "data": {
    "timeframe": "30 days",
    "city": {...},
    "metrics": {
      "adReview": {
        "totalReviewed": 1,
        "approved": 1,
        "rejected": 0,
        "approvalRate": "100%"
      },
      "candidateScreening": {
        "screened": 1,
        "allocated": 1,
        "allocationRate": "100%",
        "totalProcessed": 1
      },
      "currentWorkload": {
        "pendingAds": 0,
        "pendingScreenings": 1
      },
      "efficiency": {
        "averageReviewTime": "N/A",
        "dailyAverage": 0
      }
    },
    "targets": {
      "dailyAdReviews": 10,
      "dailyScreenings": 15,
      "targetApprovalRate": "85%",
      "targetAllocationRate": "70%"
    }
  }
}
```

### 📋 Ad Management

#### GET /api/branch-admin/ads/pending
List pending ads requiring approval (EXISTING).

#### GET /api/branch-admin/ads/:adId
Get detailed information about a specific ad with application statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "ad-uuid",
    "title": "Senior Software Engineer",
    "company": {...},
    "employer": {...},
    "allocations": [...],
    "applicationStats": {
      "total": 3,
      "applied": 1,
      "screened": 1,
      "allocated": 1,
      "shortlisted": 0,
      "hired": 0,
      "rejected": 0
    },
    "hasActiveMOU": true,
    "canApprove": false
  }
}
```

#### PUT /api/branch-admin/ads/:adId/review
Approve or reject an ad (EXISTING).

### 👥 Application Management

#### GET /api/branch-admin/applications
List all applications with enhanced filtering options.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by allocation status
- `candidateName`: Search by candidate name (partial match)
- `companyName`: Search by company name (partial match)
- `sortBy`: Sort field (default: 'createdAt')
- `sortOrder`: Sort order 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "allocation-uuid",
      "status": "SCREENED",
      "candidate": {
        "tags": ["Quick Learner", "Team Player"],
        "overallRating": "7.8",
        "user": {...}
      },
      "ad": {
        "title": "Senior Software Engineer",
        "company": {...},
        "location": {...}
      }
    }
  ]
}
```

#### GET /api/branch-admin/applications/:allocationId
Get detailed information about a specific application with enriched context.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "allocation-uuid",
    "candidate": {...},
    "ad": {...},
    "canScreen": true,
    "canAllocate": false,
    "hasActiveMOU": true,
    "skillMatch": 75,
    "timeInStatus": "2 hours"
  }
}
```

#### PUT /api/branch-admin/applications/:allocationId/screen
Screen and rate a candidate (EXISTING).

#### PUT /api/branch-admin/applications/:allocationId/allocate
Allocate a screened candidate to the employer.

**Request Body:**
```json
{
  "notes": "Allocated to employer after successful screening"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "allocation-uuid",
    "status": "ALLOCATED",
    "feeType": "PERCENTAGE",
    "feeValue": "15",
    "notes": "Allocated to employer after successful screening",
    "allocatedBy": "admin-uuid",
    "allocatedAt": "2025-08-14T04:31:04.436Z",
    "candidate": {...},
    "ad": {...}
  }
}
```

### 📄 MOU Management

#### POST /api/branch-admin/mous
Create a new MOU agreement (EXISTING).

### 🏙️ City Management

#### GET /api/branch-admin/city/stats
Get comprehensive city statistics (EXISTING).

#### GET /api/branch-admin/city/employers
List employers in the assigned city (EXISTING).

## Key Features

### 🎯 Enhanced Application Management
- **Advanced Filtering**: Search by candidate name, company name, status
- **Sorting Options**: Flexible sorting by various fields
- **Enriched Context**: Skill matching, time tracking, action capabilities
- **Status Progression**: Clear workflow from APPLIED → SCREENED → ALLOCATED

### 📊 Performance Analytics
- **Comprehensive Metrics**: Ad review and candidate screening statistics
- **Efficiency Tracking**: Daily averages and performance rates
- **Target Monitoring**: Compare against platform targets
- **Workload Management**: Current pending items tracking

### 🔧 Profile Management
- **Activity Summary**: Real-time overview of pending tasks
- **Performance Metrics**: Track personal statistics
- **MOU Oversight**: Monitor active agreements in city

### 🏛️ Business Logic Integration
- **City-Specific Operations**: All operations scoped to assigned city
- **MOU Validation**: Ensure active agreements before allocation
- **Fee Tracking**: Automatic fee application from MOU terms
- **Audit Trail**: Complete tracking of admin actions

## Workflow Integration

### Standard Application Processing Flow:
1. **Ad Approval**: Review and approve employer job postings
2. **Application Screening**: Rate and evaluate candidates
3. **Candidate Allocation**: Assign qualified candidates to employers
4. **Performance Tracking**: Monitor metrics and efficiency

### Quality Control Features:
- **MOU Verification**: Active agreements required for allocations
- **Skill Matching**: Automatic calculation of candidate-job fit
- **Rating System**: Permanent candidate skill ratings
- **Time Tracking**: Monitor how long candidates spend in each status

## Error Handling

All endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400,
  "timestamp": "2025-08-14T04:31:00.000Z"
}
```

Common error codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist or not in assigned city)
- `500`: Internal Server Error

## City-Scoped Operations

All branch admin operations are automatically scoped to their assigned city:
- Only ads in the assigned city can be reviewed
- Only applications for ads in the assigned city are visible
- Performance metrics are calculated city-specific
- MOU agreements are tied to city-specific operations

## Integration Examples

### Get Performance Overview
```bash
curl -X GET "http://localhost:5000/api/branch-admin/performance?timeframe=7" \
  -H "Authorization: Bearer <token>"
```

### Filter Applications by Status
```bash
curl -X GET "http://localhost:5000/api/branch-admin/applications?status=SCREENED&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Allocate Candidate to Employer
```bash
curl -X PUT "http://localhost:5000/api/branch-admin/applications/{allocationId}/allocate" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Excellent candidate with required skills"}'
```

### Get Detailed Ad Information
```bash
curl -X GET "http://localhost:5000/api/branch-admin/ads/{adId}" \
  -H "Authorization: Bearer <token>"
```

This API provides branch administrators with complete tools to manage their city's recruitment ecosystem efficiently within the Lokalhunt platform.