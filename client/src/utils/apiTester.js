/**
 * API Testing Utilities for Candidate System
 * Provides comprehensive testing functions for all candidate endpoints
 */

import { candidateApi } from '../services/candidateApi'

export class ApiTester {
  constructor() {
    this.testResults = []
    this.debugMode = true
  }

  // Log API test results
  logResult(test, success, response, error = null) {
    const result = {
      test,
      success,
      response: error ? null : response,
      error: error ? error.message : null,
      timestamp: new Date().toISOString()
    }
    
    this.testResults.push(result)
    
    if (this.debugMode) {
      console.log(`[API TEST] ${test}:`, error || response)
    }
    
    return result
  }

  // Generate test data
  generateTestData() {
    const timestamp = Date.now()
    return {
      credentials: {
        email: `test.user.${timestamp}@example.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        phone: `123456${String(timestamp).slice(-4)}`,
        city: 'TestCity'
      },
      profileUpdate: {
        bio: 'Updated test bio for API testing',
        experience: 'Senior Software Developer with 5+ years experience',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        education: 'Master of Computer Science',
        location: 'Test City, Test State'
      },
      jobData: {
        jobId: 'test-job-' + timestamp,
        title: 'Sample Test Job',
        company: 'Test Company Inc.'
      }
    }
  }

  // Authentication tests
  async testAuthentication(credentials) {
    const results = []
    
    try {
      // Test registration
      const registerResult = await candidateApi.register(credentials)
      results.push(this.logResult('User Registration', true, registerResult))
    } catch (error) {
      results.push(this.logResult('User Registration', false, null, error))
      return results // Stop if registration fails
    }

    try {
      // Test login
      const loginResult = await candidateApi.login({
        email: credentials.email,
        password: credentials.password
      })
      results.push(this.logResult('User Login', true, loginResult))
    } catch (error) {
      results.push(this.logResult('User Login', false, null, error))
    }

    return results
  }

  // Profile management tests
  async testProfileOperations(profileData) {
    const results = []

    try {
      // Test profile fetch
      const profile = await candidateApi.getProfile()
      results.push(this.logResult('Fetch Profile', true, profile))
    } catch (error) {
      results.push(this.logResult('Fetch Profile', false, null, error))
    }

    try {
      // Test profile update
      const updatedProfile = await candidateApi.updateProfile(profileData)
      results.push(this.logResult('Update Profile', true, updatedProfile))
    } catch (error) {
      results.push(this.logResult('Update Profile', false, null, error))
    }

    try {
      // Test profile completion check
      const completion = await candidateApi.getProfileCompletion()
      results.push(this.logResult('Profile Completion Check', true, completion))
    } catch (error) {
      results.push(this.logResult('Profile Completion Check', false, null, error))
    }

    return results
  }

  // Application management tests
  async testApplicationOperations(jobId) {
    const results = []

    try {
      // Test fetch applications
      const applications = await candidateApi.getApplications()
      results.push(this.logResult('Fetch Applications', true, applications))
    } catch (error) {
      results.push(this.logResult('Fetch Applications', false, null, error))
    }

    try {
      // Test job application (if jobId provided)
      if (jobId) {
        const application = await candidateApi.applyToJob(jobId)
        results.push(this.logResult('Apply to Job', true, application))
      }
    } catch (error) {
      results.push(this.logResult('Apply to Job', false, null, error))
    }

    return results
  }

  // Bookmark management tests
  async testBookmarkOperations(jobId) {
    const results = []

    try {
      // Test fetch bookmarks
      const bookmarks = await candidateApi.getBookmarks()
      results.push(this.logResult('Fetch Bookmarks', true, bookmarks))
    } catch (error) {
      results.push(this.logResult('Fetch Bookmarks', false, null, error))
    }

    try {
      // Test add bookmark (if jobId provided)
      if (jobId) {
        const bookmark = await candidateApi.addBookmark(jobId)
        results.push(this.logResult('Add Bookmark', true, bookmark))
        
        // Test remove bookmark
        if (bookmark && bookmark.id) {
          setTimeout(async () => {
            try {
              await candidateApi.removeBookmark(bookmark.id)
              results.push(this.logResult('Remove Bookmark', true, { bookmarkId: bookmark.id }))
            } catch (error) {
              results.push(this.logResult('Remove Bookmark', false, null, error))
            }
          }, 1000)
        }
      }
    } catch (error) {
      results.push(this.logResult('Add Bookmark', false, null, error))
    }

    return results
  }

  // Dashboard and data retrieval tests
  async testDashboardOperations() {
    const results = []

    try {
      // Test dashboard stats
      const stats = await candidateApi.getDashboardStats()
      results.push(this.logResult('Dashboard Stats', true, stats))
    } catch (error) {
      results.push(this.logResult('Dashboard Stats', false, null, error))
    }

    try {
      // Test recent applications
      const recentApps = await candidateApi.getRecentApplications()
      results.push(this.logResult('Recent Applications', true, recentApps))
    } catch (error) {
      results.push(this.logResult('Recent Applications', false, null, error))
    }

    try {
      // Test recommended jobs
      const recommendedJobs = await candidateApi.getRecommendedJobs()
      results.push(this.logResult('Recommended Jobs', true, recommendedJobs))
    } catch (error) {
      results.push(this.logResult('Recommended Jobs', false, null, error))
    }

    return results
  }

  // Job search tests
  async testJobOperations() {
    const results = []

    try {
      // Test job search
      const jobs = await candidateApi.searchJobs({ limit: 10 })
      results.push(this.logResult('Job Search', true, jobs))
    } catch (error) {
      results.push(this.logResult('Job Search', false, null, error))
    }

    try {
      // Test get skills
      const skills = await candidateApi.getSkills()
      results.push(this.logResult('Get Skills', true, skills))
    } catch (error) {
      results.push(this.logResult('Get Skills', false, null, error))
    }

    try {
      // Test get job categories
      const categories = await candidateApi.getJobCategories()
      results.push(this.logResult('Get Job Categories', true, categories))
    } catch (error) {
      results.push(this.logResult('Get Job Categories', false, null, error))
    }

    try {
      // Test get cities
      const cities = await candidateApi.getCities()
      results.push(this.logResult('Get Cities', true, cities))
    } catch (error) {
      results.push(this.logResult('Get Cities', false, null, error))
    }

    return results
  }

  // Resume management tests
  async testResumeOperations(file = null) {
    const results = []

    try {
      // Test get resume
      const resume = await candidateApi.getResume()
      results.push(this.logResult('Get Resume', true, resume))
    } catch (error) {
      results.push(this.logResult('Get Resume', false, null, error))
    }

    if (file) {
      try {
        // Test upload resume
        const uploadResult = await candidateApi.uploadResume(file)
        results.push(this.logResult('Upload Resume', true, uploadResult))
      } catch (error) {
        results.push(this.logResult('Upload Resume', false, null, error))
      }
    }

    return results
  }

  // Run comprehensive test suite
  async runFullTestSuite(includeFileUpload = false, resumeFile = null) {
    this.testResults = []
    const testData = this.generateTestData()
    
    console.log('🧪 Starting comprehensive API test suite...')
    
    // Authentication tests
    console.log('🔐 Testing authentication...')
    const authResults = await this.testAuthentication(testData.credentials)
    
    // Profile tests
    console.log('👤 Testing profile operations...')
    const profileResults = await this.testProfileOperations(testData.profileUpdate)
    
    // Dashboard tests
    console.log('📊 Testing dashboard operations...')
    const dashboardResults = await this.testDashboardOperations()
    
    // Application tests
    console.log('📋 Testing application operations...')
    const applicationResults = await this.testApplicationOperations(testData.jobData.jobId)
    
    // Bookmark tests
    console.log('🔖 Testing bookmark operations...')
    const bookmarkResults = await this.testBookmarkOperations(testData.jobData.jobId)
    
    // Job search tests
    console.log('🔍 Testing job operations...')
    const jobResults = await this.testJobOperations()
    
    // Resume tests
    console.log('📄 Testing resume operations...')
    const resumeResults = await this.testResumeOperations(includeFileUpload ? resumeFile : null)
    
    const allResults = [
      ...authResults,
      ...profileResults,
      ...dashboardResults,
      ...applicationResults,
      ...bookmarkResults,
      ...jobResults,
      ...resumeResults
    ]
    
    const successCount = allResults.filter(r => r.success).length
    const totalCount = allResults.length
    
    console.log(`✅ Test suite completed: ${successCount}/${totalCount} tests passed`)
    
    return {
      results: allResults,
      summary: {
        total: totalCount,
        passed: successCount,
        failed: totalCount - successCount,
        successRate: ((successCount / totalCount) * 100).toFixed(1)
      },
      testData
    }
  }

  // Get all test results
  getResults() {
    return this.testResults
  }

  // Clear test results
  clearResults() {
    this.testResults = []
  }

  // Enable/disable debug mode
  setDebugMode(enabled) {
    this.debugMode = enabled
  }
}

// Export singleton instance
export const apiTester = new ApiTester()

// Export utility functions
export const generateTestCredentials = () => {
  const timestamp = Date.now()
  return {
    email: `test.${timestamp}@example.com`,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
    phone: `555${String(timestamp).slice(-7)}`,
    city: 'TestCity'
  }
}

export const createDummyResumeFile = () => {
  const content = `Test Resume Content
Name: Test User
Email: test@example.com
Experience: Software Developer
Skills: JavaScript, React, Node.js`
  
  const blob = new Blob([content], { type: 'text/plain' })
  return new File([blob], 'test-resume.txt', { type: 'text/plain' })
}