import React, { useState, useEffect } from "react";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import Button from "../../ui/Button";
import { publicApi } from "../../../services/publicApi";

const JobPreferencesStep = ({
  data,
  updateData,
  onNext,
  onBack,
  onSkip,
  isFirstStep,
  stepTitle,
}) => {
  const [jobRoles, setJobRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shift preference options from enum
  const shiftOptions = [
    { value: "DAY_SHIFT", label: "Day Shift" },
    { value: "NIGHT_SHIFT", label: "Night Shift" },
    { value: "FLEXIBLE_HOURS", label: "Flexible Hours" },
    { value: "WEEKEND_ONLY", label: "Weekend Only" },
  ];

  // Load job roles and categories from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load job roles and categories in parallel
        const [rolesResponse, categoriesResponse] = await Promise.all([
          publicApi.getJobRoles(),
          publicApi.getCategories(),
        ]);

        console.log("Job roles response:", rolesResponse);
        console.log("Categories response:", categoriesResponse);

        // Handle job roles response - check if data exists in response
        if (rolesResponse?.success && rolesResponse?.data) {
          setJobRoles(rolesResponse.data);
        } else if (rolesResponse?.data) {
          // Sometimes the response might not have success flag but still have data
          setJobRoles(rolesResponse.data);
        } else if (Array.isArray(rolesResponse)) {
          // Handle case where response is directly an array
          setJobRoles(rolesResponse);
        } else {
          console.error("Failed to load job roles:", rolesResponse);
          setJobRoles([]); // Set empty array as fallback
        }

        // Handle categories response - check if data exists in response
        if (categoriesResponse?.success && categoriesResponse?.data) {
          setCategories(categoriesResponse.data);
        } else if (categoriesResponse?.data) {
          // Sometimes the response might not have success flag but still have data
          setCategories(categoriesResponse.data);
        } else if (Array.isArray(categoriesResponse)) {
          // Handle case where response is directly an array
          setCategories(categoriesResponse);
        } else {
          console.error("Failed to load categories:", categoriesResponse);
          setCategories([]); // Set empty array as fallback
        }
      } catch (error) {
        console.error("Error loading job data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Debug logging for state changes
  useEffect(() => {
    console.log("Job roles state updated:", jobRoles);
    console.log("Job roles length:", jobRoles?.length);
    console.log("Local roles:", jobRoles?.filter(role => role.category === "local" || !role.category));
    console.log("Tech roles:", jobRoles?.filter(role => role.category === "tech"));
  }, [jobRoles]);

  useEffect(() => {
    console.log("Categories state updated:", categories);
    console.log("Categories length:", categories?.length);
  }, [categories]);

  const handleToggle = (field, value) => {
    const current = data[field] || [];
    if (current.includes(value)) {
      updateData({ [field]: current.filter((item) => item !== value) });
    } else {
      updateData({ [field]: [...current, value] });
    }
  };

  // Group roles by category - ensure jobRoles is an array
  const rolesArray = Array.isArray(jobRoles) ? jobRoles : [];
  const localRoles = rolesArray.filter(
    (role) => role?.category === "local" || !role?.category,
  );
  const techRoles = rolesArray.filter((role) => role?.category === "tech");

  // Ensure categories is an array
  const categoriesArray = Array.isArray(categories) ? categories : [];

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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 text-sm">
                Loading job roles...
              </span>
            </div>
          ) : (
            <>
              {/* Job Roles Container with Fixed Height */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50" style={{ height: '300px', overflowY: 'auto' }}>
                {/* Local Jobs Section */}
                {localRoles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-blue-600 mb-3 uppercase tracking-wide">
                      Popular Local Jobs
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {localRoles.map((role, index) => (
                        <button
                          key={role.id || role.name || `local-role-${index}`}
                          onClick={() =>
                            handleToggle("preferredRoles", role.name)
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 text-left ${
                            (data.preferredRoles || []).includes(role.name)
                              ? "bg-blue-100 text-blue-800 border-blue-300 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                          }`}
                        >
                          {role.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tech Jobs Section - Only show if there are tech roles */}
                {techRoles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                      Tech Jobs
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {techRoles.map((role, index) => (
                        <button
                          key={role.id || role.name || `tech-role-${index}`}
                          onClick={() =>
                            handleToggle("preferredRoles", role.name)
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 text-left ${
                            (data.preferredRoles || []).includes(role.name)
                              ? "bg-purple-100 text-purple-800 border-purple-300 shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-200"
                          }`}
                        >
                          {role.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* No roles available message */}
              {!loading && localRoles.length === 0 && techRoles.length === 0 && (
                <div className="text-sm text-gray-500 py-8 text-center">
                  <BriefcaseIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No job roles available at the moment</p>
                  <p className="text-xs mt-1">Please try again later</p>
                  {/* Debug info */}
                  <p className="text-xs mt-2 text-red-500">
                    Debug: jobRoles.length = {rolesArray.length}, 
                    type = {typeof jobRoles}, 
                    isArray = {Array.isArray(jobRoles).toString()}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Job Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
            Preferred Job Category
            <span className="text-xs text-gray-500 ml-1">(Optional)</span>
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 text-sm">
                Loading categories...
              </span>
            </div>
          ) : categoriesArray.length > 0 ? (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50" style={{ height: '200px', overflowY: 'auto' }}>
              <div className="grid grid-cols-2 gap-2">
                {categoriesArray.map((category, index) => (
                  <button
                    key={category.id || category.name || `category-${index}`}
                    onClick={() => handleToggle("industry", category.name)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 text-left ${
                      (data.industry || []).includes(category.name)
                        ? "bg-green-100 text-green-800 border-green-300 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 py-4 text-center">
              <p>No job categories available</p>
              {/* Debug info */}
              <p className="text-xs mt-2 text-red-500">
                Debug: categories.length = {categoriesArray.length}, 
                type = {typeof categories}, 
                isArray = {Array.isArray(categories).toString()}
              </p>
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
        <Button variant="outline" onClick={onSkip} className="w-full">
          Skip for now
        </Button>
      </div>
    </div>
  );
};

export default JobPreferencesStep;
