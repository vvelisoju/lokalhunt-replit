import React, { useState } from 'react';
import { CalendarIcon, LanguageIcon, DocumentIcon, CheckCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import { candidateApi } from '../../../services/candidateApi';
import { useToast } from "../../ui/Toast"; // Assuming useToast is in this path

const FinalSetupStep = ({ data, updateData, onNext, onBack, onSkip, isSubmitting, stepTitle }) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  // Availability options from database enum
  const availabilityOptions = [
    { value: 'IMMEDIATELY', label: 'Immediately' },
    { value: 'WITHIN_1_WEEK', label: 'Within 1 week' },
    { value: 'WITHIN_1_MONTH', label: 'Within 1 month' },
    { value: 'PLUS_2_MONTHS', label: '2+ months' }
  ];

  // Language options from database enum  
  const languageOptions = [
    { value: 'ENGLISH', label: 'English' },
    { value: 'HINDI', label: 'Hindi' },
    { value: 'TELUGU', label: 'Telugu' },
    { value: 'TAMIL', label: 'Tamil' },
    { value: 'KANNADA', label: 'Kannada' },
    { value: 'MALAYALAM', label: 'Malayalam' },
    { value: 'BENGALI', label: 'Bengali' },
    { value: 'MARATHI', label: 'Marathi' },
    { value: 'GUJARATI', label: 'Gujarati' },
    { value: 'PUNJABI', label: 'Punjabi' },
    { value: 'URDU', label: 'Urdu' },
    { value: 'ODIA', label: 'Odia' }
  ];

  const handleLanguageToggle = (languageValue) => {
    const current = data.languages || [];
    if (current.includes(languageValue)) {
      updateData({ languages: current.filter(l => l !== languageValue) });
    } else {
      updateData({ languages: [...current, languageValue] });
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', '.pdf', 'application/msword', '.doc', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || allowedTypes.includes(fileExtension);

    if (!isValidType) {
      toast.error('Please select a valid file type: PDF, DOC, or DOCX');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`File size (${fileSizeInMB}MB) exceeds the 5MB limit. Please choose a smaller file.`);
      return;
    }

    try {
      setIsUploadingResume(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload resume using the candidate API
      const uploadedResume = await candidateApi.uploadResume(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update the data with resume information
      updateData({ 
        resume: {
          file: file,
          uploaded: true,
          url: uploadedResume.data?.url,
          fileName: uploadedResume.data?.fileName || file.name,
          fileSize: uploadedResume.data?.fileSize || file.size
        }
      });

      setTimeout(() => {
        setUploadProgress(0);
        setIsUploadingResume(false);
        toast.success('Resume uploaded successfully!');
      }, 500);

    } catch (error) {
      console.error('Resume upload failed:', error);
      setUploadProgress(0);
      setIsUploadingResume(false);

      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload resume';
      toast.error(`Upload failed: ${errorMessage}`);
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
        <span className="text-sm text-gray-500 font-medium">4 of 4</span>
      </div>

      <div className="space-y-6">
        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            When are you available to start?
          </label>
          <select
            value={data.availability || ''}
            onChange={(e) => updateData({ availability: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base bg-white"
          >
            <option value="">Select availability</option>
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
                key={language.value}
                onClick={() => handleLanguageToggle(language.value)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  (data.languages || []).includes(language.value)
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {language.label}
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

          {isUploadingResume ? (
            <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center">
              <CloudArrowUpIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-600 mb-3">Uploading resume...</p>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-500">{uploadProgress}% complete</p>
            </div>
          ) : (
            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              data.resume?.uploaded ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`}>
              {data.resume?.uploaded ? (
                <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              ) : (
                <DocumentIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              )}

              <p className="text-sm text-gray-600 mb-3">
                {data.resume?.uploaded 
                  ? `✅ ${data.resume.fileName} uploaded successfully`
                  : 'Upload your resume to get better job matches'
                }
              </p>

              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
                id="resume-upload"
                disabled={isUploadingResume}
              />

              <label
                htmlFor="resume-upload"
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium cursor-pointer transition-colors ${
                  data.resume?.uploaded
                    ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {data.resume?.uploaded ? 'Change Resume' : 'Choose File'}
              </label>

              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, DOC, DOCX (Max 5MB)
              </p>

              {data.resume?.uploaded && (
                <p className="text-xs text-green-600 mt-1">
                  File size: {((data.resume.fileSize || 0) / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            disabled={isSubmitting || isUploadingResume}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            className="flex-1"
            loading={isSubmitting}
            disabled={isSubmitting || isUploadingResume}
          >
            Complete Setup
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={onSkip}
          className="w-full"
          disabled={isSubmitting || isUploadingResume}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default FinalSetupStep;