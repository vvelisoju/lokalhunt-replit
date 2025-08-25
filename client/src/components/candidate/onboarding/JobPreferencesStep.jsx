
import React from 'react';
import { BriefcaseIcon, BuildingOfficeIcon, ClockIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const JobPreferencesStep = ({ data, updateData, onNext, onBack, onSkip, isFirstStep, stepTitle }) => {
  const roles = [
    'Software Engineer',
    'Web Developer',
    'Mobile Developer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'DevOps Engineer',
    'Quality Assurance',
    'Business Analyst',
    'Digital Marketing',
    'Sales Executive',
    'Customer Support',
    'Content Writer',
    'Graphic Designer',
    'Project Manager'
  ];

  const industries = [
    'Information Technology',
    'Healthcare',
    'Education',
    'Finance & Banking',
    'E-commerce',
    'Manufacturing',
    'Real Estate',
    'Media & Entertainment',
    'Travel & Tourism',
    'Food & Beverage',
    'Automotive',
    'Telecommunications',
    'Government',
    'Non-profit',
    'Consulting'
  ];

  const shifts = [
    'Day Shift (9 AM - 6 PM)',
    'Night Shift (10 PM - 7 AM)',
    'Flexible Hours',
    'Rotational Shifts',
    'Weekend Only'
  ];

  const handleToggle = (field, value) => {
    const current = data[field] || [];
    if (current.includes(value)) {
      updateData({ [field]: current.filter(item => item !== value) });
    } else {
      updateData({ [field]: [...current, value] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
        <span className="text-sm text-gray-500 font-medium">2 of 5</span>
      </div>

      <div className="space-y-6">
        {/* Preferred Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
            Preferred Roles
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => handleToggle('preferredRoles', role)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  (data.preferredRoles || []).includes(role)
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
            Industry Preference
          </label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => handleToggle('industry', industry)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  (data.industry || []).includes(industry)
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Shift Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="w-4 h-4 inline mr-1" />
            Shift Preference
          </label>
          <select
            value={data.shiftPreference}
            onChange={(e) => updateData({ shiftPreference: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Select shift preference</option>
            {shifts.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 space-y-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={onNext}
            className="flex-1"
          >
            Next Step
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={onSkip}
          className="w-full"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default JobPreferencesStep;
