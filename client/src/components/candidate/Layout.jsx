import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const CandidateLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // Check if we're running in Capacitor (mobile app)
    const checkMobileEnvironment = async () => {
      try {
        if (typeof window !== "undefined" && window.Capacitor) {
          const { Capacitor } = await import("@capacitor/core");
          setIsMobile(Capacitor.isNativePlatform());
        }
      } catch (error) {
        setIsMobile(false);
      }
    };
    checkMobileEnvironment();
  }, []);

  return (
    <div
      className={`min-h-screen bg-gray-50 ${isMobile ? "main-content-with-fixed-header" : ""}`}
    >
      {/* Mobile-friendly layout with responsive design */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with mobile hamburger menu */}
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            isMenuOpen={sidebarOpen}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 sm:px-4 lg:px-8" data-scroll-container>
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CandidateLayout;
