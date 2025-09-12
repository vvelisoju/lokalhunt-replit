import React, { useState, useEffect, useRef } from "react";
import { publicApi } from "../../services/publicApi";
import { useAppData } from "../../context/AppDataContext";
import {
  MapPinIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const CityDropdown = ({
  label = "City",
  name = "city",
  value,
  onChange,
  placeholder = "Search and select your city",
  required = false,
  error = null,
  className = "",
  hideLabel = false,
  disabled = false,
  variant = "register",
  ...props
}) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const containerRef = useRef(null);

  const { cities: contextCities, isDataLoaded, loading: appDataLoading } = useAppData();

  useEffect(() => {
    if (contextCities && contextCities.length > 0) {
      console.log("CityDropdown: Using cached cities from AppDataContext");
      setCities(contextCities);
      setFilteredCities(contextCities);
      setLoading(false);
    } else {
      // Set loading state based on context loading state
      setLoading(appDataLoading.cities);
    }
  }, [contextCities, appDataLoading.cities]);


  // Update selected city when value changes (only from parent, not user input)
  useEffect(() => {
    if (value && cities.length > 0) {
      const city = cities.find((c) => c.id === value);
      setSelectedCity(city);
      if (city && !showDropdown) {
        // Only set search term if dropdown is closed (not during user interaction)
        setSearchTerm(`${city.name}, ${city.state}`);
      }
    } else if (!value) {
      setSelectedCity(null);
      if (!showDropdown) {
        // Only clear if not actively typing
        setSearchTerm("");
      }
    }
  }, [value, cities, showDropdown]);

  // Update filtered cities when cities change (this might not be needed if context handles it)
  // However, if the parent component updates 'cities' prop directly, this would be useful.
  // For now, let's assume cities are only updated via context.
  useEffect(() => {
    if (cities.length > 0) {
      setFilteredCities(cities);
    }
  }, [cities]);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
        // Only reset to selected city if there's a valid selection
        if (selectedCity) {
          setSearchTerm(`${selectedCity.name}, ${selectedCity.state}`);
        } else if (
          searchTerm &&
          !filteredCities.some(
            (city) =>
              `${city.name}, ${city.state}`.toLowerCase() ===
              searchTerm.toLowerCase(),
          )
        ) {
          // If search term doesn't match any city, clear it
          setSearchTerm("");
          onChange("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedCity, searchTerm, filteredCities, onChange]);

  const handleInputChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);

    // Always clear selection when user types (let them control the input)
    if (
      selectedCity &&
      searchValue !== `${selectedCity.name}, ${selectedCity.state}`
    ) {
      setSelectedCity(null);
      onChange("");
    }

    // If completely cleared
    if (searchValue === "") {
      setFilteredCities(cities);
      setShowDropdown(true);
      return;
    }

    // Filter cities
    const filtered = cities.filter(
      (city) =>
        city.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        city.state.toLowerCase().includes(searchValue.toLowerCase()) ||
        `${city.name}, ${city.state}`
          .toLowerCase()
          .includes(searchValue.toLowerCase()),
    );
    setFilteredCities(filtered);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    // Always show dropdown on focus
    setShowDropdown(true);

    // Filter based on current search term or show all
    if (!searchTerm) {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(
        (city) =>
          city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${city.name}, ${city.state}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredCities(filtered);
    }
  };

  const handleCitySelect = (city) => {
    onChange(city.id);
    setSelectedCity(city);
    setSearchTerm(`${city.name}, ${city.state}`);
    setShowDropdown(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear everything completely
    setSearchTerm("");
    setSelectedCity(null);
    onChange("");
    setFilteredCities(cities); // Reset to all cities
    setShowDropdown(false);

    // Focus back to input for immediate typing
    setTimeout(() => {
      const input = containerRef.current?.querySelector("input");
      if (input) input.focus();
    }, 0);
  };

  const displayValue = searchTerm;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {!hideLabel && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
          <MapPinIcon className="h-5 w-5 text-gray-400" />
        </div>

        <input
          type="text"
          name={name}
          value={loading ? "Loading cities..." : displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            // Allow Escape key to clear and close dropdown
            if (e.key === "Escape") {
              handleClear();
              e.target.blur();
            }
            // Allow Ctrl+A or Cmd+A to select all text
            if ((e.ctrlKey || e.metaKey) && e.key === "a") {
              e.target.select();
            }
          }}
          placeholder={loading ? "Loading cities..." : placeholder}
          disabled={loading || disabled}
          className={`w-full pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            variant === "register"
              ? "py-3 sm:py-4 text-sm sm:text-base border-2 rounded-2xl"
              : "py-3 text-sm border rounded-lg h-12.5"
          } ${
            error
              ? "border-red-300 bg-red-50"
              : variant === "register"
                ? "border-gray-200 bg-gray-50 focus:bg-white"
                : "border-gray-300 bg-white focus:border-blue-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
          autoComplete="off"
          {...props}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {(selectedCity || searchTerm) && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 mr-2 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Clear selection"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform ${
              showDropdown ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown */}
        {showDropdown && !loading && !disabled && (
          <div
            className={`absolute z-[9999] w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-80 overflow-y-auto ${
              variant === "register" ? "rounded-lg" : "rounded-md"
            }`}
          >
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`w-full text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                    variant === "register" ? "px-4 py-3" : "px-3 py-2"
                  } ${
                    selectedCity?.id === city.id
                      ? "text-blue-600"
                      : "text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">
                      {city.name}, {city.state}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div
                className={`text-sm text-gray-500 ${
                  variant === "register" ? "px-4 py-3" : "px-3 py-2"
                }`}
              >
                No cities found matching "{searchTerm}"
              </div>
            )}
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CityDropdown;