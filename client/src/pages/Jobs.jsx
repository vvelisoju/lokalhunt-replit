import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import JobsList from "../components/ui/JobsList";
import Modal from "../components/ui/Modal";

const Jobs = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pageTitle, setPageTitle] = useState("Find Your Dream Job");
  const [pageSubtitle, setPageSubtitle] = useState("Discover opportunities that match your skills and preferences");

  // Update page title based on URL filters
  useEffect(() => {
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    
    let title = "Find Your Dream Job";
    let subtitle = "Discover opportunities that match your skills and preferences";
    
    if (search || location || category) {
      const filters = [];
      if (search) filters.push(`"${search}"`);
      if (category) filters.push(category);
      if (location) filters.push(`in ${location}`);
      
      title = filters.length > 0 ? `Jobs ${filters.join(' ')}` : title;
      subtitle = `Found jobs matching your search criteria`;
    }
    
    setPageTitle(title);
    setPageSubtitle(subtitle);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
        <JobsList 
          showFilters={true}
          title={pageTitle}
          subtitle={pageSubtitle}
          apiEndpoint="public"
        />
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Login Required
            </h3>
            <p className="text-gray-600 mb-6">
              You need to be logged in to apply for jobs.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg text-center hover:bg-primary-700"
              >
                Login
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
};

export default Jobs;
