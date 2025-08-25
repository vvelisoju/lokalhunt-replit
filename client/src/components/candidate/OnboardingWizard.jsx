
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import BasicInfoStep from './onboarding/BasicInfoStep';
import JobPreferencesStep from './onboarding/JobPreferencesStep';
import SkillsExperienceStep from './onboarding/SkillsExperienceStep';
import SalaryConditionsStep from './onboarding/SalaryConditionsStep';
import FinalSetupStep from './onboarding/FinalSetupStep';
import { candidateApi } from '../../services/candidateApi';
import { toast } from 'react-hot-toast';

const OnboardingWizard = ({ onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Info
    location: '',
    workType: [],
    currentStatus: '',
    
    // Job Preferences
    preferredRoles: [],
    industry: [],
    shiftPreference: '',
    
    // Skills & Experience
    skills: [],
    experienceLevel: '',
    
    // Salary & Work Conditions
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    relocationWilling: '',
    maxWorkDistance: '',
    
    // Final Setup
    availability: '',
    languages: [],
    resume: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  const stepTitles = [
    'Basic Information',
    'Job Preferences', 
    'Skills & Experience',
    'Salary & Conditions',
    'Final Setup'
  ];

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('onboardingProgress');
    const savedStep = localStorage.getItem('onboardingStep');
    
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('onboardingProgress', JSON.stringify(formData));
    localStorage.setItem('onboardingStep', currentStep.toString());
  }, [formData, currentStep]);

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
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
    setIsSubmitting(true);
    try {
      // Save onboarding data to backend
      await candidateApi.updateProfile({
        onboardingCompleted: true,
        onboardingData: formData
      });

      // Clear localStorage
      localStorage.removeItem('onboardingProgress');
      localStorage.removeItem('onboardingStep');

      toast.success('Onboarding completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save onboarding data. Please try again.');
    } finally {
      setIsSubmitting(false);
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
      isSubmitting,
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
        return <SalaryConditionsStep {...stepProps} />;
      case 5:
        return <FinalSetupStep {...stepProps} />;
      default:
        return null;
    }
  };

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
