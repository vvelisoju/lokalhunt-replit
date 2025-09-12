import React, { useState, useEffect } from "react";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Button from "../../ui/Button";
import { getShiftPreferenceOptions } from "../../../utils/enums";
import { useAppData } from "../../../context/AppDataContext";

const JobPreferencesStep = ({
  data,
  updateData,
  onNext,
  onBack,
  onSkip,
  stepTitle,
}) => {
  // Get data from AppDataContext
  const { categories, loading: { categories: categoriesLoading } } = useAppData();

  // Shift preference options from enums
  const shiftOptions = getShiftPreferenceOptions();

  // Process categories data properly
  const categoriesArray = Array.isArray(categories) ? categories : [];
  const isDataReady = !categoriesLoading && categoriesArray.length > 0;

  // Define specific job roles (different from categories)
  const jobRoles = [
    { id: 1, name: "Delivery Driver", description: "Deliver products and packages to customers" },
    { id: 2, name: "Sales Executive", description: "Drive sales and customer acquisition" },
    { id: 3, name: "Customer Support", description: "Provide customer service and support" },
    { id: 4, name: "Retail Associate", description: "Assist customers in retail stores" },
    { id: 5, name: "Food Service", description: "Prepare and serve food in restaurants" },
    { id: 6, name: "Security Guard", description: "Provide security services for premises" },
    { id: 7, name: "Electrician", description: "Install and maintain electrical systems" },
    { id: 8, name: "Data Entry Operator", description: "Enter and maintain database information" },
    { id: 9, name: "House Keeping", description: "Maintain cleanliness and organization" },
    { id: 10, name: "Driver", description: "Operate vehicles for transportation services" },
    { id: 11, name: "Field Sales", description: "Conduct sales activities in the field" },
    { id: 12, name: "Cook", description: "Prepare food in kitchen environments" },
    { id: 13, name: "Waiter", description: "Serve customers in restaurants" },
    { id: 14, name: "Cashier", description: "Handle customer transactions" },
    { id: 15, name: "Office Assistant", description: "Provide administrative support" },
    { id: 16, name: "Receptionist", description: "Manage front desk and customer inquiries" },
    { id: 17, name: "Telecaller", description: "Handle customer calls and inquiries" },
    { id: 18, name: "Store Manager", description: "Manage retail store operations" },
    { id: 19, name: "Supervisor", description: "Oversee team operations" },
    { id: 20, name: "Mechanic", description: "Repair and maintain vehicles/equipment" }
  ];

  // Use categories for industry selection (this is correct)
  const availableIndustries = categoriesArray.map((category) => category.name);

  // Debug logging
  console.log("JobPreferencesStep - Debug Info:", {
    categoriesLoading,
    categoriesLength: categoriesArray.length,
    isDataReady,
    jobRolesLength: jobRoles.length,
    availableIndustriesLength: availableIndustries.length,
  });

  const handleToggle = (field, value) => {
    const current = data[field] || [];
    if (current.includes(value)) {
      updateData({ [field]: current.filter((item) => item !== value) });
    } else {
      updateData({ [field]: [...current, value] });
    }
  };

  // Handle industry toggle
  const handleIndustryToggle = (industry) => {
    handleToggle("industry", industry);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {stepTitle}
        </h2>
        <span className="text-sm text-gray-500 font-medium">2 of 4</span>
      </div>

      <div className="space-y-6">
        {/* Preferred Roles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
            Preferred Roles
            <span className="text-xs text-gray-500 ml-1">
              (Select multiple)
            </span>
          </label>

          {jobRoles.length > 0 ? (
            <div
              className="border border-gray-200 rounded-xl p-4 bg-gray-50"
              style={{ height: "300px", overflowY: "auto" }}
            >
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                  Available Job Categories ({jobRoles.length})
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {jobRoles.map((role, index) => (
                    <button
                      key={role.id || `role-${index}`}
                      onClick={() => handleToggle("preferredRoles", role.name)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 text-left ${
                        (data.preferredRoles || []).includes(role.name)
                          ? "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                      }`}
                      title={role.description || role.name}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <BriefcaseIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>No job categories available at the moment</p>
            </div>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
            Preferred Industry
            <span className="text-xs text-gray-500 ml-1">
              (Select multiple)
            </span>
          </label>
          {!isDataReady ? (
            <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading industries...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableIndustries.map((industry) => (
                <button
                  key={industry}
                  onClick={() => handleIndustryToggle(industry)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border-2 ${
                    (data.industry || []).includes(industry)
                      ? "bg-purple-100 text-purple-800 border-purple-300 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  {industry}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shift Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="w-4 h-4 inline mr-1" />
            Shift Preference
          </label>
          <select
            value={data.shiftPreference || ""}
            onChange={(e) => updateData({ shiftPreference: e.target.value })}
            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
          >
            <option value="">Select shift preference</option>
            {shiftOptions.map((shift) => (
              <option key={shift.value} value={shift.value}>
                {shift.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons - Mobile optimized */}
      <div className="pt-6 space-y-3">
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button variant="primary" onClick={onNext} className="flex-1">
            Next Step
          </Button>
        </div>
        <Button variant="outline" onClick={onSkip} className="w-full">
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default JobPreferencesStep;