import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useParams, useLocation } from 'react-router-dom'

const RoleContext = createContext({})

export const useRole = () => {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}

export const RoleProvider = ({ children }) => {
  const { user } = useAuth()
  const { employerId } = useParams()
  const location = useLocation()

  // Core role state matching requirements
  const [role, setRole] = useState('employer') // "employer" | "branch-admin"
  const [viewingAs, setViewingAs] = useState('self') // "self" | "admin-view"
  const [targetEmployer, setTargetEmployer] = useState(null) // When Branch Admin views employer's account

  // Legacy compatibility - keeping existing structure
  const [viewingContext, setViewingContext] = useState({
    currentRole: user?.role || null,
    viewingAs: user?.role || null,
    targetEmployerId: null,
    isViewingAsAdmin: false,
    permissions: {}
  })

  useEffect(() => {
    if (!user) return

    // Initialize role from user data and localStorage
    const savedRoleContext = localStorage.getItem('roleContext')

    // Determine if this is an admin viewing employer context
    const isBranchAdminPath = location.pathname.startsWith('/branch-admin/employers/')
    const targetEmployerId = employerId || null

    // For Branch Admin paths, always try to set admin view context
    if (isBranchAdminPath && user.role === 'BRANCH_ADMIN') {
      setRole('branch-admin')
      setViewingAs('admin-view')
      
      // Try to get target employer from localStorage or use route param
      let targetEmployerData = null
      if (savedRoleContext) {
        try {
          const parsed = JSON.parse(savedRoleContext)
          targetEmployerData = parsed.targetEmployer
        } catch (error) {
          console.error('Error parsing role context from localStorage:', error)
        }
      }
      
      // Use employerId from route if no stored context
      if (!targetEmployerData && targetEmployerId) {
        targetEmployerData = { id: targetEmployerId }
      }
      
      setTargetEmployer(targetEmployerData)
    } else {
      // Reset to user's actual role
      const userRole = user.role === 'BRANCH_ADMIN' ? 'branch-admin' : 'employer'
      setRole(userRole)
      setViewingAs('self')
      setTargetEmployer(null)
      
      // Clear any saved admin context for regular users
      if (user.role === 'EMPLOYER') {
        localStorage.removeItem('roleContext')
      }
    }

    // Legacy compatibility - maintain existing structure
    const newContext = {
      currentRole: user.role,
      viewingAs: isBranchAdminPath ? 'BRANCH_ADMIN_VIEWING_EMPLOYER' : user.role,
      targetEmployerId,
      isViewingAsAdmin: isBranchAdminPath,
      permissions: getPermissionsForRole(user.role, isBranchAdminPath)
    }

    setViewingContext(newContext)
  }, [user, employerId, location.pathname])

  // Define permissions based on role and context
  const getPermissionsForRole = (role, isViewingAsAdmin) => {
    const basePermissions = {
      canViewDashboard: false,
      canViewAds: false,
      canCreateAds: false,
      canEditAds: false,
      canApproveAds: false,
      canViewCandidates: false,
      canAllocateCandidates: false,
      canViewCompanies: false,
      canEditCompanies: false,
      canViewSubscription: false,
      canApproveSubscription: false,
      canManageMOU: false
    }

    if (role === 'EMPLOYER') {
      return {
        ...basePermissions,
        canViewDashboard: true,
        canViewAds: true,
        canCreateAds: true,
        canEditAds: true,
        canViewCandidates: true,
        canViewCompanies: true,
        canEditCompanies: true,
        canViewSubscription: true
      }
    }

    if (role === 'BRANCH_ADMIN') {
      const branchAdminPermissions = {
        ...basePermissions,
        canViewDashboard: true,
        canViewAds: true,
        canApproveAds: true,
        canViewCandidates: true,
        canAllocateCandidates: true,
        canViewCompanies: true,
        canViewSubscription: true,
        canApproveSubscription: true,
        canManageMOU: true
      }

      // When viewing as admin in employer context, add employer-like permissions
      if (isViewingAsAdmin) {
        return {
          ...branchAdminPermissions,
          canCreateAds: true,
          canEditAds: true,
          canEditCompanies: true
        }
      }

      return branchAdminPermissions
    }

    return basePermissions
  }

  // Helper functions for components
  const hasPermission = (permission) => {
    return viewingContext.permissions[permission] || false
  }

  const isViewingAsRole = (role) => {
    return viewingContext.viewingAs === role
  }

  const isCurrentRole = (role) => {
    return viewingContext.currentRole === role
  }

  // Get appropriate API endpoint based on context - unified approach (no transformation)
  const getApiEndpoint = (baseEndpoint) => {
    // Always return the original employer endpoint - role logic handled by middleware
    return baseEndpoint
  }

  // Get navigation context for breadcrumbs
  const getNavigationContext = () => {
    if (viewingContext.isViewingAsAdmin) {
      return {
        showBackToEmployers: true,
        breadcrumbs: [
          { label: 'Employers', path: '/branch-admin/employers' },
          { label: 'Employer Details', path: `/branch-admin/employers/${viewingContext.targetEmployerId}` }
        ]
      }
    }
    return {
      showBackToEmployers: false,
      breadcrumbs: []
    }
  }

  // Permission checker function matching requirements
  const can = (permission) => {
    if (!user) return false

    const permissions = {
      // Branch Admin permissions
      'view-employer-dashboard': user.role === 'BRANCH_ADMIN',
      'approve-ads': user.role === 'BRANCH_ADMIN',
      'reject-ads': user.role === 'BRANCH_ADMIN',
      'manage-employers': user.role === 'BRANCH_ADMIN',
      'view-all-data': user.role === 'BRANCH_ADMIN',
      'admin-oversight': user.role === 'BRANCH_ADMIN',

      // Employer permissions (always available to employers, limited for branch admin in admin-view)
      'manage-own-ads': user.role === 'EMPLOYER' || (user.role === 'BRANCH_ADMIN' && viewingAs === 'admin-view'),
      'view-own-dashboard': user.role === 'EMPLOYER' || (user.role === 'BRANCH_ADMIN' && viewingAs === 'admin-view'),
      'manage-company': user.role === 'EMPLOYER' || (user.role === 'BRANCH_ADMIN' && viewingAs === 'admin-view'),

      // Candidate permissions
      'apply-jobs': user.role === 'CANDIDATE',
      'manage-profile': user.role === 'CANDIDATE'
    }

    return permissions[permission] || false
  }

  // Switch to admin view of an employer
  const viewAsAdmin = (employerData) => {
    if (user?.role !== 'BRANCH_ADMIN') {
      console.warn('Only Branch Admins can switch to admin view')
      return
    }

    const newContext = {
      role: 'branch-admin',
      viewingAs: 'admin-view',
      targetEmployer: employerData
    }

    setRole('branch-admin')
    setViewingAs('admin-view')
    setTargetEmployer(employerData)
    localStorage.setItem('roleContext', JSON.stringify(newContext))
    
    // Return the employer data for navigation purposes
    return employerData
  }

  // Set target employer without switching to admin view (for sidebar context)
  const setTargetEmployerContext = (employerData) => {
    if (user?.role !== 'BRANCH_ADMIN') {
      console.warn('Only Branch Admins can set employer context')
      return
    }

    setTargetEmployer(employerData)
    const currentContext = JSON.parse(localStorage.getItem('roleContext') || '{}')
    const newContext = {
      ...currentContext,
      targetEmployer: employerData
    }
    localStorage.setItem('roleContext', JSON.stringify(newContext))
  }

  // Switch back to self view
  const viewAsSelf = () => {
    const newContext = {
      role: user?.role === 'BRANCH_ADMIN' ? 'branch-admin' : 'employer',
      viewingAs: 'self',
      targetEmployer: null
    }

    setRole(newContext.role)
    setViewingAs('self')
    setTargetEmployer(null)
    localStorage.setItem('roleContext', JSON.stringify(newContext))
  }

  // Get current employer ID for API calls
  const getCurrentEmployerId = () => {
    if (viewingAs === 'admin-view' && targetEmployer) {
      return targetEmployer.id
    }
    if (user?.role === 'EMPLOYER') {
      return user.employer?.id
    }
    return null
  }

  // Helper functions
  const isAdminView = () => viewingAs === 'admin-view'
  const isBranchAdmin = () => user?.role === 'BRANCH_ADMIN'
  const isEmployer = () => user?.role === 'EMPLOYER'

  const value = {
    // New API matching requirements
    role,
    viewingAs,
    targetEmployer,
    can,
    viewAsAdmin,
    viewAsSelf,
    setTargetEmployerContext,
    getCurrentEmployerId,
    isAdminView,
    isBranchAdmin,
    isEmployer,
    user,

    // Legacy compatibility - keeping existing API
    ...viewingContext,
    hasPermission,
    isViewingAsRole,
    isCurrentRole,
    getApiEndpoint,
    getNavigationContext,

    // Utility functions
    canViewEmployerFeatures: hasPermission('canViewDashboard'),
    canManageEmployerData: hasPermission('canEditAds') || hasPermission('canEditCompanies'),
    canApproveEmployerItems: hasPermission('canApproveAds') || hasPermission('canApproveSubscription'),

    // Role display helpers
    getRoleDisplayName: () => {
      if (viewingContext.isViewingAsAdmin) {
        return 'Branch Admin (Viewing Employer)'
      }
      return viewingContext.currentRole?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    },

    getRoleBadgeColor: () => {
      if (viewingContext.isViewingAsAdmin) return 'bg-purple-100 text-purple-800'
      switch (viewingContext.currentRole) {
        case 'EMPLOYER': return 'bg-green-100 text-green-800'
        case 'BRANCH_ADMIN': return 'bg-blue-100 text-blue-800'
        case 'CANDIDATE': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  }

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  )
}

export default RoleProvider