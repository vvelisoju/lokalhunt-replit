import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from "../../context/AuthContext";
import { useEffect } from 'react';

const BranchAdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not branch admin
  useEffect(() => {
    if (!loading) {
      console.log('Branch Admin Layout - User:', user);
      if (!user) {
        console.log('No user found, redirecting to login');
        navigate('/login');
      } else if (user.role !== 'BRANCH_ADMIN') {
        console.log('User role is not BRANCH_ADMIN:', user.role);
        navigate('/login');
      }
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render if user is not properly authenticated
  if (!user || user.role !== 'BRANCH_ADMIN') {
    return null;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-friendly layout with responsive design */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with mobile hamburger menu */}
          <Header onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default BranchAdminLayout