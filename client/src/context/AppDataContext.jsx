
import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { publicApi } from '../services/publicApi';
import { useToast } from '../components/ui/Toast';

// Initial state
const initialState = {
  cities: [],
  categories: [],
  educationQualifications: [],
  skills: [],
  loading: {
    cities: false,
    categories: false,
    educationQualifications: false,
    skills: false,
  },
  loaded: {
    cities: false,
    categories: false,
    educationQualifications: false,
    skills: false,
  },
  error: null,
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_DATA: 'SET_DATA',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const appDataReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      };

    case actionTypes.SET_DATA:
      return {
        ...state,
        [action.payload.key]: action.payload.data,
        loading: {
          ...state.loading,
          [action.payload.key]: false,
        },
        loaded: {
          ...state.loaded,
          [action.payload.key]: true,
        },
        error: null,
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: {
          cities: false,
          categories: false,
          educationQualifications: false,
          skills: false,
        },
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AppDataContext = createContext();

// Provider component
export const AppDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appDataReducer, initialState);
  const { error: showError } = useToast();

  const setLoading = useCallback((key, loading) => {
    dispatch({
      type: actionTypes.SET_LOADING,
      payload: { key, loading },
    });
  }, []);

  const setData = useCallback((key, data) => {
    dispatch({
      type: actionTypes.SET_DATA,
      payload: { key, data },
    });
  }, []);

  const setError = useCallback((error) => {
    dispatch({
      type: actionTypes.SET_ERROR,
      payload: error,
    });
    // Don't show toast errors for data loading failures to prevent UI spam
    console.warn('AppDataContext Error:', error);
  }, []);

  // Track ongoing requests to prevent duplicate calls
  const ongoingRequests = useRef({
    cities: null,
    categories: null,
    educationQualifications: null,
    skills: null
  });

  // Fetch cities
  const fetchCities = useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    if (state.loaded.cities && !forceRefresh) {
      console.log('Cities already loaded, skipping fetch');
      return state.cities;
    }

    // Return ongoing request if one exists
    if (ongoingRequests.current.cities && !forceRefresh) {
      console.log('Cities request already in progress, waiting...');
      return ongoingRequests.current.cities;
    }

    // Prevent duplicate requests by caching the promise
    ongoingRequests.current.cities = (async () => {
      try {
        setLoading('cities', true);
        console.log('AppDataContext: Fetching cities...');
        
        const response = await publicApi.getCities();
        let citiesData = [];

        if (response.success && response.data) {
          citiesData = response.data;
        } else if (response.data?.data) {
          citiesData = response.data.data;
        } else if (response.data) {
          citiesData = response.data;
        }

        setData('cities', citiesData);
        console.log('AppDataContext: Cities loaded successfully');
        ongoingRequests.current.cities = null; // Clear the request
        return citiesData;
      } catch (error) {
        console.error('AppDataContext: Error fetching cities:', error);
        setError('Failed to load cities');
        ongoingRequests.current.cities = null; // Clear the request
        return [];
      }
    })();

    return ongoingRequests.current.cities;
  }, [state.loaded.cities, state.cities, setLoading, setData, setError]);

  // Fetch categories
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    if (state.loaded.categories && !forceRefresh) {
      console.log('Categories already loaded, skipping fetch');
      return state.categories;
    }

    // Return ongoing request if one exists
    if (ongoingRequests.current.categories && !forceRefresh) {
      console.log('Categories request already in progress, waiting...');
      return ongoingRequests.current.categories;
    }

    // Prevent duplicate requests by caching the promise
    ongoingRequests.current.categories = (async () => {
      try {
        setLoading('categories', true);
        console.log('AppDataContext: Fetching categories...');
        
        const response = await publicApi.getCategories();
        let categoriesData = [];

        if (response.status === "success") {
          categoriesData = response.data;
        } else if (response.data?.data) {
          categoriesData = response.data.data;
        } else if (response.data) {
          categoriesData = response.data;
        }

        setData('categories', categoriesData);
        console.log('AppDataContext: Categories loaded successfully');
        ongoingRequests.current.categories = null; // Clear the request
        return categoriesData;
      } catch (error) {
        console.error('AppDataContext: Error fetching categories:', error);
        setError('Failed to load categories');
        ongoingRequests.current.categories = null; // Clear the request
        return [];
      }
    })();

    return ongoingRequests.current.categories;
  }, [state.loaded.categories, state.categories, setLoading, setData, setError]);

  // Fetch education qualifications
  const fetchEducationQualifications = useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    if (state.loaded.educationQualifications && !forceRefresh) {
      console.log('Education qualifications already loaded, skipping fetch');
      return state.educationQualifications;
    }

    // Return ongoing request if one exists
    if (ongoingRequests.current.educationQualifications && !forceRefresh) {
      console.log('Education qualifications request already in progress, waiting...');
      return ongoingRequests.current.educationQualifications;
    }

    // Prevent duplicate requests by caching the promise
    ongoingRequests.current.educationQualifications = (async () => {
      try {
        setLoading('educationQualifications', true);
        console.log('AppDataContext: Fetching education qualifications...');
        
        const response = await publicApi.getEducationQualifications();
        let educationData = [];

        if (response.status === "success") {
          educationData = response.data;
        } else if (response.data?.data) {
          educationData = response.data.data;
        } else if (response.data) {
          educationData = response.data;
        }

        setData('educationQualifications', educationData);
        console.log('AppDataContext: Education qualifications loaded successfully');
        ongoingRequests.current.educationQualifications = null; // Clear the request
        return educationData;
      } catch (error) {
        console.error('AppDataContext: Error fetching education qualifications:', error);
        setError('Failed to load education qualifications');
        ongoingRequests.current.educationQualifications = null; // Clear the request
        return [];
      }
    })();

    return ongoingRequests.current.educationQualifications;
  }, [state.loaded.educationQualifications, state.educationQualifications, setLoading, setData, setError]);

  // Fetch skills
  const fetchSkills = useCallback(async (forceRefresh = false) => {
    // Return cached data if available and not forcing refresh
    if (state.loaded.skills && !forceRefresh && Array.isArray(state.skills) && state.skills.length > 0) {
      console.log('AppDataContext: Skills already loaded, skipping fetch', state.skills.length);
      return state.skills;
    }

    // Return ongoing request if one exists
    if (ongoingRequests.current.skills && !forceRefresh) {
      console.log('AppDataContext: Skills request already in progress, waiting...');
      return ongoingRequests.current.skills;
    }

    // Prevent duplicate requests by caching the promise
    ongoingRequests.current.skills = (async () => {
      try {
        setLoading('skills', true);
        console.log('AppDataContext: Fetching skills from API...');
        
        const response = await publicApi.getSkills();
        let skillsData = [];

        console.log('AppDataContext: Skills API response:', { 
          status: response?.status, 
          hasData: !!response?.data,
          dataLength: Array.isArray(response?.data) ? response.data.length : 'not array'
        });

        if (response?.status === "success" && Array.isArray(response.data)) {
          skillsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          skillsData = response.data.data;
        } else if (Array.isArray(response?.data)) {
          skillsData = response.data;
        } else {
          console.warn('AppDataContext: Unexpected skills response format:', response);
          skillsData = [];
        }

        console.log('AppDataContext: Processed skills data:', { 
          length: skillsData.length,
          sample: skillsData.slice(0, 3).map(s => ({ id: s.id, name: s.name, category: s.category }))
        });

        setData('skills', skillsData);
        console.log('AppDataContext: Skills loaded successfully');
        ongoingRequests.current.skills = null; // Clear the request
        return skillsData;
      } catch (error) {
        console.error('AppDataContext: Error fetching skills:', error);
        // Don't call setError here to prevent infinite loops
        // Just set empty data and mark as loaded to prevent retries
        setData('skills', []);
        ongoingRequests.current.skills = null; // Clear the request
        return [];
      }
    })();

    return ongoingRequests.current.skills;
  }, [state.loaded.skills, state.skills, setLoading, setData]);

  // Load all data on app initialization
  const loadAllData = useCallback(async () => {
    console.log('AppDataContext: Loading all common data...');
    
    // Fetch all data concurrently for better performance
    await Promise.allSettled([
      fetchCities(),
      fetchCategories(),
      fetchEducationQualifications(),
      fetchSkills(),
    ]);

    console.log('AppDataContext: All common data loading completed');
  }, [fetchCities, fetchCategories, fetchEducationQualifications, fetchSkills]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    fetchCities,
    fetchCategories,
    fetchEducationQualifications,
    fetchSkills,
    loadAllData,
    
    // Helper getters
    getCities: () => state.cities,
    getCategories: () => state.categories,
    getEducationQualifications: () => state.educationQualifications,
    getSkills: () => state.skills,
    
    // Status checkers
    isLoading: () => state.loading.cities || state.loading.categories || state.loading.educationQualifications || state.loading.skills,
    isDataLoaded: () => state.loaded.cities && state.loaded.categories && state.loaded.educationQualifications && state.loaded.skills,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

// Custom hook to use the context
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

export default AppDataContext;
