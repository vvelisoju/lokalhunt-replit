import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const EmployerRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user?.role !== 'EMPLOYER') {
    return <Navigate to="/candidate/dashboard" replace />
  }

  return children
}

export default EmployerRoute