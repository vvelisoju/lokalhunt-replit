import axios from 'axios';

// Dynamically determine API base URL
let API_BASE_URL = import.meta.env.VITE_API_URL

if (!API_BASE_URL) {
  if (typeof window !== 'undefined') {
    // Check if we're in Replit environment
    const hostname = window.location.hostname
    if (hostname.includes('.replit.dev')) {
      // In Replit, server runs on port 5000, client on different port
      // Use the full Replit hostname with port 5000
      API_BASE_URL = `${window.location.protocol}//${hostname}:5000/api`
    } else if (hostname === 'localhost') {
      // Local development - server on port 5000
      API_BASE_URL = 'http://localhost:5000/api'
    } else {
      // Production or other environments
      API_BASE_URL = `${window.location.origin}/api`
    }
  } else {
    // Fallback for SSR or development
    API_BASE_URL = 'http://localhost:5000/api'
  }
} else {
  // Ensure API path is appended if not already present
  if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = `${API_BASE_URL}/api`
  }
}

// Debug logging for Shared API configuration
console.log('Shared API Configuration:', {
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  isReplit: typeof window !== 'undefined' && window.location.hostname.includes('.replit.dev'),
  finalApiUrl: API_BASE_URL
})

// Configure axios instance with the dynamic base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the auth token
api.setToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

const sharedApi = {
  // Get job preview by ID
  getJobPreview: async (jobId) => {
    const response = await api.get(`/public/jobs/${jobId}/preview`);
    return response.data;
  },

  // Get job details by ID
  getJobDetails: async (jobId) => {
    // This endpoint should now be handled by the shared API to allow preview of draft/pending jobs for authenticated users
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  // Get jobs by employer ID
  getJobsByEmployer: async (employerId) => {
    const response = await api.get(`/employers/${employerId}/jobs`);
    return response.data;
  },

  // Create a new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Update a job
  updateJob: async (jobId, jobData) => {
    const response = await api.put(`/jobs/${jobId}`, jobData);
    return response.data;
  },

  // Delete a job
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  },

  // Approve a job
  approveJob: async (jobId) => {
    const response = await api.put(`/jobs/${jobId}/approve`);
    return response.data;
  },

  // Reject a job
  rejectJob: async (jobId) => {
    const response = await api.put(`/jobs/${jobId}/reject`);
    return response.data;
  },

  // Get job applications
  getJobApplications: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
  },

  // Get applicant details
  getApplicantDetails: async (applicantId) => {
    const response = await api.get(`/applicants/${applicantId}`);
    return response.data;
  },

  // Accept an application
  acceptApplication: async (jobId, applicationId) => {
    const response = await api.put(`/jobs/${jobId}/applications/${applicationId}/accept`);
    return response.data;
  },

  // Reject an application
  rejectApplication: async (jobId, applicationId) => {
    const response = await api.put(`/jobs/${jobId}/applications/${applicationId}/reject`);
    return response.data;
  },
}

export default sharedApi;