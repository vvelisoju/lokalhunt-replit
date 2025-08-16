import React from 'react'

const TextArea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  disabled = false,
  rows = 3,
  error,
  helpText,
  className = ""
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500
          focus:border-primary-500 focus:ring-1 focus:ring-primary-500 sm:text-sm
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
            : ''
          }
          ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}
          ${className}
        `}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helpText && !error && (
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}

export default TextArea