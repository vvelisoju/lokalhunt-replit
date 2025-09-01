import api from "./api";

// Helper function to convert object storage paths to proper URLs
export const getImageUrl = (path) => {
  if (!path) return null;

  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Get the server URL (without /api suffix)
  let serverUrl = import.meta.env.VITE_API_URL;

  // If VITE_API_URL includes /api, remove it to get base server URL
  if (serverUrl && serverUrl.endsWith('/api')) {
    serverUrl = serverUrl.slice(0, -4);
  }

  // If no environment variable is set, determine URL dynamically
  if (!serverUrl) {
    if (typeof window !== "undefined") {
      // In browser, use current origin
      serverUrl = window.location.origin;
    } else {
      // Fallback for SSR or development
      serverUrl = "http://localhost:5000";
    }
  }

  // Handle server-served files (already in correct format with /api/public/)
  if (path.startsWith("/api/public/")) {
    return `${serverUrl}${path}`;
  }

  // Handle any path starting with /api/
  if (path.startsWith("/api/")) {
    return `${serverUrl}${path}`;
  }

  // Handle Google Cloud Storage paths - convert to server endpoint
  if (
    path.includes("/profiles/") ||
    path.includes("/covers/") ||
    path.includes("/resumes/")
  ) {
    if (path.includes("/profiles/")) {
      // Convert to profile image endpoint: /api/public/images/profiles/userId/fileName
      return `${serverUrl}/api/public/images${path}`;
    } else if (path.includes("/covers/")) {
      // Convert to cover image endpoint: /api/public/images/covers/userId/fileName
      return `${serverUrl}/api/public/images${path}`;
    } else if (path.includes("/resumes/")) {
      // Convert to resume file endpoint: /api/public/files/resumes/userId/fileName
      return `${serverUrl}/api/public/files${path}`;
    }
  }

  // Handle internal object paths (fallback for Replit object storage)
  if (path.startsWith("/objects/")) {
    return `${serverUrl}${path}`;
  }

  // If it's a relative path, treat it as a server-served file
  return `${serverUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export const candidateApi = {
  // Authentication
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
  refreshToken: () => api.post("/auth/refresh"),

  // Profile management
  getProfile: () => api.get("/candidate/profile"),
  updateProfile: (profileData) => api.put("/candidate/profile", profileData),
  getProfileCompletion: () => api.get("/candidate/profile/completeness"),

  // Applications
  getApplications: (params = {}) =>
    api.get("/candidate/applications", { params }),
  applyToJob: (jobId) => api.post(`/candidate/applications/${jobId}`),
  getApplicationById: (applicationId) =>
    api.get(`/candidate/applications/${applicationId}`),
  withdrawApplication: (applicationId) =>
    api.delete(`/candidate/applications/${applicationId}`),

  // Bookmarks
  getBookmarks: (params = {}) => api.get("/candidate/bookmarks", { params }),
  addBookmark: (jobId) => api.post(`/candidate/bookmarks/${jobId}`),
  removeBookmark: (jobId) => api.delete(`/candidate/bookmarks/${jobId}`),
  toggleBookmark: async (jobId) => {
    try {
      const response = await api.post(`/candidate/bookmarks/${jobId}`);
      return response.data;
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      throw error;
    }
  },

  // Resume management (using object storage)
  uploadResume: async (file) => {
    try {
      console.log(
        "📁 Starting resume upload process for file:",
        file.name,
        "Size:",
        file.size,
      );

      // Step 1: Get upload URL from our backend
      const uploadUrlResponse = await api.get("/candidate/upload-url");
      console.log("📡 Upload URL response:", uploadUrlResponse);

      if (!uploadUrlResponse?.data?.data?.uploadURL) {
        throw new Error("Failed to get upload URL from response");
      }

      const uploadURL = uploadUrlResponse.data.data.uploadURL;
      console.log("🔗 Got upload URL:", uploadURL);

      // Step 2: Upload file to object storage
      const fileUploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!fileUploadResponse.ok) {
        const errorText = await fileUploadResponse.text();
        throw new Error(`Failed to upload file to storage: ${errorText}`);
      }

      console.log("✅ File uploaded to storage successfully");

      // Step 3: Update resume URL in database with proper metadata
      const response = await api.post("/candidate/resume", {
        resumeUrl: uploadURL.split("?")[0], // Remove query parameters for clean URL
        fileName: file.name,
        fileSize: file.size,
      });

      console.log("✅ Resume metadata saved to database:", response.data);
      return response.data;
    } catch (error) {
      console.error("Resume upload failed:", error);
      throw error;
    }
  },
  getResume: async () => {
    try {
      const response = await api.get("/candidate/resume");
      const resumeData = response.data?.data || response.data;
      
      // Validate resume data before returning
      if (resumeData && resumeData.url && resumeData.url !== 'null' && resumeData.url.trim()) {
        return response;
      } else {
        // Return consistent null data structure
        return {
          ...response,
          data: {
            ...response.data,
            data: {
              url: null,
              fileName: null,
              fileSize: 0,
              uploadedAt: null,
            }
          }
        };
      }
    } catch (error) {
      console.error("Get resume error:", error);
      throw error;
    }
  },
  deleteResume: () => api.delete("/candidate/resume"),

  // Job search
  searchJobs: (params = {}) => api.get("/ads", { params }),
  searchJobsWithStatus: (params = {}) =>
    api.get("/candidate/jobs/search", { params }),
  getJobById: (jobId) => api.get(`/candidate/jobs/${jobId}`),
  getJobWithStatus: async (jobId) => {
    try {
      const response = await api.get(`/candidate/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching job with status:", error);
      throw error;
    }
  },

  // Skills and categories
  getSkills: () => api.get("/public/skills"),
  getJobCategories: () => api.get("/public/categories"),
  getCities: () => api.get("/public/cities"),

  // Dashboard data
  getDashboardStats: () => api.get("/candidate/dashboard/stats"),
  getRecentApplications: () =>
    api.get("/candidate/applications", { params: { limit: 5 } }),
  getRecommendedJobs: () => api.get("/candidate/jobs/recommended"),

  // Messages (if applicable)
  getMessages: (params = {}) => api.get("/candidate/messages", { params }),
  markMessageAsRead: (messageId) =>
    api.put(`/candidate/messages/${messageId}/read`),

  // File upload
  getUploadUrl: () => api.get("/candidate/upload-url"),
  getProfileImageUploadUrl: () =>
    api.get("/candidate/profile-image-upload-url"),
  getCoverImageUploadUrl: () => api.get("/candidate/cover-image-upload-url"),
  updateProfilePhoto: (data) => api.put("/candidate/profile-photo", data),
  updateCoverPhoto: (data) => api.put("/candidate/cover-photo", data),

  // Optimized profile photo upload
  uploadOptimizedProfilePhoto: async (file) => {
    try {
      console.log("🖼️ Starting optimized profile photo upload:", file.name, "Size:", (file.size / 1024).toFixed(1), "KB");

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post("/candidate/profile/photo/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("✅ Optimized profile photo uploaded successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Optimized profile photo upload failed:", error);
      throw error;
    }
  },

  // Open to Work status management
  updateOpenToWorkStatus: (openToWork) =>
    api.patch("/candidate/profile/open-to-work", { openToWork }),
  getOpenToWorkStatus: () => api.get("/candidate/profile/open-to-work"),

  // Onboarding management
  saveOnboardingData: (onboardingData) =>
    api.post("/candidate/onboarding", onboardingData),
  getOnboardingData: () => api.get("/candidate/onboarding"),

  // Application management
  withdrawApplication: (applicationId) =>
    api.delete(`/candidate/applications/${applicationId}`),

  // Get candidate applications
  async getCandidateApplications() {
    const response = await api.get("/candidate/applications");
    return response.data;
  },

  // Logout candidate
  async logout() {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      // Don't throw error on logout - proceed with client cleanup
      console.log(
        "Logout API call failed, proceeding with client-side cleanup",
      );
      return null;
    }
  },
};