
import React, { useState, useEffect } from 'react'
import Select from './Select'

const AllocationStatusSelect = ({ value, onChange, label = "Status", includeAll = true, ...props }) => {
  const [statusOptions, setStatusOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAllocationStatuses()
  }, [])

  const loadAllocationStatuses = async () => {
    try {
      const response = await fetch('/api/shared/allocation-statuses')
      const result = await response.json()
      
      if (result.status === 'success') {
        let options = result.data
        
        // Add "All Statuses" option if needed
        if (includeAll) {
          options = [{ value: '', label: 'All Statuses' }, ...options]
        }
        
        setStatusOptions(options)
      } else {
        // Fallback to static data if API fails
        const fallbackOptions = [
          ...(includeAll ? [{ value: '', label: 'All Statuses' }] : []),
          { value: 'APPLIED', label: 'Applied' },
          { value: 'SHORTLISTED', label: 'Shortlisted' },
          { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
          { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
          { value: 'HIRED', label: 'Hired' },
          { value: 'HOLD', label: 'Hold' },
          { value: 'REJECTED', label: 'Rejected' }
        ]
        setStatusOptions(fallbackOptions)
      }
    } catch (error) {
      console.error('Error loading allocation statuses:', error)
      // Fallback to static data
      const fallbackOptions = [
        ...(includeAll ? [{ value: '', label: 'All Statuses' }] : []),
        { value: 'APPLIED', label: 'Applied' },
        { value: 'SHORTLISTED', label: 'Shortlisted' },
        { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
        { value: 'INTERVIEW_COMPLETED', label: 'Interview Completed' },
        { value: 'HIRED', label: 'Hired' },
        { value: 'HOLD', label: 'Hold' },
        { value: 'REJECTED', label: 'Rejected' }
      ]
      setStatusOptions(fallbackOptions)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Select label={label} value={value} onChange={onChange} options={[]} disabled {...props} />
  }

  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={statusOptions}
      {...props}
    />
  )
}

export default AllocationStatusSelect
