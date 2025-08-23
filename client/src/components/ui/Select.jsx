import React from 'react'

const Select = React.forwardRef(({ 
  className = "", 
  options = [], 
  placeholder = "Select an option",
  label,
  value,
  onChange,
  error,
  required = false,
  ...props 
}, ref) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${error ? 'border-red-300' : ''} ${className}`}
        value={value}
        onChange={(e) => onChange ? onChange(e.target.value) : null}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select