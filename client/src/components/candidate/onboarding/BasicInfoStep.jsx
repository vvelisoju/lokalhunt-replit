
import React from 'react';
import { MapPinIcon, BriefcaseIcon, UserIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';
import CityDropdown from '../../ui/CityDropdown';

const BasicInfoStep = ({ data, updateData, onNext, onBack, onSkip, isFirstStep, stepTitle }) => {
  const workTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship'
  ];

  const statusOptions = [
    'Actively looking for job',
    'Open to opportunities',
    'Currently employed',
    'Student',
    'Recent graduate',
    'Career break'
  ];

  const handleWorkTypeToggle = (type) => {
    const current = data.workType || [];
    if (current.includes(type)) {
      updateData({ workType: current.filter(t => t !== type) });
    } else {
      updateData({ workType: [...current, type] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
        <span className="text-sm text-gray-500 font-medium">1 of 5</span>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="w-4 h-4 inline mr-1" />
            Current Location
          </label>
          <CityDropdown
            value={data.location}
            onChange={(e) => updateData({ location: e.target.value })}
            placeholder="Select your city"
            className="w-full"
          />
        </div>

        {/* Work Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
            Preferred Work Types
          </label>
          <div className="flex flex-wrap gap-2">
            {workTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleWorkTypeToggle(type)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  (data.workType || []).includes(type)
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Status
          </label>
          <select
            value={data.currentStatus}
            onChange={(e) => updateData({ currentStatus: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your current status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            className="flex-1"
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
