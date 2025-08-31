import { createAxiosInstance } from './axiosFactory'

// Create public API instance (no authentication required)
const api = createAxiosInstance({
  serviceName: 'Public API',
  timeout: 10000,
  withCredentials: false,
  requireAuth: false
})

export const publicApi = {
  // Get platform statistics
  async getStats() {
    const response = await api.get("/public/stats");
    return response.data;
  },

  // Get featured jobs for landing page
  async getFeaturedJobs(limit = 8) {
    const response = await api.get("/public/jobs/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Get job categories with counts
  async getCategories() {
    const response = await api.get("/public/categories");
    return response.data;
  },

  // Get popular cities
  async getCities() {
    const response = await api.get("/public/cities");
    return response.data;
  },

  // Get education qualifications
  async getEducationQualifications() {
    const response = await api.get('/public/education-qualifications');
    return response.data;
  },

  // Get job roles
  async getJobRoles() {
    const response = await api.get('/public/job-roles');
    return response.data;
  },

  // Get skills
  async getSkills(category = null) {
    const params = category ? { category } : {};
    const response = await api.get('/public/skills', { params });
    return response.data;
  },

  // Search jobs (public endpoint)
  async searchJobs(params = {}) {
    const response = await api.get("/public/jobs/search", { params });
    return response.data;
  },

  // Get job by ID (public endpoint)
  async getJobById(id) {
    const response = await api.get(`/public/jobs/${id}`);
    return response.data;
  },

  // Get testimonials
  async getTestimonials() {
    const response = await api.get("/public/testimonials");
    return response.data;
  },

  // Get companies with filtering
  async getCompanies(params = {}) {
    const response = await api.get("/public/companies", { params });
    return response.data;
  },
};

export default publicApi;