import { createAxiosInstance } from './axiosFactory'

// Create public API instance (optional auth - will include auth header if token exists)
const apiInstance = createAxiosInstance({
  serviceName: 'Public API',
  timeout: 10000,
  withCredentials: true,
  requireAuth: false, // Public API doesn't require auth but can accept it
  customInterceptors: {
    request: [
      (config) => {
        // Add auth header if token exists (for optional authentication)
        const token = localStorage.getItem('token') || localStorage.getItem('candidateToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('Public API: Adding auth token for logged-in user')
        } else {
          console.log('Public API: No token found, making unauthenticated request')
        }
        return config
      },
      (error) => {
        console.error('Public API Request Interceptor Error:', error)
        return Promise.reject(error)
      }
    ]
  }
})

export const publicApi = {
  // Get platform statistics
  async getStats() {
    const response = await apiInstance.get("/public/stats");
    return response.data;
  },

  // Get featured jobs for landing page
  async getFeaturedJobs(limit = 8) {
    const response = await apiInstance.get("/public/jobs/featured", {
      params: { limit },
    });
    return response.data;
  },

  // Get job categories with counts
  async getCategories() {
    const response = await apiInstance.get("/public/categories");
    return response.data;
  },

  // Get popular cities
  async getCities() {
    const response = await apiInstance.get("/public/cities");
    return response.data;
  },

  // Get education qualifications
  async getEducationQualifications() {
    const response = await apiInstance.get('/public/education-qualifications');
    return response.data;
  },

  // Get skills
  async getSkills(category = null) {
    const params = category ? { category } : {};
    const response = await apiInstance.get('/public/skills', { params });
    return response.data;
  },

  // Search jobs (public endpoint)
  async searchJobs(params = {}) {
    const response = await apiInstance.get("/public/jobs/search", { params });
    return response.data;
  },

  // Get job by ID (public endpoint)
  async getJobById(id) {
    const response = await apiInstance.get(`/public/jobs/${id}`);
    return response.data;
  },

  // Get testimonials
  async getTestimonials() {
    const response = await apiInstance.get("/public/testimonials");
    return response.data;
  },

  // Get companies with filtering
  async getCompanies(params = {}) {
    const response = await apiInstance.get("/public/companies", { params });
    return response.data;
  },
};

export default publicApi;