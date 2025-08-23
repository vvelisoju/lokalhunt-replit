import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCandidateAuth } from '../../hooks/useCandidateAuth'
import { useAuth } from '../../context/AuthContext'
import Loader from '../ui/Loader'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useCandidateAuth()
  const { user: globalUser, isAuthenticated: globalAuth } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader.Page />
  }

  // If not authenticated as candidate, check if user is authenticated with different role
  if (!isAuthenticated) {
    // If user is authenticated but not a candidate, redirect to their appropriate dashboard
    if (globalAuth && globalUser) {
      switch (globalUser.role) {
        case 'EMPLOYER':
          return <Navigate to="/employer/dashboard" replace />
        case 'BRANCH_ADMIN':
          return <Navigate to="/branch-admin/dashboard" replace />
        default:
          // If authenticated but unknown role, redirect to login
          return <Navigate to="/login" state={{ from: location }} replace />
      }
    }
    // If not authenticated at all, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute