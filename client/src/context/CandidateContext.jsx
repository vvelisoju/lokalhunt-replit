import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { candidateApi } from "../services/candidateApi";
import { useToast } from "../components/ui/Toast";

const CandidateContext = createContext();

const initialState = {
  profile: null,
  applications: [],
  bookmarks: [],
  loading: false,
  error: null,
  profileLoaded: false,
  applicationsLoaded: false,
  bookmarksLoaded: false,
};

const candidateReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SET_PROFILE":
      return {
        ...state,
        profile: action.payload,
        loading: false,
        profileLoaded: true,
      };
    case "SET_APPLICATIONS":
      return {
        ...state,
        applications: action.payload,
        loading: false,
        applicationsLoaded: true,
      };
    case "SET_BOOKMARKS":
      return {
        ...state,
        bookmarks: action.payload,
        loading: false,
        bookmarksLoaded: true,
      };
    case "ADD_BOOKMARK":
      return { ...state, bookmarks: [...state.bookmarks, action.payload] };
    case "REMOVE_BOOKMARK":
      return {
        ...state,
        bookmarks: state.bookmarks.filter((b) => b.id !== action.payload),
      };
    case "UPDATE_APPLICATION_STATUS":
      return {
        ...state,
        applications: state.applications.map((app) =>
          app.id === action.payload.id
            ? { ...app, status: action.payload.status }
            : app,
        ),
      };
    case "CLEAR_DATA":
      console.log(
        "CandidateContext: Clearing all data - resetting to initial state",
      );
      return {
        ...initialState,
        // Ensure all fields are explicitly reset
        profile: null,
        applications: [],
        bookmarks: [],
        loading: false,
        error: null,
        profileLoaded: false,
        applicationsLoaded: false,
        bookmarksLoaded: false,
      };
    case "CLEAR_PROFILE":
      return { ...state, profile: null, profileLoaded: false };
    default:
      return state;
  }
};

export const CandidateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(candidateReducer, initialState);
  const { success: showSuccess, error: showError } = useToast();

  // Clear candidate data when user becomes unauthenticated
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue) {
        console.log(
          "CandidateContext: Token removed from storage, clearing candidate data",
        );
        dispatch({ type: "CLEAR_DATA" });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setLoading = (loading) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: "SET_ERROR", payload: error });
    if (error) {
      showError(error);
    }
  };

  // Profile operations with improved caching
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    // Prevent duplicate calls more effectively
    if (state.profileLoaded && state.profile && !forceRefresh) {
      console.log("Profile already loaded, skipping fetch");
      return state.profile;
    }

    if (state.loading) {
      console.log("Profile fetch already in progress, skipping");
      return new Promise((resolve) => {
        // Wait for current fetch to complete
        const checkLoading = () => {
          if (!state.loading) {
            resolve(state.profile);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    try {
      setLoading(true);
      console.log("Fetching profile data...");
      const response = await candidateApi.getProfile();
      console.log("Profile API response received");

      // Handle API response structure - check different possible structures
      let profile = null;
      if (response?.data?.data) {
        // Standard wrapped response: { data: { data: profile } }
        profile = response.data.data;
      } else if (response?.data?.success && response?.data) {
        // Success response: { data: { success: true, data: profile } }
        profile = response.data.data || response.data;
      } else if (response?.data) {
        // Direct response: { data: profile }
        profile = response.data;
      }

      // Sanitize profile data to prevent React rendering issues
      if (profile) {
        // Ensure arrays are actually arrays
        if (profile.skills && !Array.isArray(profile.skills)) {
          profile.skills = [];
        }
        if (profile.experience && !Array.isArray(profile.experience)) {
          profile.experience = [];
        }
        if (profile.education && !Array.isArray(profile.education)) {
          profile.education = [];
        }

        // Ensure string fields are actually strings
        const stringFields = ["bio", "currentJobTitle", "location", "name"];
        stringFields.forEach((field) => {
          if (profile[field] && typeof profile[field] !== "string") {
            profile[field] = String(profile[field]);
          }
        });

        // Sync localStorage with database onboarding state if available
        if (typeof profile.onboardingCompleted === "boolean") {
          if (profile.onboardingCompleted) {
            localStorage.setItem("onboardingCompleted", "true");
            localStorage.removeItem("showOnboarding");
          } else {
            localStorage.removeItem("onboardingCompleted");
          }
        }
      }

      console.log("Profile data processed and cached");
      dispatch({ type: "SET_PROFILE", payload: profile });
      return profile;
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError(error.message || "Failed to load profile");
      dispatch({ type: "SET_PROFILE", payload: null });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (profileData) => {
      try {
        setLoading(true);
        const response = await candidateApi.updateProfile(profileData);
        console.log("Update profile API response:", response);
        // Handle API response structure - check different possible structures
        let updatedProfile = null;
        if (response?.data?.data) {
          // Standard wrapped response: { data: { data: profile } }
          updatedProfile = response.data.data;
        } else if (response?.data?.success && response?.data) {
          // Success response: { data: { success: true, data: profile } }
          updatedProfile = response.data.data || response.data;
        } else if (response?.data) {
          // Direct response: { data: profile }
          updatedProfile = response.data;
        }
        console.log("Extracted updated profile data:", updatedProfile);
        dispatch({ type: "SET_PROFILE", payload: updatedProfile });
        showSuccess("Profile updated successfully");
        return updatedProfile;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [showSuccess],
  );

  // Applications operations with improved caching
  const fetchApplications = useCallback(
    async (params = {}, forceRefresh = false) => {
      // This useCallback was not intended to receive page, limit, status, so we ignore them
      // and use params object instead.
      const page = params.page || 0;
      const limit = params.limit || 10;
      const status = params.status || "";

      // Always make API call unless it's explicitly cached request
      // Remove the check that was preventing API calls when data exists

      try {
        setLoading(true);
        console.log("Fetching applications data...");
        const response = await candidateApi.getApplications(page, limit, status);
        console.log("fetchApplications response:", response);

        // Standardize to data.data structure
        let applicationsData = [];

        if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
          // Handle nested data structure (data.data.data) - extract to data.data level
          applicationsData = response.data.data.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Handle direct data structure (already at data.data level)
          applicationsData = response.data.data;
        } else if (response.data?.jobs && Array.isArray(response.data.jobs)) {
          // Handle jobs array structure
          applicationsData = response.data.jobs;
        } else {
          console.warn("Unexpected applications response structure:", response);
          applicationsData = [];
        }

        dispatch({ type: "SET_APPLICATIONS", payload: applicationsData });
        console.log("fetchApplications - standardized data:", applicationsData);
        return applicationsData;
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError(error.message);
        dispatch({ type: "SET_APPLICATIONS", payload: [] });
        return [];
      } finally {
        setLoading(false);
      }
    },
    [], // Remove state.applicationsLoaded dependency to prevent recreation
  );

  const applyToJob = async (jobId) => {
    try {
      await candidateApi.applyToJob(jobId);
      showSuccess("Application submitted successfully");
      fetchApplications(); // Refresh applications
      fetchBookmarks(); // Refresh bookmarks to update hasApplied status
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Bookmarks operations
  const fetchBookmarks = useCallback(
    async (params = {}) => {
      // This useCallback was not intended to receive page, limit, so we ignore them
      // and use params object instead.
      const page = params.page || 0;
      const limit = params.limit || 10;

      try {
        setLoading(true);
        const response = await candidateApi.getBookmarks(page, limit);
        console.log("fetchBookmarks response:", response);

        // Standardize to data.data structure
        let bookmarksData = [];

        if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
          // Handle nested data structure (data.data.data) - extract to data.data level
          bookmarksData = response.data.data.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Handle direct data structure (already at data.data level)
          bookmarksData = response.data.data;
        } else if (response.data?.jobs && Array.isArray(response.data.jobs)) {
          // Handle jobs array structure
          bookmarksData = response.data.jobs;
        } else {
          console.warn("Unexpected bookmarks response structure:", response);
          bookmarksData = [];
        }

        dispatch({ type: "SET_BOOKMARKS", payload: bookmarksData });
        console.log("fetchBookmarks - standardized data:", bookmarksData);
        return bookmarksData;
      } catch (error) {
        console.error("Fetch bookmarks error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [], // Remove state.loading dependency to prevent recreation
  );

  const addBookmark = async (jobId) => {
    try {
      const response = await candidateApi.addBookmark(jobId);
      const bookmark = response?.data || {};
      dispatch({ type: "ADD_BOOKMARK", payload: bookmark });
      showSuccess("Job bookmarked successfully");
      return bookmark;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const removeBookmark = async (jobId) => {
    try {
      await candidateApi.removeBookmark(jobId);
      // Refetch bookmarks to get updated list from server
      fetchBookmarks();
      showSuccess("Bookmark removed successfully");
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Resume operations
  const uploadResume = async (file) => {
    try {
      setLoading(true);
      const resume = await candidateApi.uploadResume(file);
      // Update profile with new resume
      if (state.profile) {
        dispatch({
          type: "SET_PROFILE",
          payload: { ...state.profile, resume },
        });
      }
      showSuccess("Resume uploaded successfully");
      return resume;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteResume = async () => {
    try {
      await candidateApi.deleteResume();
      // Update profile to remove resume
      if (state.profile) {
        dispatch({
          type: "SET_PROFILE",
          payload: { ...state.profile, resume: null },
        });
      }
      showSuccess("Resume deleted successfully");
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearData = useCallback(() => {
    console.log("CandidateContext: Clearing all candidate data");
    dispatch({ type: "CLEAR_DATA" });
  }, []);

  const resetLoadingStates = useCallback(() => {
    console.log(
      "CandidateContext: Resetting loading states for fresh data fetch",
    );
    dispatch({ type: "CLEAR_DATA" });
  }, []);

  // Make clearData globally accessible for logout
  useEffect(() => {
    window.candidateContext = { clearData };
    return () => {
      delete window.candidateContext;
    };
  }, [clearData]);

  const value = useMemo(
    () => ({
      ...state,
      fetchProfile,
      updateProfile,
      fetchApplications,
      applyToJob,
      fetchBookmarks,
      addBookmark,
      removeBookmark,
      uploadResume,
      deleteResume,
      clearData,
      resetLoadingStates,
      dispatch,
    }),
    [
      state,
      fetchProfile,
      updateProfile,
      fetchApplications,
      fetchBookmarks,
      clearData,
      resetLoadingStates,
    ],
  );

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
};

// Custom hook to use the candidate context
const useCandidate = () => {
  const context = useContext(CandidateContext);
  if (context === undefined) {
    throw new Error("useCandidate must be used within a CandidateProvider");
  }
  return context;
};

export { useCandidate };