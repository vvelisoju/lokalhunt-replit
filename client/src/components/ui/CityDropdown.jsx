
import React, { useState, useEffect } from 'react'
import { getCities } from '../../services/common/cities'
import Select from './Select'

const CityDropdown = ({ 
  label = "City", 
  name = "city", 
  value, 
  onChange, 
  placeholder = "Select your city", 
  required = false, 
  error = null,
  className = "",
  ...props 
}) => {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true)
        const result = await getCities()
        if (result.success) {
          setCities(result.data)
        } else {
          console.error('Failed to load cities:', result.error)
        }
      } catch (error) {
        console.error('Error loading cities:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCities()
  }, [])

  const cityOptions = cities.map(city => ({
    value: city.id,
    label: `${city.name}, ${city.state}`
  }))

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Select
        name={name}
        value={value}
        onChange={onChange}
        options={cityOptions}
        placeholder={loading ? "Loading cities..." : placeholder}
        disabled={loading}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default CityDropdown
