import React, { useState, useEffect, useRef } from 'react'

const CategorySearchSelect = ({
  value = '',
  onChange,
  options = [],
  loading = false,
  placeholder = "Search and select category...",
  error = '',
  required = false,
  label = '',
  disabled = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef(null)

  // Update filtered options when options change
  useEffect(() => {
    setFilteredOptions(options)
  }, [options])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false)
        // Reset search term if no category is selected
        if (!value) {
          setSearchTerm('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [value])

  const handleInputChange = (e) => {
    const searchValue = e.target.value
    setSearchTerm(searchValue)

    // If there's a selected category and user is typing something different, clear the selection
    if (value && searchValue !== getSelectedOption()?.label) {
      onChange('')
    }

    // Filter categories based on search term
    const filtered = options.filter(option => 
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    )
    setFilteredOptions(filtered)
    setShowDropdown(true)
  }

  const handleInputFocus = () => {
    // Show all categories when focused if no search term or no selection
    if (!value || searchTerm) {
      setFilteredOptions(options)
    } else {
      // If there's a selection, filter based on current search term
      const filtered = options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredOptions(filtered)
    }
    setShowDropdown(true)
  }

  const getSelectedOption = () => {
    return options.find(option => option.value === value)
  }

  const handleOptionSelect = (selectedOption) => {
    onChange(selectedOption.value) // This will now be the category ID
    setSearchTerm('') // Clear search term when category is selected
    setShowDropdown(false)
  }

  const handleClear = () => {
    onChange('')
    setSearchTerm('')
    setFilteredOptions(options) // Reset to show all categories
    setShowDropdown(true) // Keep dropdown open to show all options
  }

  const getDisplayValue = () => {
    if (value) {
      const selectedOption = getSelectedOption()
      return selectedOption?.label || ''
    }
    return searchTerm
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative" ref={containerRef}>
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled || loading}
        />

        {/* Category Icon */}
        <svg 
          className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11H5m14-7H5m14 14H5"
          />
        </svg>

        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-red-500 mr-2 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Clear selection"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <svg 
            className={`h-4 w-4 text-gray-400 transition-transform ${
              showDropdown ? "rotate-180" : ""
            }`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Dropdown */}
        {showDropdown && filteredOptions.length > 0 && (
          <div className="absolute z-[9999] mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm text-left ${
                  value === option.value ? 'text-blue-600' : 'text-gray-900'
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
                {value === option.value && (
                  <span className="float-right">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* No results message */}
        {showDropdown && filteredOptions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="px-3 py-2 text-sm text-gray-500">
              No categories found
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

export default CategorySearchSelect