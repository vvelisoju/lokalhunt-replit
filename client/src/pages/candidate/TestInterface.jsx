import React, { useState, useEffect } from 'react'
import { candidateApi } from '../../services/candidateApi'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'
import { useCandidate } from '../../context/CandidateContext'
import { useToast } from '../../components/ui/Toast'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import FormInput from '../../components/ui/FormInput'
import Alert from '../../components/ui/Alert'
import Loader from '../../components/ui/Loader'

const TestInterface = () => {
  const { toast } = useToast()
  const { user, isAuthenticated, login, register, logout } = useCandidateAuth()
  const { 
    profile, 
    applications, 
    bookmarks, 
    loading,
    fetchProfile,
    updateProfile,
    fetchApplications,
    applyToJob,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    uploadResume,
    deleteResume
  } = useCandidate()

  // Test state
  const [testResults, setTestResults] = useState([])
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [debugMode, setDebugMode] = useState(true)
  const [apiResponses, setApiResponses] = useState([])

  // Form states for manual testing
  const [testCredentials, setTestCredentials] = useState({
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '1234567890',
    city: 'TestCity'
  })

  const [profileData, setProfileData] = useState({
    bio: 'Test bio for automated testing',
    experience: 'Software Developer with 3 years experience',
    skills: ['JavaScript', 'React', 'Node.js'],
    education: 'Computer Science Degree'
  })

  const [jobTestData, setJobTestData] = useState({
    jobId: 'test-job-123',
    title: 'Sample Job for Testing'
  })

  // Log API responses
  const logApiResponse = (action, response, error = null) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      response: error ? null : response,
      error: error ? error.message : null,
      success: !error
    }
    
    setApiResponses(prev => [logEntry, ...prev.slice(0, 19)]) // Keep last 20 logs
    
    if (debugMode) {
      console.log(`[API TEST] ${action}:`, error || response)
    }
  }

  // Add test result
  const addTestResult = (step, success, message, data = null) => {
    const result = {
      step,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }
    
    setTestResults(prev => [...prev, result])
    
    if (success) {
      toast.success(step, message)
    } else {
      toast.error(step, message)
    }
  }

  // Automated test flow
  const runAutomatedTest = async () => {
    setIsRunningTest(true)
    setTestResults([])
    setApiResponses([])

    try {
      // Step 1: Registration
      addTestResult('Registration', false, 'Starting registration test...')
      try {
        const registerResponse = await register(testCredentials)
        logApiResponse('Register', registerResponse)
        
        if (registerResponse.success) {
          addTestResult('Registration', true, 'Account created successfully', registerResponse.user)
        } else {
          addTestResult('Registration', false, registerResponse.error)
          return
        }
      } catch (error) {
        logApiResponse('Register', null, error)
        addTestResult('Registration', false, `Registration failed: ${error.message}`)
        return
      }

      // Wait a moment for auth to settle
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Profile Fetch
      addTestResult('Profile Fetch', false, 'Fetching profile data...')
      try {
        await fetchProfile()
        logApiResponse('Fetch Profile', profile)
        addTestResult('Profile Fetch', true, 'Profile fetched successfully', profile)
      } catch (error) {
        logApiResponse('Fetch Profile', null, error)
        addTestResult('Profile Fetch', false, `Profile fetch failed: ${error.message}`)
      }

      // Step 3: Profile Update
      addTestResult('Profile Update', false, 'Updating profile...')
      try {
        const updateResponse = await updateProfile(profileData)
        logApiResponse('Update Profile', updateResponse)
        addTestResult('Profile Update', true, 'Profile updated successfully', updateResponse)
      } catch (error) {
        logApiResponse('Update Profile', null, error)
        addTestResult('Profile Update', false, `Profile update failed: ${error.message}`)
      }

      // Step 4: Dashboard Data
      addTestResult('Dashboard Data', false, 'Fetching dashboard stats...')
      try {
        const dashboardResponse = await candidateApi.getDashboardStats()
        logApiResponse('Dashboard Stats', dashboardResponse)
        addTestResult('Dashboard Data', true, 'Dashboard stats fetched', dashboardResponse)
      } catch (error) {
        logApiResponse('Dashboard Stats', null, error)
        addTestResult('Dashboard Data', false, `Dashboard fetch failed: ${error.message}`)
      }

      // Step 5: Applications
      addTestResult('Applications Fetch', false, 'Fetching applications...')
      try {
        await fetchApplications()
        logApiResponse('Fetch Applications', applications)
        addTestResult('Applications Fetch', true, `Found ${applications?.length || 0} applications`, applications)
      } catch (error) {
        logApiResponse('Fetch Applications', null, error)
        addTestResult('Applications Fetch', false, `Applications fetch failed: ${error.message}`)
      }

      // Step 6: Bookmarks
      addTestResult('Bookmarks Fetch', false, 'Fetching bookmarks...')
      try {
        await fetchBookmarks()
        logApiResponse('Fetch Bookmarks', bookmarks)
        addTestResult('Bookmarks Fetch', true, `Found ${bookmarks?.length || 0} bookmarks`, bookmarks)
      } catch (error) {
        logApiResponse('Fetch Bookmarks', null, error)
        addTestResult('Bookmarks Fetch', false, `Bookmarks fetch failed: ${error.message}`)
      }

      // Step 7: Job Search
      addTestResult('Job Search', false, 'Testing job search...')
      try {
        const jobsResponse = await candidateApi.searchJobs({ limit: 5 })
        logApiResponse('Search Jobs', jobsResponse)
        addTestResult('Job Search', true, `Found ${jobsResponse?.data?.length || 0} jobs`, jobsResponse)
      } catch (error) {
        logApiResponse('Search Jobs', null, error)
        addTestResult('Job Search', false, `Job search failed: ${error.message}`)
      }

      // Step 8: Profile Completion Check
      addTestResult('Profile Completion', false, 'Checking profile completion...')
      try {
        const completionResponse = await candidateApi.getProfileCompletion()
        logApiResponse('Profile Completion', completionResponse)
        addTestResult('Profile Completion', true, `Profile ${completionResponse?.percentage || 0}% complete`, completionResponse)
      } catch (error) {
        logApiResponse('Profile Completion', null, error)
        addTestResult('Profile Completion', false, `Profile completion check failed: ${error.message}`)
      }

      addTestResult('Test Complete', true, 'All automated tests completed!')

    } catch (error) {
      addTestResult('Test Error', false, `Unexpected error: ${error.message}`)
    } finally {
      setIsRunningTest(false)
    }
  }

  // Manual test functions
  const testLogin = async () => {
    try {
      const result = await login({
        email: testCredentials.email,
        password: testCredentials.password
      })
      logApiResponse('Manual Login', result)
    } catch (error) {
      logApiResponse('Manual Login', null, error)
    }
  }

  const testBookmarkAdd = async () => {
    try {
      const result = await addBookmark(jobTestData.jobId)
      logApiResponse('Add Bookmark', result)
    } catch (error) {
      logApiResponse('Add Bookmark', null, error)
    }
  }

  const testBookmarkRemove = async (bookmarkId) => {
    try {
      await removeBookmark(bookmarkId)
      logApiResponse('Remove Bookmark', { bookmarkId })
    } catch (error) {
      logApiResponse('Remove Bookmark', null, error)
    }
  }

  const testJobApplication = async () => {
    try {
      await applyToJob(jobTestData.jobId)
      logApiResponse('Apply to Job', { jobId: jobTestData.jobId })
    } catch (error) {
      logApiResponse('Apply to Job', null, error)
    }
  }

  const testResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const result = await uploadResume(file)
        logApiResponse('Upload Resume', result)
      } catch (error) {
        logApiResponse('Upload Resume', null, error)
      }
    }
  }

  const clearTestData = () => {
    setTestResults([])
    setApiResponses([])
    toast.info('Test Data Cleared', 'All test results and logs have been cleared')
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Candidate Test & Exploration Interface
        </h1>
        <p className="text-gray-600">
          Comprehensive testing interface for all candidate features and API endpoints
        </p>
        
        {/* Status Bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isAuthenticated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </div>
          
          {user && (
            <div className="text-sm text-gray-600">
              Logged in as: {user.firstName} {user.lastName} ({user.email})
            </div>
          )}
          
          <Button
            onClick={() => setDebugMode(!debugMode)}
            variant={debugMode ? 'primary' : 'secondary'}
            size="sm"
          >
            Debug Mode: {debugMode ? 'ON' : 'OFF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Automated Testing */}
        <div className="space-y-6">
          {/* Automated Test Controls */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Automated Test Flow</h2>
              <p className="text-gray-600 mb-4">
                Runs complete end-to-end test including registration, login, profile management, 
                applications, bookmarks, and dashboard access.
              </p>
              
              {/* Test Credentials */}
              <div className="mb-4">
                <h3 className="font-medium mb-2">Test Account Credentials:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Email:</strong> {testCredentials.email}</div>
                  <div><strong>Password:</strong> {testCredentials.password}</div>
                  <div><strong>Name:</strong> {testCredentials.firstName} {testCredentials.lastName}</div>
                  <div><strong>City:</strong> {testCredentials.city}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={runAutomatedTest}
                  disabled={isRunningTest}
                  variant="primary"
                  className="flex-1"
                >
                  {isRunningTest ? (
                    <>
                      <Loader size="sm" />
                      Running Tests...
                    </>
                  ) : (
                    'Run Automated Test'
                  )}
                </Button>
                
                <Button
                  onClick={clearTestData}
                  variant="secondary"
                >
                  Clear Results
                </Button>
              </div>
            </div>
          </Card>

          {/* Test Results */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              
              {testResults.length === 0 ? (
                <p className="text-gray-500">No tests run yet</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border-l-4 ${
                        result.success
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{result.step}</div>
                          <div className="text-sm text-gray-600">{result.message}</div>
                          {result.data && debugMode && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer">Show Data</summary>
                              <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Manual Testing & Exploration */}
        <div className="space-y-6">
          {/* Manual Test Controls */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Manual Exploration</h2>
              
              {/* Authentication Tests */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Authentication</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={testLogin} size="sm" disabled={isAuthenticated}>
                    Test Login
                  </Button>
                  <Button onClick={logout} size="sm" disabled={!isAuthenticated} variant="secondary">
                    Test Logout
                  </Button>
                </div>
              </div>

              {/* Profile Tests */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Profile Management</h3>
                <div className="space-y-2">
                  <Button 
                    onClick={fetchProfile} 
                    size="sm" 
                    disabled={!isAuthenticated}
                    className="w-full"
                  >
                    Fetch Profile
                  </Button>
                  
                  <Button 
                    onClick={() => updateProfile(profileData)} 
                    size="sm" 
                    disabled={!isAuthenticated}
                    className="w-full"
                  >
                    Update Profile
                  </Button>
                </div>
              </div>

              {/* Job Actions */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Job Actions</h3>
                <div className="space-y-2">
                  <FormInput
                    label="Job ID for Testing"
                    value={jobTestData.jobId}
                    onChange={(e) => setJobTestData(prev => ({ ...prev, jobId: e.target.value }))}
                    placeholder="Enter job ID"
                    size="sm"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={testBookmarkAdd} size="sm" disabled={!isAuthenticated}>
                      Add Bookmark
                    </Button>
                    <Button onClick={testJobApplication} size="sm" disabled={!isAuthenticated}>
                      Apply to Job
                    </Button>
                  </div>
                </div>
              </div>

              {/* Resume Upload */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Resume Management</h3>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={testResumeUpload}
                    disabled={!isAuthenticated}
                    className="w-full text-sm"
                  />
                  <Button 
                    onClick={deleteResume} 
                    size="sm" 
                    disabled={!isAuthenticated}
                    variant="secondary"
                    className="w-full"
                  >
                    Delete Resume
                  </Button>
                </div>
              </div>

              {/* Data Fetch Tests */}
              <div>
                <h3 className="font-medium mb-3">Data Operations</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={fetchApplications} size="sm" disabled={!isAuthenticated}>
                    Fetch Applications
                  </Button>
                  <Button onClick={fetchBookmarks} size="sm" disabled={!isAuthenticated}>
                    Fetch Bookmarks
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Current Data Display */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Current Data</h2>
              
              {loading && (
                <div className="flex items-center gap-2 mb-4">
                  <Loader size="sm" />
                  <span className="text-sm">Loading...</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Profile */}
                <div>
                  <h4 className="font-medium">Profile</h4>
                  <div className="text-sm text-gray-600">
                    {profile ? (
                      <div>
                        <div>Name: {profile.firstName} {profile.lastName}</div>
                        <div>Email: {profile.email}</div>
                        <div>City: {profile.city}</div>
                        {profile.bio && <div>Bio: {profile.bio}</div>}
                      </div>
                    ) : (
                      'No profile data'
                    )}
                  </div>
                </div>

                {/* Applications */}
                <div>
                  <h4 className="font-medium">Applications ({applications?.length || 0})</h4>
                  <div className="text-sm text-gray-600">
                    {applications?.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto">
                        {applications.slice(0, 3).map((app, idx) => (
                          <div key={idx} className="border-b py-1">
                            Job: {app.jobTitle} - Status: {app.status}
                          </div>
                        ))}
                        {applications.length > 3 && <div>... and {applications.length - 3} more</div>}
                      </div>
                    ) : (
                      'No applications'
                    )}
                  </div>
                </div>

                {/* Bookmarks */}
                <div>
                  <h4 className="font-medium">Bookmarks ({bookmarks?.length || 0})</h4>
                  <div className="text-sm text-gray-600">
                    {bookmarks?.length > 0 ? (
                      <div className="max-h-32 overflow-y-auto">
                        {bookmarks.slice(0, 3).map((bookmark, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b py-1">
                            <span>{bookmark.jobTitle}</span>
                            <Button 
                              onClick={() => testBookmarkRemove(bookmark.id)}
                              size="xs"
                              variant="secondary"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        {bookmarks.length > 3 && <div>... and {bookmarks.length - 3} more</div>}
                      </div>
                    ) : (
                      'No bookmarks'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* API Response Log */}
      {debugMode && (
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">API Response Log</h2>
            
            {apiResponses.length === 0 ? (
              <p className="text-gray-500">No API calls logged yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {apiResponses.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border-l-4 font-mono text-sm ${
                      log.success
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold">{log.action}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {log.error ? (
                      <div className="text-red-600">Error: {log.error}</div>
                    ) : (
                      <details>
                        <summary className="cursor-pointer">Response Data</summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default TestInterface