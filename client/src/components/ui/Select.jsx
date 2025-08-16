import React from 'react'

const Select = React.forwardRef(({ 
  className = "", 
  options = [], 
  placeholder = "Select an option",
  value,
  onChange,
  ...props 
}, ref) => {
  return (
    <select
      ref={ref}
      className={`block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${className}`}
      value={value}
      onChange={onChange}
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
  )
})

Select.displayName = 'Select'

export default Select