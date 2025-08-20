import api from './api'

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