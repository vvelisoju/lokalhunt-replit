import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import JobsList from "../../components/ui/JobsList";
import { useCandidate } from "../../context/CandidateContext";

const CandidateJobs = () => {
  const { t } = useTranslation();
  const { profile, fetchProfile } = useCandidate();
  const [defaultFilters, setDefaultFilters] = useState({});

  useEffect(() => {
    // Fetch profile if not loaded
    if (!profile) {
      fetchProfile();
    }
  }, [profile, fetchProfile]);

  useEffect(() => {
    // Load saved filters from localStorage only once on mount
    const savedFilters = localStorage.getItem('jobFilters');
    
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        console.log('Jobs: Loading saved filters from localStorage:', parsedFilters);
        setDefaultFilters(parsedFilters);
      } catch (error) {
        console.error('Jobs: Error parsing saved filters:', error);
        // Set default filters structure if localStorage parsing fails
        setDefaultFilters({
          search: "",
          location: "",
          category: "",
          jobType: [],
          experience: [],
          gender: "",
          education: [],
          salaryRange: "",
          sortBy: "newest",
        });
      }
    } else {
      // Set default filters structure if no saved filters found
      console.log('Jobs: No saved filters found, setting default filters');
      setDefaultFilters({
        search: "",
        location: "",
        category: "",
        jobType: [],
        experience: [],
        gender: "",
        education: [],
        salaryRange: "",
        sortBy: "newest",
      });
    }
  }, []); // Keep empty dependency array to run only once

  const handleFiltersChange = (newFilters) => {
    // Save filters to localStorage whenever they change
    try {
      localStorage.setItem('jobFilters', JSON.stringify(newFilters));
      console.log('Jobs: Saved filters to localStorage:', newFilters);
    } catch (error) {
      console.error('Jobs: Error saving filters to localStorage:', error);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      <JobsList
        showFilters={true}
        title="Find Jobs"
        subtitle="Find opportunities based on your profile and preferences"
        apiEndpoint="public"
        defaultFilters={defaultFilters}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
};

export default CandidateJobs;
