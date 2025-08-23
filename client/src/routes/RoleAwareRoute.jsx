
import React from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RoleProvider } from '../context/RoleContext'

const RoleAwareRoute = ({ children, allowedRoles = [], requireEmployerAccess = false }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const { employerId } = useParams()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />
  }

  // For branch admin viewing employer context, validate employerId
  if (user?.role === 'BRANCH_ADMIN' && location.pathname.includes('/employers/') && !employerId) {
    return <Navigate to="/branch-admin/employers" replace />
  }

  // For employer access routes, check if user can access employer features
  if (requireEmployerAccess && !['EMPLOYER', 'BRANCH_ADMIN', 'SUPER_ADMIN'].includes(user?.role)) {
    return <Navigate to="/login" replace />
  }

  return (
    <RoleProvider>
      {children}
    </RoleProvider>
  )
}

export default RoleAwareRoute
