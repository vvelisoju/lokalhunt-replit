import axios from "axios";

// Dynamically determine API base URL
let API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  if (typeof window !== "undefined") {
    // Check if we're in Replit environment
    const hostname = window.location.hostname;
    if (hostname.includes(".replit.dev")) {
      // In Replit, server runs on port 5000, client on different port
      // Remove any existing port and add port 5000
      const baseHostname = hostname.split(":")[0];
      API_BASE_URL = `${window.location.protocol}//${baseHostname}:5000/api`;
    } else if (hostname === "localhost" || hostname === "127.0.0.1") {
      // Local development - check if we have a production API URL in env
      if (import.meta.env.VITE_API_URL) {
        API_BASE_URL = import.meta.env.VITE_API_URL;
        if (!API_BASE_URL.endsWith("/api")) {
          API_BASE_URL = `${API_BASE_URL}/api`;
        }
      } else {
        // Fallback to local server
        API_BASE_URL = "http://localhost:5000/api";
      }
    } else {
      // Production or other environments
      API_BASE_URL = `${window.location.origin}/api`;
    }
  } else {
    // Fallback for SSR or development
    API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    if (API_BASE_URL && !API_BASE_URL.endsWith("/api")) {
      API_BASE_URL = `${API_BASE_URL}/api`;
    }
  }
} else {
  // Ensure API path is appended if not already present
  if (!API_BASE_URL.endsWith("/api")) {
    API_BASE_URL = `${API_BASE_URL}/api`;
  }
}

// Debug logging for Public API configuration
console.log("Public API Configuration:", {
  hostname: typeof window !== "undefined" ? window.location.hostname : "SSR",
  isReplit:
    typeof window !== "undefined" &&
    window.location.hostname.includes(".replit.dev"),
  finalApiUrl: `${API_BASE_URL}`,
});

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    const response = await api.get("/public/education-qualifications");
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
