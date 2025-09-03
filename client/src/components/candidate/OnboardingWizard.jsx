import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import BasicInfoStep from './onboarding/BasicInfoStep';
import JobPreferencesStep from './onboarding/JobPreferencesStep';
import SkillsExperienceStep from './onboarding/SkillsExperienceStep';
import FinalSetupStep from './onboarding/FinalSetupStep';
import { candidateApi } from '../../services/candidateApi';
import { toast } from 'react-hot-toast';

const OnboardingWizard = ({ onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Step 1 - Basic Info
    location: '',
    preferredJobTypes: [],
    currentStatus: '',

    // Step 2 - Job Preferences
    preferredRoles: [],
    industry: [],
    shiftPreference: '',

    // Step 3 - Skills & Experience
    skills: [],
    experienceLevel: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',

    // Step 4 - Final Setup
    availability: '',
    languages: [],
    resume: null
  });
  const totalSteps = 4;

  // Structure flat onboarding data into server-expected format
  const structureOnboardingData = (data) => {
    return {
      basicInfo: {
        // Location should update user.cityId
        cityId: data.location,
        currentEmploymentStatus: data.currentStatus
      },
      jobPreferences: {
        jobTitles: data.preferredRoles || [],
        industry: data.industry || [],
        jobTypes: data.preferredJobTypes || [],
        shiftPreference: data.shiftPreference,
        languages: data.languages || [],
        salaryRange: {
          min: data.expectedSalaryMin ? parseFloat(data.expectedSalaryMin) : null,
          max: data.expectedSalaryMax ? parseFloat(data.expectedSalaryMax) : null
        }
      },
      skillsExperience: {
        skills: (data.skills || []).map(skill => ({
          name: skill.name || skill,
          experience: data.experienceLevel || 'ENTRY_LEVEL'
        })),
        experienceLevel: data.experienceLevel,
        availabilityDate: data.availability
      },
      // Include final setup data which might contain resume upload status
      finalSetup: data.resume ? { resume: data.resume } : {}
    };
  };

  const stepTitles = [
    'Job Basics',
    'Job Preferences',
    'Skills & Salary',
    'Final Setup'
  ];

  // Convert structured API data back to flat format for wizard
  const flattenOnboardingData = (apiData, userData = {}) => {
    const { basicInfo, jobPreferences, skillsExperience, finalSetup } = apiData;

    return {
      // Step 1 - Basic Info
      location: userData.cityId || '', // Get from user data
      preferredJobTypes: jobPreferences?.jobTypes || [],
      currentStatus: basicInfo?.currentEmploymentStatus || '',

      // Step 2 - Job Preferences
      preferredRoles: jobPreferences?.jobTitles || [],
      industry: jobPreferences?.industry || [],
      shiftPreference: jobPreferences?.shiftPreference || '',

      // Step 3 - Skills & Experience
      skills: skillsExperience?.skills || [],
      experienceLevel: skillsExperience?.experienceLevel || '',
      expectedSalaryMin: jobPreferences?.salaryRange?.min || '',
      expectedSalaryMax: jobPreferences?.salaryRange?.max || '',

      // Step 4 - Final Setup
      availability: skillsExperience?.availabilityDate || '',
      languages: jobPreferences?.languages || [],
      resume: finalSetup?.resume || null // Resume file would need to be handled separately
    };
  };

  // Load saved progress from API and localStorage fallback
  useEffect(() => {
    const loadOnboardingData = async () => {
      try {
        setInitialLoading(true);

        // Try to load from API first
        const response = await candidateApi.getOnboardingData();
        if (response.data.success && response.data.data) {
          const { basicInfo, jobPreferences, skillsExperience, onboardingProgress, candidate, finalSetup } = response.data.data;

          // Convert structured data back to flat format
          const flatData = flattenOnboardingData(
            { basicInfo, jobPreferences, skillsExperience, finalSetup },
            candidate?.user // Pass user data for cityId
          );
          setFormData(flatData);
          setCurrentStep(onboardingProgress?.currentStep || 1);
          console.log('Onboarding data loaded from database');
        } else {
          // Fallback to localStorage if API doesn't have data
          const localData = localStorage.getItem('onboardingProgress');
          if (localData) {
            const parsed = JSON.parse(localData);
            setFormData(parsed.data);
            setCurrentStep(parsed.currentStep || 1);
            console.log('Onboarding data loaded from localStorage fallback');
          }
        }
      } catch (error) {
        console.error('Error loading onboarding progress from database:', error);

        // Fallback to localStorage
        try {
          const localData = localStorage.getItem('onboardingProgress');
          if (localData) {
            const parsed = JSON.parse(localData);
            setFormData(parsed.data);
            setCurrentStep(parsed.currentStep || 1);
            console.log('Onboarding data loaded from localStorage after API error');
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadOnboardingData();
  }, []);

  // Save progress to API and localStorage backup
  const saveProgress = async (stepData, step) => {
    try {
      const updatedData = { ...formData, ...stepData };
      setFormData(updatedData);

      // Save to localStorage as backup
      localStorage.setItem('onboardingProgress', JSON.stringify({
        data: updatedData,
        currentStep: step,
        timestamp: Date.now()
      }));

      // Structure data properly for the API
      const structuredData = structureOnboardingData(updatedData);

      const saveData = {
        step,
        ...structuredData,
        isCompleted: false
      };

      await candidateApi.saveOnboardingData(saveData);
      console.log('Onboarding progress saved successfully to database');
    } catch (error) {
      console.error('Error saving onboarding progress to database:', error);
      toast.error('Progress saved locally, will sync when connection improves');
    }
  };

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Before moving to the next step, save the current step's data
      const currentStepKey = Object.keys(formData)[currentStep - 1];
      saveProgress({ [currentStepKey]: formData[currentStepKey] }, currentStep + 1);
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Before moving to the previous step, save the current step's data
      const currentStepKey = Object.keys(formData)[currentStep - 1];
      saveProgress({ [currentStepKey]: formData[currentStepKey] }, currentStep - 1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);

      // Structure data properly for the API
      const structuredData = structureOnboardingData(formData);

      // Combine data from all steps, including final setup for resume
      const finalData = {
        step: 4,
        basicInfo: structuredData.basicInfo,
        jobPreferences: structuredData.jobPreferences,
        skillsExperience: {
          ...structuredData.skillsExperience,
          // Resume information is already uploaded via API, just include metadata if available
          resumeUploaded: structuredData.finalSetup?.resume?.uploaded || false
        },
        isCompleted: true
      };

      await candidateApi.saveOnboardingData(finalData);

      // Clear localStorage backup since data is now in database
      localStorage.removeItem('onboardingProgress');
      
      // Sync localStorage with database state - mark as completed
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.removeItem('showOnboarding');

      console.log('Onboarding completed with data:', formData);

      toast.success('Onboarding completed successfully!');
      onComplete?.(formData);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data: formData,
      updateData: updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      onSkip: handleSkip,
      isFirstStep: currentStep === 1,
      isLastStep: currentStep === totalSteps,
      isSubmitting: loading,
      stepTitle: stepTitles[currentStep - 1]
    };

    switch (currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <JobPreferencesStep {...stepProps} />;
      case 3:
        return <SkillsExperienceStep {...stepProps} />;
      case 4:
        return <FinalSetupStep {...stepProps} />;
      default:
        return null;
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading onboarding data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-4 px-4 sm:py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <img
              src="/images/logo.png"
              alt="LokalHunt"
              className="h-14 mx-auto mb-4"
            />
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;