
import React from 'react';
import { CurrencyDollarIcon, MapIcon, TruckIcon } from '@heroicons/react/24/outline';
import Button from '../../ui/Button';

const SalaryConditionsStep = ({ data, updateData, onNext, onBack, onSkip, stepTitle }) => {
  const relocationOptions = [
    { value: 'yes', label: 'Yes, I am open to relocating' },
    { value: 'no', label: 'No, I prefer to work locally' },
    { value: 'maybe', label: 'Maybe, depending on the opportunity' }
  ];

  const distanceOptions = [
    '5 km',
    '10 km', 
    '15 km',
    '25 km',
    '50 km',
    'No preference'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
        <span className="text-sm text-gray-500 font-medium">4 of 5</span>
      </div>

      <div className="space-y-6">
        {/* Expected Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
            Expected Salary Range (Annual)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Minimum (₹)</label>
              <input
                type="number"
                value={data.expectedSalaryMin}
                onChange={(e) => updateData({ expectedSalaryMin: e.target.value })}
                placeholder="e.g., 300000"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Maximum (₹)</label>
              <input
                type="number"
                value={data.expectedSalaryMax}
                onChange={(e) => updateData({ expectedSalaryMax: e.target.value })}
                placeholder="e.g., 500000"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty if you prefer not to specify
          </p>
        </div>

        {/* Relocation Willingness */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <MapIcon className="w-4 h-4 inline mr-1" />
            Are you willing to relocate for the right opportunity?
          </label>
          <div className="space-y-3">
            {relocationOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => updateData({ relocationWilling: option.value })}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  data.relocationWilling === option.value
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    data.relocationWilling === option.value
                      ? 'bg-yellow-600 border-yellow-600'
                      : 'border-gray-300'
                  }`} />
                  <span className="text-gray-900">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maximum Work Distance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <TruckIcon className="w-4 h-4 inline mr-1" />
            Maximum distance you're willing to travel to work
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {distanceOptions.map((distance) => (
              <button
                key={distance}
                onClick={() => updateData({ maxWorkDistance: distance })}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                  data.maxWorkDistance === distance
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {distance}
              </button>
            ))}
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

export default SalaryConditionsStep;
