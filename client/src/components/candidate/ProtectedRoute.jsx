import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'
import Loader from '../ui/Loader'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useCandidateAuth()
  const location = useLocation()

  if (loading) {
    return <Loader.Page />
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute