import React, { useState, useEffect, useRef, useContext } from "react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import Button from "./Button";
import Modal from "./Modal";
import { publicApi } from "../../services/publicApi";
import CategorySearchSelect from "./CategorySearchSelect";
import CityDropdown from "./CityDropdown";
import { useAppData } from "../../context/AppDataContext";

const JobFilters = ({
  filters,
  onFiltersChange,
  showAdvancedFilters = true,
  showApplicationFilters = false,
  statusOptions = [],
  dateRangeOptions = [],
  className = "",
  compact = false,
  showSearchButton = false,
  onSearch,
}) => {
  const {
    categories: contextCategories,
    cities,
    educationQualifications,
    isDataLoaded,
  } = useAppData();

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  // Removed local states for categories, locations, and educationQualifications as they are now in context
  const [selectedLocationName, setSelectedLocationName] = useState(""); // State to hold the resolved location name
  const [searchTerm, setSearchTerm] = useState(filters.search || ""); // Local state for search term
  const searchTimeoutRef = useRef(null);

  // Advanced filter options
  const jobTypes = [
    { id: "REMOTE", label: "Remote", value: "REMOTE" },
    { id: "FREELANCE", label: "Freelance", value: "FREELANCE" },
    { id: "CONTRACT", label: "Contract Base", value: "CONTRACT" },
    { id: "PART_TIME", label: "Part Time", value: "PART_TIME" },
    { id: "FULL_TIME", label: "Full Time", value: "FULL_TIME" },
    { id: "INTERNSHIP", label: "Internship", value: "INTERNSHIP" },
  ];

  const experienceLevels = [
    { id: "ENTRY", label: "Entry Level (0-2 years)", value: "ENTRY" },
    { id: "MID", label: "Mid Level (2-5 years)", value: "MID" },
    { id: "SENIOR", label: "Senior Level (5+ years)", value: "SENIOR" },
    { id: "EXECUTIVE", label: "Executive Level", value: "EXECUTIVE" },
  ];

  const salaryRanges = [
    { id: "0-25000", label: "₹0 - ₹25,000", value: "0-25000" },
    { id: "25000-50000", label: "₹25,000 - ₹50,000", value: "25000-50000" },
    { id: "50000-100000", label: "₹50,000 - ₹1,00,000", value: "50000-100000" },
    { id: "100000+", label: "₹1,00,000+", value: "100000+" },
  ];

  // Data is automatically loaded by AppDataContext on app initialization
  // No need for additional fetching logic hered from context

  // Resolve location ID to location name for display
  useEffect(() => {
    if (filters.location && cities && cities.length > 0) {
      // Check if location is a UUID (city ID)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          filters.location,
        );

      if (isUUID) {
        const selectedCity = cities.find(
          (city) => city.id === filters.location,
        );
        if (selectedCity) {
          setSelectedLocationName(
            `${selectedCity.name}, ${selectedCity.state}`,
          );
        } else {
          setSelectedLocationName("");
        }
      } else {
        // Handle legacy city name format
        setSelectedLocationName(filters.location);
      }
    } else {
      setSelectedLocationName("");
    }
  }, [filters.location, cities]); // Depend on cities from context

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    console.log("JobFilters: Updating filters", {
      current: filters,
      new: newFilters,
      updated: updatedFilters,
    });
    onFiltersChange(updatedFilters);
  };

  // Update internal state when filters prop changes (for URL navigation and localStorage)
  useEffect(() => {
    // Sync local searchTerm state with filters.search when it changes externally
    setSearchTerm(filters.search || "");
  }, [filters.search]);

  const handleSearchChange = (value) => {
    setSearchTerm(value); // Update local state immediately

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout for the actual search
    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ search: value }); // Update parent filters only after debounce
      // The search will trigger automatically through the parent's effect
    }, 400); // 400ms debounce
  };

  const handleLocationChange = (cityId) => {
    // Send the cityId directly for location filtering
    updateFilters({ location: cityId });
  };

  const handleCategoryChange = (categoryId) => {
    updateFilters({ category: categoryId });
  };

  const handleArrayFilterChange = (filterKey, value) => {
    const currentArray = filters[filterKey] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    updateFilters({ [filterKey]: newArray });
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      location: "",
      category: "",
      company: "",
      jobType: [],
      experience: [],
      gender: "",
      education: [],
      salaryRange: "",
      sortBy: "newest",
      experienceLevel: "",
      employmentType: "",
      minSalary: "",
      maxSalary: "",
    };
    onFiltersChange(clearedFilters);
    setSearchTerm(""); // Clear local search term as well
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.category) count++;
    if (filters.company) count++;
    if (filters.jobType?.length > 0) count++;
    if (filters.experience?.length > 0) count++;
    if (filters.gender) count++;
    if (filters.education?.length > 0) count++;
    if (filters.salaryRange) count++;
    if (filters.experienceLevel) count++;
    if (filters.employmentType) count++;
    if (filters.minSalary) count++;
    if (filters.maxSalary) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Function to handle the "Apply Filters" button click in the modal
  const applyMobileFilters = () => {
    setShowMobileFilters(false);
    // The actual filtering is handled by the onFiltersChange, so no further action needed here
  };

  // Function to handle the "Clear Filters" button click in the modal
  const clearMobileFilters = () => {
    clearFilters();
    setShowMobileFilters(false);
  };

  return (
    <div className={className}>
      {/* Main Search Bar */}
      <div
        className={`bg-white rounded-lg shadow-sm border border-gray-200 ${compact ? "p-3" : "p-4"} mb-6`}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Location Filter */}
          <div className="flex-1">
            <div className="relative">
              <CityDropdown
                value={filters.location} // Pass the city ID or name
                onChange={handleLocationChange}
                placeholder="All Locations"
                hideLabel={true}
                variant="default"
                options={cities} // Pass cities from context
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex-1">
            <CategorySearchSelect
              value={filters.category || ""}
              onChange={handleCategoryChange}
              options={
                Array.isArray(contextCategories)
                  ? contextCategories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))
                  : []
              }
              placeholder="All Categories"
              className="w-full"
            />
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchTerm} // Use local state for input value
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Search Button - Only shown on landing page */}
          {showSearchButton && (
            <Button
              type="button"
              className="lg:px-8 whitespace-nowrap bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
              onClick={(e) => {
                e.preventDefault();
                if (onSearch) {
                  onSearch(filters);
                }
              }}
            >
              Search
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Button & Active Filters */}
      {showAdvancedFilters && (
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Mobile/Advanced Filters Modal */}
      {showAdvancedFilters && (
        <Modal
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          title="Filter Jobs"
          size="lg"
        >
          <div className="space-y-6">
            {/* Job Type Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Type</h4>
              <div className="space-y-2">
                {jobTypes.map((type) => (
                  <label key={type.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.jobType?.includes(type.value) || false}
                      onChange={() =>
                        handleArrayFilterChange("jobType", type.value)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Experience</h4>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <label key={level.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        filters.experience?.includes(level.value) || false
                      }
                      onChange={() =>
                        handleArrayFilterChange("experience", level.value)
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Gender</h4>
              <div className="space-y-2">
                {["Male", "Female", "Both"].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={filters.gender === gender}
                      onChange={() => updateFilters({ gender })}
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Education Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Minimum Education
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {educationQualifications
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((edu) => (
                    <label key={edu.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.education?.includes(edu.name) || false}
                        onChange={() =>
                          handleArrayFilterChange("education", edu.name)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {edu.name}
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Salary Range Filter */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Salary Range</h4>
              <div className="space-y-2">
                {salaryRanges.map((range) => (
                  <label key={range.id} className="flex items-center">
                    <input
                      type="radio"
                      name="salaryRange"
                      value={range.value}
                      checked={filters.salaryRange === range.value}
                      onChange={() =>
                        updateFilters({ salaryRange: range.value })
                      }
                      className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={clearMobileFilters}
                variant="outline"
                className="flex-1"
              >
                Clear All
              </Button>
              <Button onClick={applyMobileFilters} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Application-specific Filters */}
      {showApplicationFilters && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, status: e.target.value })
                }
                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateRange: e.target.value })
                }
                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {dateRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobFilters;
