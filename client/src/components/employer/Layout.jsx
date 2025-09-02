import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { useRole } from "../../context/RoleContext";
import { useAuth } from "../../context/AuthContext";
import { useSubscription } from "../../context/SubscriptionContext";
import { toast } from "react-hot-toast";

const EmployerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { user } = useAuth();
  const { isAdminView } = useRole();
  const { hasHRAssistPlan } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    // Global event listener for premium upgrade modal
    const handleShowPremiumUpgrade = () => {
      setShowPremiumModal(true);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener('showPremiumUpgrade', handleShowPremiumUpgrade);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('showPremiumUpgrade', handleShowPremiumUpgrade);
    };
  }, []);

  const handleUpgradeToHRAssist = () => {
    // Redirect to upgrade page or open subscription management
    toast.success("Redirecting to subscription management...");
    setShowPremiumModal(false);
    // Navigate to subscription page using React Router
    navigate('/employer/subscription');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-friendly layout with responsive design */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header with mobile hamburger menu */}
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Global Premium Upgrade Modal */}
      <Modal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        title={
          <>
            <LockClosedIcon className="h-6 w-6 text-yellow-500 mr-2 inline" />
            Unlock Premium Candidates
          </>
        }
        maxWidth="md"
      >
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            What are Premium Candidates?
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Premium Candidates are pre-screened top talent, saving you time
            and ensuring higher quality hires.
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Benefits of HR-Assist Plan
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6 text-left ml-4">
            <li>Access to pre-screened premium candidates</li>
            <li>Quality guarantee on all hires</li>
            <li>Priority customer support</li>
            <li>Advanced filtering and search options</li>
            <li>Dedicated account manager</li>
          </ul>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowPremiumModal(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgradeToHRAssist}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Upgrade to HR-Assist
            </Button>
          </div>
        </div>
      </Modal>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default EmployerLayout;