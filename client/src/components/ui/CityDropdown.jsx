import React, { useState, useEffect } from "react";
import { getCities } from "../../services/common/cities";
import Select from "./Select";

const CityDropdown = ({
  label = "City",
  name = "city",
  value,
  onChange,
  placeholder = "Select your city",
  required = false,
  error = null,
  className = "",
  hideLabel = false,
  ...props
}) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true);
        const result = await getCities();
        if (result.success) {
          setCities(result.data);
        } else {
          console.error("Failed to load cities:", result.error);
        }
      } catch (error) {
        console.error("Error loading cities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, []);

  const cityOptions = cities.map((city) => ({
    value: city.id,
    label: `${city.name}, ${city.state}`,
  }));

  return (
    <div className={className}>
      {!hideLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select
        name={name}
        value={value}
        onChange={onChange}
        options={cityOptions}
        placeholder={loading ? "" : placeholder}
        disabled={loading}
        {...props}
      >
        {loading ? (
          <div className="flex items-center px-3 py-2 text-gray-500">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {!hideLabel && "Loading cities..."}
          </div>
        ) : (
          placeholder
        )}
      </Select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CityDropdown;
