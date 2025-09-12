import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import { getCities } from "../../services/common/cities";
import Modal from "../ui/Modal";
import CityDropdown from "../ui/CityDropdown";

const EditPreferencesModal = ({ isOpen, onClose, preferences, onSave }) => {
  const [formData, setFormData] = useState({
    // From Step 1 - Basic Info
    currentEmploymentStatus: "",

    // From Step 2 - Job Preferences
    jobTypes: [],
    preferredRoles: [],
    industry: [],
    preferredLocation: "", // Changed to single location
    shiftPreference: "",

    // From Step 3 - Skills & Experience
    experienceLevel: "",
    salaryRange: { min: "", max: "" },

    // From Step 4 - Final Setup
    availability: "",
    languages: [],
    workType: "",
    noticePeriod: "",
    travelWillingness: false,
  });
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    roles: false,
    industry: false,
    languages: false,
  });

  useEffect(() => {
    if (isOpen && preferences) {
      console.log("EditPreferencesModal received preferences:", preferences);

      // Handle preferred location - expect single cityId (use first from array if multiple)
      let processedLocation = "";
      if (
        preferences.preferredLocations &&
        preferences.preferredLocations.length > 0
      ) {
        processedLocation = preferences.preferredLocations[0];
      }

      // Get experience level from multiple possible sources
      const experienceLevel =
        preferences.experienceLevel ||
        preferences.jobPreferences?.experienceLevel ||
        preferences.skillsExperience?.experienceLevel ||
        "";

      // Get availability from multiple possible sources
      const availability =
        preferences.availabilityStatus ||
        preferences.availability ||
        preferences.availabilityDate ||
        preferences.skillsExperience?.availabilityDate ||
        preferences.jobPreferences?.availability ||
        "";

      console.log("Mapped experience level:", experienceLevel);
      console.log("Mapped availability:", availability);

      setFormData({
        // Basic Info
        currentEmploymentStatus: preferences.currentEmploymentStatus || "",

        // Job Preferences
        jobTypes: preferences.jobTypes || [],
        preferredRoles:
          preferences.preferredRoles || preferences.jobTitles || [],
        industry: preferences.industry || [],
        preferredLocation: processedLocation,
        shiftPreference: preferences.shiftPreference || "",

        // Skills & Experience - ensure these are properly mapped
        experienceLevel: experienceLevel,
        salaryRange: preferences.salaryRange || { min: "", max: "" },

        // Final Setup - handle multiple availability field sources
        availability: availability,
        languages: preferences.languages || [],
        workType:
          preferences.workType || preferences.remoteWorkPreference || "",
        travelWillingness: preferences.travelWillingness || false,
      });
    }
  }, [isOpen, preferences]);

  useEffect(() => {
    if (isOpen) {
      loadCities();
    }
  }, [isOpen]);

  const loadCities = async () => {
    setLoadingCities(true);
    try {
      const result = await getCities();
      if (result.success) {
        setCities(
          result.data.map((city) => ({
            id: city.id,
            name: `${city.name}, ${city.state}`,
          })),
        );
      }
    } catch (error) {
      console.error("Error loading cities:", error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure experience level and availability are included in the saved data
      const dataToSave = {
        ...formData,
        // Convert single location back to array for backend compatibility
        preferredLocations: formData.preferredLocation
          ? [formData.preferredLocation]
          : [],
        // Make sure these critical fields are explicitly included
        experienceLevel: formData.experienceLevel,
        availability: formData.availability,
        // Map availability to both fields for backend compatibility
        availabilityStatus: formData.availability,
        availabilityDate: formData.availability,
      };

      console.log("Saving preferences data:", dataToSave);
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      currentEmploymentStatus: "",
      jobTypes: [],
      preferredRoles: [],
      industry: [],
      preferredLocation: "", // Changed to single location
      shiftPreference: "",
      experienceLevel: "",
      salaryRange: { min: "", max: "" },
      availability: "",
      languages: [],
      workType: "",
      travelWillingness: false,
    });
    setExpandedSections({
      roles: false,
      industry: false,
      languages: false,
    });
    onClose();
  };

  const handleArrayFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!isOpen) return null;

  const jobTypeOptions = [
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "FREELANCE",
    "INTERNSHIP",
  ];
  const workTypeOptions = ["REMOTE", "ONSITE", "HYBRID", "FLEXIBLE"];
  const employmentStatusOptions = [
    "LOOKING_FOR_JOB",
    "OPEN_TO_OPPORTUNITIES",
    "CURRENTLY_WORKING",
    "STUDENT_RECENT_GRADUATE",
  ];
  const experienceLevelOptions = [
    "ENTRY_LEVEL",
    "MID_LEVEL",
    "SENIOR_LEVEL",
    "EXECUTIVE",
  ];
  const shiftPreferenceOptions = [
    "DAY_SHIFT",
    "NIGHT_SHIFT",
    "FLEXIBLE_HOURS",
    "WEEKEND_ONLY",
  ];
  const availabilityOptions = [
    "IMMEDIATELY",
    "WITHIN_1_WEEK",
    "WITHIN_1_MONTH",
    "PLUS_2_MONTHS",
  ];
  const languageOptions = [
    "ENGLISH",
    "HINDI",
    "TELUGU",
    "TAMIL",
    "KANNADA",
    "MALAYALAM",
    "BENGALI",
    "MARATHI",
    "GUJARATI",
    "PUNJABI",
    "URDU",
    "ODIA",
  ];

  // Common job roles for local jobs
  const commonJobRoles = [
    "Delivery Driver",
    "Sales Executive",
    "Customer Service Representative",
    "Security Guard",
    "Housekeeping",
    "Cook",
    "Waiter",
    "Cashier",
    "Data Entry Clerk",
    "Office Assistant",
    "Receptionist",
    "Telecaller",
    "Field Sales Executive",
    "Store Manager",
    "Supervisor",
  ];

  const commonIndustries = [
    "Administrative & Clerk Roles",
    "Banking & Office Staff",
    "Cook / Chef / Kitchen Staff",
    "Delivery & Courier",
    "Driver",
    "Electrician / Plumber / Technician",
    "Garments & Textile Worker",
    "Housekeeping & Cleaning",
    "IT & Computer Operator",
    "Labour / Construction Worker",
    "Marketing & Sales Executive",
    "Mechanic / Vehicle Repair",
    "Medical & Healthcare Support",
    "Security Guard",
    "Shop Salesman / Retail Staff",
    "Teacher / Trainer / Tutor",
    "Telecalling / BPO Support",
    "Waiter / Hotel Staff",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Job Preferences"
      maxWidth="lg"
    >
      <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden w-full">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-2 w-full"
        >
          {/* Preferred Location - First Position */}
          <div className="space-y-3">
            <CityDropdown
              label="Preferred Location"
              value={formData.preferredLocation}
              onChange={(cityId) =>
                setFormData((prev) => ({
                  ...prev,
                  preferredLocation: cityId,
                }))
              }
              placeholder="Select your preferred work location"
              variant="default"
              className="w-full"
            />
          </div>

          {/* Preferred Job Roles - Collapsible */}
          <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("roles")}
            >
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-800">
                  Preferred Job Roles
                </label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {formData.preferredRoles.length} selected
                </span>
              </div>
              <span className="text-gray-500 text-lg font-semibold">
                {expandedSections.roles ? "−" : "+"}
              </span>
            </div>
            {expandedSections.roles && (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                <div className="grid grid-cols-1 gap-2">
                  {commonJobRoles.map((role) => (
                    <label
                      key={role}
                      className="flex items-center space-x-3 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.preferredRoles.includes(role)}
                        onChange={() =>
                          handleArrayFieldChange("preferredRoles", role)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 flex-1">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {formData.preferredRoles.length > 0 && (
              <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="font-medium mb-1">Selected Roles:</div>
                <div className="flex flex-wrap gap-1">
                  {formData.preferredRoles.slice(0, 3).map((role, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {role}
                    </span>
                  ))}
                  {formData.preferredRoles.length > 3 && (
                    <span className="text-xs text-blue-600 font-medium">
                      +{formData.preferredRoles.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Experience Level & Availability - Mobile Stacked */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Experience Level
                {formData.experienceLevel && (
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    ✓ Selected
                  </span>
                )}
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experienceLevel: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select experience level</option>
                {experienceLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Availability
                {formData.availability && (
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    ✓ Selected
                  </span>
                )}
              </label>
              <select
                value={formData.availability}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    availability: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select availability</option>
                {availabilityOptions.map((availability) => (
                  <option key={availability} value={availability}>
                    {availability
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Employment Status */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Current Employment Status
            </label>
            <select
              value={formData.currentEmploymentStatus}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentEmploymentStatus: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select employment status</option>
              {employmentStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Job Types */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800">
              Job Types
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {jobTypeOptions.map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-3 py-2 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.jobTypes.includes(type)}
                    onChange={() => handleArrayFieldChange("jobTypes", type)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {type
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Industry Preferences - Collapsible */}
          <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("industry")}
            >
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-800">
                  Industry Preferences
                </label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {formData.industry.length} selected
                </span>
              </div>
              <span className="text-gray-500 text-lg font-semibold">
                {expandedSections.industry ? "−" : "+"}
              </span>
            </div>
            {expandedSections.industry && (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                <div className="grid grid-cols-1 gap-2">
                  {commonIndustries.map((industry) => (
                    <label
                      key={industry}
                      className="flex items-center space-x-3 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.industry.includes(industry)}
                        onChange={() =>
                          handleArrayFieldChange("industry", industry)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 flex-1">
                        {industry}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {formData.industry.length > 0 && (
              <div className="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="font-medium mb-1">Selected Industries:</div>
                <div className="flex flex-wrap gap-1">
                  {formData.industry.slice(0, 2).map((industry, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                    >
                      {industry}
                    </span>
                  ))}
                  {formData.industry.length > 2 && (
                    <span className="text-xs text-green-600 font-medium">
                      +{formData.industry.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Salary Range */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-800">
              Expected Salary Range (per month)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Min (₹)"
                  value={formData.salaryRange.min}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryRange: { ...prev.salaryRange, min: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max (₹)"
                  value={formData.salaryRange.max}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryRange: { ...prev.salaryRange, max: e.target.value },
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Languages - Collapsible */}
          <div className="space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
            <div
              className="flex items-center justify-between cursor-pointer py-2"
              onClick={() => toggleSection("languages")}
            >
              <div className="flex items-center space-x-2">
                <label className="text-sm font-semibold text-gray-800">
                  Preferred Languages
                </label>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {formData.languages.length} selected
                </span>
              </div>
              <span className="text-gray-500 text-lg font-semibold">
                {expandedSections.languages ? "−" : "+"}
              </span>
            </div>
            {expandedSections.languages && (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                <div className="grid grid-cols-2 gap-2">
                  {languageOptions.map((language) => (
                    <label
                      key={language}
                      className="flex items-center space-x-2 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() =>
                          handleArrayFieldChange("languages", language)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-xs text-gray-700 flex-1">
                        {language
                          .toLowerCase()
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {formData.languages.length > 0 && (
              <div className="text-xs text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="font-medium mb-1">Selected Languages:</div>
                <div className="flex flex-wrap gap-1">
                  {formData.languages
                    .map((lang) =>
                      lang
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase()),
                    )
                    .slice(0, 4)
                    .map((lang, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                      >
                        {lang}
                      </span>
                    ))}
                  {formData.languages.length > 4 && (
                    <span className="text-xs text-purple-600 font-medium">
                      +{formData.languages.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Work Type & Shift Preference - Mobile Stacked */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Work Type
              </label>
              <div className="space-y-2">
                {workTypeOptions.map((type) => (
                  <label
                    key={type}
                    className="flex items-center space-x-3 py-2 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="workType"
                      value={type}
                      checked={formData.workType === type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          workType: e.target.value,
                        }))
                      }
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {type
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Shift Preference
              </label>
              <select
                value={formData.shiftPreference}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shiftPreference: e.target.value,
                  }))
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select shift preference</option>
                {shiftPreferenceOptions.map((shift) => (
                  <option key={shift} value={shift}>
                    {shift
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Travel Willingness */}
          <div className="space-y-2">
            <label className="flex items-center space-x-3 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.travelWillingness}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    travelWillingness: e.target.checked,
                  }))
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-800 flex-1">
                Willing to travel for work
              </span>
            </label>
          </div>
        </form>

        {/* Footer - Sticky */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-6 -mx-2 -mb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditPreferencesModal;
