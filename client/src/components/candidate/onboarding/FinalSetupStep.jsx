
import React, { useState } from 'react';
import { CalendarIcon, LanguageIcon, DocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const FinalSetupStep = ({ data, updateData, onNext, onBack, onSkip, isSubmitting, stepTitle }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const availabilityOptions = [
    'Immediately',
    'Within 2 weeks',
    'Within 1 month',
    '2-3 months',
    'More than 3 months'
  ];

  const languageOptions = [
    'English',
    'Hindi',
    'Telugu',
    'Tamil',
    'Kannada',
    'Malayalam',
    'Bengali',
    'Marathi',
    'Gujarati',
    'Punjabi',
    'Urdu',
    'Odia'
  ];

  const handleLanguageToggle = (language) => {
    const current = data.languages || [];
    if (current.includes(language)) {
      updateData({ languages: current.filter(l => l !== language) });
    } else {
      updateData({ languages: [...current, language] });
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateData({ resume: file });
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setTimeout(() => {
      onNext();
    }, 2000);
  };

  if (isCompleted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Congratulations! 🎉
        </h2>
        <p className="text-gray-600 mb-6">
          Your profile has been set up successfully. You can now explore jobs that match your preferences!
        </p>
        <div className="w-16 h-1 bg-green-500 rounded mx-auto animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
        <span className="text-sm text-gray-500 font-medium">5 of 5</span>
      </div>

      <div className="space-y-6">
        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            When are you available to start?
          </label>
          <select
            value={data.availability}
            onChange={(e) => updateData({ availability: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Select availability</option>
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <LanguageIcon className="w-4 h-4 inline mr-1" />
            Languages you speak
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {languageOptions.map((language) => (
              <button
                key={language}
                onClick={() => handleLanguageToggle(language)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  (data.languages || []).includes(language)
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <DocumentIcon className="w-4 h-4 inline mr-1" />
            Upload Resume (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <DocumentIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              {data.resume ? data.resume.name : 'Upload your resume to get better job matches'}
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              {data.resume ? 'Change Resume' : 'Choose File'}
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            className="flex-1"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Complete Setup
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={onSkip}
          className="w-full"
          disabled={isSubmitting}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default FinalSetupStep;
