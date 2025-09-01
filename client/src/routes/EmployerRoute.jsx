import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EmployerRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  console.log("EmployerRoute: Auth state check:", { 
    user: user ? { id: user.id, role: user.role, name: user.name } : null, 
    isAuthenticated, 
    loading,
    pathname: location.pathname,
    hasToken: !!localStorage.getItem("token"),
    hasStoredUser: !!localStorage.getItem("user")
  });

  // Show loading state while checking authentication
  if (loading) {
    console.log("EmployerRoute: Still loading, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Check if there's a token in localStorage - if so, show loading instead of immediate redirect
    const hasToken = !!localStorage.getItem("token");
    const hasStoredUser = !!localStorage.getItem("user");
    
    console.log("EmployerRoute: User not authenticated, redirecting to login");
    console.log("EmployerRoute: Debug - token exists:", hasToken);
    console.log("EmployerRoute: Debug - stored user exists:", hasStoredUser);
    
    // If we have auth data but authentication hasn't completed yet, show loading
    if (hasToken && hasStoredUser) {
      console.log("EmployerRoute: Has auth data but not authenticated yet, showing loading");
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Authenticating...</p>
          </div>
        </div>
      );
    }
    
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== "EMPLOYER") {
    console.log(
      "EmployerRoute: User is not an employer, role:",
      user?.role,
      "redirecting to candidate dashboard",
    );
    return <Navigate to="/candidate/dashboard" replace />;
  }

  console.log(
    "EmployerRoute: Employer authenticated successfully, role:",
    user?.role,
    "allowing access to:",
    location.pathname
  );

  return children;
};

export default EmployerRoute;
