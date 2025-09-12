import React, { useState, useEffect } from "react";
import {
  MapPinIcon,
  BriefcaseIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Button from "../../ui/Button";
import CityDropdown from "../../ui/CityDropdown";
import { useAuth } from "../../../context/AuthContext";
import { getEmploymentTypeOptions, CurrentEmploymentStatus, CurrentEmploymentStatusLabels } from "../../../utils/enums";

const BasicInfoStep = ({
  data = {},
  updateData,
  onNext,
  onBack,
  onSkip,
  isFirstStep,
  stepTitle,
}) => {
  const { user } = useAuth();
  const [selectedCityId, setSelectedCityId] = useState(data?.location || "");

  // Employment types from the EmploymentType enum
  const employmentTypes = getEmploymentTypeOptions();

  // Current employment status options
  const statusOptions = Object.values(CurrentEmploymentStatus).map((value) => ({
    value,
    label: CurrentEmploymentStatusLabels[value],
  }));

  // Auto-select candidate's city if available and not already set
  useEffect(() => {
    if (!selectedCityId && user?.cityId) {
      setSelectedCityId(user.cityId);
      updateData({ location: user.cityId });
    }
  }, [user, selectedCityId, updateData]);

  // Sync selectedCityId with data.location when data changes
  useEffect(() => {
    if (data?.location !== selectedCityId) {
      setSelectedCityId(data?.location || "");
    }
  }, [data?.location]);

  const handleJobTypeToggle = (type) => {
    const current = data?.preferredJobTypes || [];
    if (current.includes(type)) {
      updateData({ preferredJobTypes: current.filter((t) => t !== type) });
    } else {
      updateData({ preferredJobTypes: [...current, type] });
    }
  };

  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    updateData({ location: cityId, cityId: cityId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">{stepTitle}</h2>
        <span className="text-sm text-gray-500 font-medium">1 of 4</span>
      </div>

      <div className="space-y-6">
        {/* Preferred Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPinIcon className="w-4 h-4 inline mr-1" />
            Preferred Location
            <span className="text-xs text-gray-500 ml-1">
              (City / Nearby Area)
            </span>
          </label>
          <CityDropdown
            name="city"
            value={selectedCityId}
            onChange={handleCityChange}
            placeholder="Search and select your preferred city"
            className="mobile-friendly-select"
            hideLabel={true}
          />
          <p className="text-xs text-gray-500 mt-1">
            We'll show you jobs in and around this location
          </p>
        </div>

        {/* Preferred Job Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
            Preferred Job Types
            <span className="text-xs text-gray-500 ml-1">
              (Select multiple)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {employmentTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleJobTypeToggle(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 ${
                  (data?.preferredJobTypes || []).includes(type.value)
                    ? "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="w-4 h-4 inline mr-1" />
            Current Employment Status
          </label>
          <select
            value={data?.currentStatus || ""}
            onChange={(e) => updateData({ currentStatus: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base bg-white"
          >
            <option value="">Select your current status</option>
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-6">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onSkip} className="flex-1">
            Skip for now
          </Button>
          <Button variant="primary" onClick={onNext} className="flex-1">
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;