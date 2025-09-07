import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon, // Import AdjustmentsHorizontalIcon
} from "@heroicons/react/24/outline";
import FormInput from "../../components/ui/FormInput";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import CandidateCard from "../../components/ui/CandidateCard";
import AllocationStatusBadge from "../../components/ui/AllocationStatusBadge";
import AllocationStatusSelect from "../../components/ui/AllocationStatusSelect";
import {
  getCandidates,
  updateCandidateStatus,
} from "../../services/employer/candidates";
import {
  bookmarkCandidate,
  removeBookmark,
  getBookmarkedCandidates,
} from "../../services/employer/candidates";
import { getAds } from "../../services/employer/ads";
import { useRole } from "../../context/RoleContext";
import { useToast } from "../../components/ui/Toast";

const Candidates = () => {
  const [searchParams] = useSearchParams();

  const { success: showSuccess, error: showError } = useToast();

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const {
    isAdminView = () => false,
    isBranchAdmin = () => false,
    can = () => false,
    targetEmployer = null,
    getCurrentEmployerId = () => null,
    employerPlan = "SELF_SERVICE", // Default plan, will be fetched
  } = roleContext || {};

  const [candidates, setCandidates] = useState([]);
  const [premiumCandidates, setPremiumCandidates] = useState([]); // State for premium candidates
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

  const [viewMode, setViewMode] = useState("ALL"); // "ALL" or "PREMIUM"
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // State to manage active tab

  // State for all candidates (both regular and bookmarked)
  const [allCandidates, setAllCandidates] = useState([]);
  const [allBookmarkedCandidates, setAllBookmarkedCandidates] = useState([]);


  // Get ad filter from URL params
  const adIdFilter = searchParams.get("adId");
  const adTitleFilter = searchParams.get("adTitle");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Default to "All Statuses"
  const [skillFilter, setSkillFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [educationFilter, setEducationFilter] = useState("");
  const [selectedAd, setSelectedAd] = useState(adIdFilter || ""); // Default to "All Job Ads"
  const [appliedOnlyFilter, setAppliedOnlyFilter] = useState(false);

  // State for ads dropdown and education qualifications
  const [approvedAds, setApprovedAds] = useState([]);
  const [educationQualifications, setEducationQualifications] = useState([]);

  // More filters toggle state
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const experienceOptions = [
    { value: "", label: "All Experience" },
    { value: "0-1", label: "0-1 years" },
    { value: "1-3", label: "1-3 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "5-10", label: "5-10 years" },
    { value: "10+", label: "10+ years" },
  ];

  const genderOptions = [
    { value: "", label: "All Genders" },
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "BOTH", label: "Any Gender" },
  ];

  // Load initial data
  useEffect(() => {
    // Check if we're filtering for bookmarked candidates from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const bookmarkedParam = urlParams.get('bookmarked');

    if (bookmarkedParam === 'true') {
      setActiveTab('bookmarked');
      setShowBookmarkedOnly(true);
    }

    loadAllCandidates();
    loadApprovedAds();
    loadEducationQualifications();
  }, []);

  const loadAllCandidates = async () => {
    setIsLoading(true);
    try {
      // Load both regular candidates and bookmarked candidates
      const [regularResult, bookmarkedResult] = await Promise.all([
        getCandidates(),
        getBookmarkedCandidates()
      ]);

      // Process regular candidates
      let processedRegularCandidates = [];
      if (regularResult.success) {
        let regularCandidates = [];
        if (regularResult.data?.candidates && Array.isArray(regularResult.data.candidates)) {
          regularCandidates = regularResult.data.candidates;
        } else if (regularResult.data && Array.isArray(regularResult.data)) {
          regularCandidates = regularResult.data;
        } else if (regularResult.candidates && Array.isArray(regularResult.candidates)) {
          regularCandidates = regularResult.candidates;
        }

        processedRegularCandidates = regularCandidates.map((candidate) => ({
          ...candidate,
          id: candidate.id || candidate.candidateId || Math.random().toString(36).substr(2, 9),
          user: candidate.user || {},
          name: candidate.name || candidate.user?.name || "Unknown",
          email: candidate.email || candidate.user?.email || "",
          skills: Array.isArray(candidate.skills)
            ? candidate.skills
            : typeof candidate.skills === "string"
              ? candidate.skills.split(",").map((s) => s.trim())
              : [],
          allocations: Array.isArray(candidate.allocations) ? candidate.allocations : [],
          experience: candidate.experience || candidate.experienceYears || candidate.totalExperience || 0,
          currentLocation: candidate.currentLocation || candidate.location || "",
          expectedSalary: candidate.expectedSalary || "",
          currentJobTitle: candidate.currentJobTitle || candidate.jobTitle || "",
          profile_data: candidate.profile_data || {},
          isPremium: Boolean(candidate.isPremium),
          isBookmarked: candidate.isBookmarked || false,
        }));
      }

      // Process bookmarked candidates
      let processedBookmarkedCandidates = [];
      if (bookmarkedResult.success) {
        if (bookmarkedResult.data && Array.isArray(bookmarkedResult.data)) {
          processedBookmarkedCandidates = bookmarkedResult.data.map(bookmark => ({
            ...bookmark.candidate,
            id: bookmark.candidate.id || bookmark.candidate.candidateId || Math.random().toString(36).substr(2, 9),
            user: bookmark.candidate.user || {},
            name: bookmark.candidate.name || bookmark.candidate.user?.name || "Unknown",
            email: bookmark.candidate.email || bookmark.candidate.user?.email || "",
            skills: Array.isArray(bookmark.candidate.skills)
              ? bookmark.candidate.skills
              : typeof bookmark.candidate.skills === "string"
                ? bookmark.candidate.skills.split(",").map((s) => s.trim())
                : [],
            allocations: Array.isArray(bookmark.candidate.allocations) ? bookmark.candidate.allocations : [],
            experience: bookmark.candidate.experience || bookmark.candidate.experienceYears || bookmark.candidate.totalExperience || 0,
            currentLocation: bookmark.candidate.currentLocation || bookmark.candidate.location || "",
            expectedSalary: bookmark.candidate.expectedSalary || "",
            currentJobTitle: bookmark.candidate.currentJobTitle || bookmark.candidate.jobTitle || "",
            profile_data: bookmark.candidate.profile_data || {},
            isPremium: Boolean(bookmark.candidate.isPremium),
            isBookmarked: true, // Ensure bookmarked status is set
          }));
        }
      }

      setAllCandidates(processedRegularCandidates);
      setAllBookmarkedCandidates(processedBookmarkedCandidates);

      // Set the current view based on active tab
      updateCandidateView(processedRegularCandidates, processedBookmarkedCandidates, activeTab);

    } catch (error) {
      console.error("Error loading candidates:", error);
      showError("Failed to load candidates - " + (error.message || "Unknown error"));
      setCandidates([]);
      setPremiumCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCandidateView = (regularCandidates, bookmarkedCandidates, tab) => {
    let candidatesToShow = tab === 'bookmarked' ? bookmarkedCandidates : regularCandidates;

    // Filter candidates based on the selected ad
    if (selectedAd) {
      candidatesToShow = candidatesToShow.filter((candidate) => {
        return (
          candidate.allocations &&
          candidate.allocations.some(
            (allocation) => allocation.adId === selectedAd,
          )
        );
      });
    }

    // Separate premium candidates if employer has HR-Assist plan
    if (employerPlan === "HR_ASSIST") {
      const premium = candidatesToShow.filter((candidate) => candidate.isPremium);
      const regular = candidatesToShow.filter((candidate) => !candidate.isPremium);
      setCandidates(regular);
      setPremiumCandidates(premium);
    } else {
      setCandidates(candidatesToShow);
      setPremiumCandidates([]);
    }
  };

  const loadApprovedAds = async () => {
    try {
      const result = await getAds({ status: "APPROVED", limit: 100 });
      if (result.success) {
        let ads = [];
        if (result.data && result.data && Array.isArray(result.data)) {
          ads = result.data;
        } else if (result.data && Array.isArray(result.data)) {
          ads = result.data;
        }

        console.log("Loaded approved ads:", ads);

        const adOptions = ads.map((ad) => ({
          value: ad.id,
          label: `${ad.title} - ${ad.company?.name || "Company"}`,
        }));

        setApprovedAds(adOptions);
      }
    } catch (error) {
      console.error("Error loading approved ads:", error);
    }
  };

  const loadEducationQualifications = async () => {
    try {
      const response = await fetch("/api/shared/education-qualifications");
      const result = await response.json();

      if (result.status === "success") {
        const qualifications = [
          { value: "", label: "All Education Levels" },
          ...result.data.map((qual) => ({
            value: qual.id,
            label: qual.name,
          })),
        ];
        setEducationQualifications(qualifications);
      } else {
        const qualifications = [
          { value: "", label: "All Education Levels" },
          { value: "HIGH_SCHOOL", label: "High School" },
          { value: "DIPLOMA", label: "Diploma" },
          { value: "BACHELORS", label: "Bachelor's Degree" },
          { value: "MASTERS", label: "Master's Degree" },
          { value: "PHD", label: "PhD" },
          { value: "PROFESSIONAL", label: "Professional Certification" },
        ];
        setEducationQualifications(qualifications);
      }
    } catch (error) {
      console.error("Error loading education qualifications:", error);
      const qualifications = [
        { value: "", label: "All Education Levels" },
        { value: "HIGH_SCHOOL", label: "High School" },
        { value: "DIPLOMA", label: "Diploma" },
        { value: "BACHELORS", label: "Bachelor's Degree" },
        { value: "MASTERS", label: "Master's Degree" },
        { value: "PHD", label: "PhD" },
        { value: "PROFESSIONAL", label: "Professional Certification" },
      ];
      setEducationQualifications(qualifications);
    }
  };

  const handleStatusUpdate = async (allocationId, status, notes = "") => {
    try {
      const validStatuses = [
        "APPLIED",
        "SHORTLISTED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_COMPLETED",
        "HIRED",
        "HOLD",
        "REJECTED",
      ];

      if (!validStatuses.includes(status)) {
        showError(`Invalid status: ${status}. Please select a valid status.`);
        return;
      }

      console.log("Updating allocation status:", {
        allocationId,
        status,
        notes,
      });

      const result = await updateCandidateStatus(allocationId, status, notes);
      if (result.success) {
        showSuccess("Candidate status updated successfully");
        await loadCandidates();
      } else {
        showError(result.error || "Failed to update candidate status");
      }
    } catch (error) {
      console.error("Error updating candidate status:", error);
      showError(
        "Failed to update candidate status: " +
          (error.message || "Unknown error"),
      );
    }
  };

  // Filter logic remains the same for both regular and premium candidates
  const applyFilters = (candidateList) => {
    return candidateList.filter((candidate) => {
      const candidateName = candidate.user?.name || candidate.name || "";
      const candidateEmail = candidate.user?.email || candidate.email || "";
      const candidateJobTitle =
        candidate.currentJobTitle || candidate.jobTitle || "";

      const matchesSearch =
        !searchTerm ||
        candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidateJobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        (candidate.allocations &&
          candidate.allocations.some(
            (allocation) => allocation.status === statusFilter,
          ));

      const candidateSkills = candidate.skills || candidate.tags || [];
      const skillsArray = Array.isArray(candidateSkills)
        ? candidateSkills
        : typeof candidateSkills === "string"
          ? candidateSkills.split(",").map((s) => s.trim())
          : [];

      const matchesSkill =
        !skillFilter ||
        skillsArray.some((skill) =>
          skill.toLowerCase().includes(skillFilter.toLowerCase()),
        );

      const matchesAd =
        !selectedAd ||
        (candidate.allocations &&
          candidate.allocations.some(
            (allocation) => allocation.adId === selectedAd,
          ));

      const candidateGender =
        candidate.profile_data?.gender ||
        candidate.gender ||
        candidate.user?.gender ||
        "";
      const matchesGender =
        !genderFilter ||
        candidateGender.toLowerCase() === genderFilter.toLowerCase();

      const candidateEducation =
        candidate.profile_data?.education?.level ||
        candidate.education?.level ||
        candidate.educationLevel ||
        "";
      const matchesEducation =
        !educationFilter || candidateEducation === educationFilter;

      const candidateExp =
        parseInt(
          candidate.experience ||
            candidate.experienceYears ||
            candidate.totalExperience,
        ) || 0;
      const matchesExperience =
        !experienceFilter ||
        (() => {
          switch (experienceFilter) {
            case "0-1":
              return candidateExp >= 0 && candidateExp <= 1;
            case "1-3":
              return candidateExp >= 1 && candidateExp <= 3;
            case "3-5":
              return candidateExp >= 3 && candidateExp <= 5;
            case "5-10":
              return candidateExp >= 5 && candidateExp <= 10;
            case "10+":
              return candidateExp >= 10;
            default:
              return true;
          }
        })();

      const matchesAppliedOnly =
        !appliedOnlyFilter ||
        (candidate.allocations && candidate.allocations.length > 0);

      const matchesBookmark =
        !showBookmarkedOnly || candidate.isBookmarked === true;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSkill &&
        matchesAd &&
        matchesGender &&
        matchesEducation &&
        matchesExperience &&
        matchesAppliedOnly &&
        matchesBookmark
      );
    });
  };

  const displayedCandidates =
    viewMode === "PREMIUM"
      ? applyFilters(premiumCandidates)
      : applyFilters(candidates);

  // Update candidates when ad filter changes or active tab changes
  useEffect(() => {
    // This effect should now call updateCandidateView to re-render based on filters
    // and the active tab, using the already loaded allCandidates and allBookmarkedCandidates
    updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
  }, [selectedAd, activeTab, allCandidates, allBookmarkedCandidates, employerPlan]); // Depend on all relevant states


  const resetAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSkillFilter("");
    setExperienceFilter("");
    setGenderFilter("");
    setEducationFilter("");
    setSelectedAd("");
    setAppliedOnlyFilter(false);
    setShowBookmarkedOnly(false); // This should be handled by tab click
    setShowMoreFilters(false);
    setActiveTab('all'); // Reset to all tab

    // Update URL to remove bookmarked parameter
    const url = new URL(window.location);
    url.searchParams.delete('bookmarked');
    window.history.replaceState({}, '', url);

    // Reload all candidates to reflect the reset state
    loadAllCandidates();
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
  };

  const handleBookmarkToggle = async (candidateId, shouldBookmark) => {
    try {
      let result;
      if (shouldBookmark) {
        result = await bookmarkCandidate(candidateId);
      } else {
        result = await removeBookmark(candidateId);
      }

      if (result.success) {
        // Update the relevant candidate list (allCandidates or allBookmarkedCandidates)
        const updateCandidateList = (list) =>
          list.map((candidate) =>
            candidate.id === candidateId
              ? { ...candidate, isBookmarked: shouldBookmark }
              : candidate,
          );

        setAllCandidates(updateCandidateList(allCandidates));
        setAllBookmarkedCandidates(updateCandidateList(allBookmarkedCandidates));

        // After updating the source lists, re-apply filters and update the displayed view
        updateCandidateView(
          updateCandidateList(allCandidates),
          updateCandidateList(allBookmarkedCandidates),
          activeTab
        );
        
        // If the bookmarked filter is active and a candidate is un-bookmarked,
        // it should be removed from the currently displayed bookmarked list
        if (!shouldBookmark && activeTab === 'bookmarked') {
          setAllBookmarkedCandidates(allBookmarkedCandidates.filter(c => c.id !== candidateId));
          // Re-render the view after removal
          updateCandidateView(
            allCandidates,
            allBookmarkedCandidates.filter(c => c.id !== candidateId),
            activeTab
          );
        }
        return true;
      } else {
        showError(result.error || "Failed to update bookmark status");
        return false;
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      showError("Failed to update bookmark status: " + (error.message || "Unknown error"));
      return false;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-2 lg:px-4 py-2 lg:py-2">
        {/* Header - Mobile Optimized */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <UserGroupIcon className="h-6 w-6 lg:h-8 lg:w-8 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg lg:text-2xl font-bold text-gray-900">
                Candidates
              </h1>
            </div>
            <p className="text-gray-600 text-xs ml-8 lg:ml-11">
              {isAdminView()
                ? "Employer candidates - Admin view"
                : "Manage your candidates"}
            </p>
          </div>

          <div className="text-xs lg:text-sm text-gray-500 bg-white px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg border flex items-center">
            <UserGroupIcon className="h-3 w-3 lg:h-4 lg:w-4 mr-1 flex-shrink-0" />
            <span className="font-medium">{displayedCandidates.length}</span>
          </div>
        </div>

        {/* Tabs for All/Bookmarked */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => { 
                setActiveTab('all'); 
                // setShowBookmarkedOnly(false); // This is now implicitly handled by setActiveTab
                // Update URL to remove bookmarked parameter
                const url = new URL(window.location);
                url.searchParams.delete('bookmarked');
                window.history.replaceState({}, '', url);
                updateCandidateView(allCandidates, allBookmarkedCandidates, 'all');
              }}
              className={`text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'text-blue-600 border-blue-600' : 'border-transparent'}`}
            >
              All Candidates
            </button>
            <button
              onClick={() => { 
                setActiveTab('bookmarked'); 
                // setShowBookmarkedOnly(true); // This is now implicitly handled by setActiveTab
                // Update URL to add bookmarked parameter
                const url = new URL(window.location);
                url.searchParams.set('bookmarked', 'true');
                window.history.replaceState({}, '', url);
                updateCandidateView(allCandidates, allBookmarkedCandidates, 'bookmarked');
              }}
              className={`text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bookmarked' ? 'text-blue-600 border-blue-600' : 'border-transparent'}`}
            >
              Bookmarked Candidates
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Primary Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FormInput
              label="Global Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or job title..."
              icon={MagnifyingGlassIcon}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Ad
              </label>
              <select
                value={selectedAd}
                onChange={(e) => {
                  setSelectedAd(e.target.value);
                  updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                }}
                className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Job Ads</option>
                {approvedAds.map((ad) => (
                  <option key={ad.value} value={ad.value}>
                    {ad.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                }}
                className="w-full py-2.5 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">All Statuses</option>
                {/* Assuming AllocationStatusSelect component provides options or we define them here */}
                {/* For demonstration, using hardcoded options if AllocationStatusSelect is not available */}
                {[
                  { id: "APPLIED", label: "Applied" },
                  { id: "SHORTLISTED", label: "Shortlisted" },
                  { id: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
                  { id: "INTERVIEW_COMPLETED", label: "Interview Completed" },
                  { id: "HIRED", label: "Hired" },
                  { id: "HOLD", label: "On Hold" },
                  { id: "REJECTED", label: "Rejected" },
                ].map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bookmarked Filter Switch - REMOVED as per requirements */}
          {/* <div className="flex items-center justify-between mb-6">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showBookmarkedOnly || activeTab === 'bookmarked'}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setShowBookmarkedOnly(isChecked);

                  if (isChecked) {
                    setActiveTab('bookmarked');
                    // Update URL to add bookmarked parameter
                    const url = new URL(window.location);
                    url.searchParams.set('bookmarked', 'true');
                    window.history.replaceState({}, '', url);
                  } else {
                    setActiveTab('all');
                    // Update URL to remove bookmarked parameter
                    const url = new URL(window.location);
                    url.searchParams.delete('bookmarked');
                    window.history.replaceState({}, '', url);
                  }
                }}
                className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Show bookmarks only
              </span>
            </label>
          </div> */}

          {/* Advanced Filters Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
                Advanced Filters
                <ChevronDownIcon
                  className={`h-4 w-4 ml-2 transform transition-transform duration-200 ${
                    showMoreFilters ? "rotate-180" : ""
                  }`}
                />
                {(genderFilter ||
                  educationFilter ||
                  skillFilter ||
                  experienceFilter ||
                  appliedOnlyFilter) && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {
                      [
                        genderFilter,
                        educationFilter,
                        skillFilter,
                        experienceFilter,
                        appliedOnlyFilter,
                      ].filter(Boolean).length
                    }{" "}
                    active
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-3">
                {/* Active Filters Count */}
                {(searchTerm ||
                  selectedAd ||
                  statusFilter ||
                  genderFilter ||
                  educationFilter ||
                  skillFilter ||
                  experienceFilter ||
                  appliedOnlyFilter ||
                  showBookmarkedOnly) && ( // showBookmarkedOnly is now implicitly handled by activeTab
                  <span className="text-sm text-gray-500">
                    {
                      [
                        searchTerm,
                        selectedAd,
                        statusFilter,
                        genderFilter,
                        educationFilter,
                        skillFilter,
                        experienceFilter,
                        appliedOnlyFilter,
                      ].filter(Boolean).length
                    }{" "}
                    filters active
                  </span>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedAd("");
                    setStatusFilter("");
                    setGenderFilter("");
                    setEducationFilter("");
                    setSkillFilter("");
                    setExperienceFilter("");
                    setAppliedOnlyFilter(false);
                    setShowBookmarkedOnly(false); // Ensure this is reset if it were still used
                    setShowMoreFilters(false); // Also close advanced filters
                    loadApprovedAds(); // Reload ads to reset dropdown
                    loadEducationQualifications(); // Reload education to reset dropdown
                    setActiveTab('all'); // Reset to all tab
                    
                    // Update URL to remove bookmarked parameter
                    const url = new URL(window.location);
                    url.searchParams.delete('bookmarked');
                    window.history.replaceState({}, '', url);

                    // Reload all candidates to reflect the reset state
                    loadAllCandidates();
                  }}
                  className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Expandable Advanced Filters */}
            {showMoreFilters && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* First Row of Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={genderFilter}
                      onChange={(e) => {
                        setGenderFilter(e.target.value);
                        updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                      }}
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">All Genders</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Education Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Education
                    </label>
                    <select
                      value={educationFilter}
                      onChange={(e) => {
                        setEducationFilter(e.target.value);
                        updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                      }}
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">All Education Levels</option>
                      {educationQualifications.map((edu) => (
                        <option key={edu.value} value={edu.value}>
                          {edu.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skills Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <input
                      type="text"
                      value={skillFilter}
                      onChange={(e) => {
                        setSkillFilter(e.target.value);
                        updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                      }}
                      placeholder="e.g., JavaScript, React, Python"
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    />
                  </div>

                  {/* Experience Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={experienceFilter}
                      onChange={(e) => {
                        setExperienceFilter(e.target.value);
                        updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                      }}
                      className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">All Experience Levels</option>
                      <option value="0-1">0-1 years (Fresher)</option>
                      <option value="1-3">1-3 years (Junior)</option>
                      <option value="3-5">3-5 years (Mid-level)</option>
                      <option value="5-10">5-10 years (Senior)</option>
                      <option value="10+">10+ years (Expert)</option>
                    </select>
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-3 pt-2 border-t border-gray-200">
                  <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200">
                    <input
                      type="checkbox"
                      checked={appliedOnlyFilter}
                      onChange={(e) => {
                        setAppliedOnlyFilter(e.target.checked);
                        updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Show only candidates who have applied to my job ads
                    </span>
                  </label>
                </div>

                {/* Advanced Filter Actions */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    Use these filters to narrow down candidates based on
                    specific criteria
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setGenderFilter("");
                      setEducationFilter("");
                      setSkillFilter("");
                      setExperienceFilter("");
                      setAppliedOnlyFilter(false);
                      // Re-apply filters after clearing advanced ones
                      updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                    }}
                    className="text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                  >
                    Clear Advanced Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Mode Toggle for HR-Assist plan */}
        {employerPlan === "HR_ASSIST" &&
          (premiumCandidates.length > 0 || candidates.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">
                  View:
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setViewMode("ALL");
                      updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      viewMode === "ALL"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Candidates ({candidates.length})
                  </button>
                  <button
                    onClick={() => {
                      setViewMode("PREMIUM");
                      updateCandidateView(allCandidates, allBookmarkedCandidates, activeTab);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      viewMode === "PREMIUM"
                        ? "bg-gold-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Premium Candidates ({premiumCandidates.length})
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Candidates Grid */}
        {displayedCandidates.length > 0 ? (
          <div className="space-y-2 lg:space-y-4">
            {displayedCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onStatusUpdate={handleStatusUpdate}
                onViewProfile={handleViewCandidate}
                onBookmarkToggle={handleBookmarkToggle}
                loading={{}}
                className="shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 lg:py-12 bg-white rounded-xl border border-gray-200">
            <UserGroupIcon className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm lg:text-base font-medium text-gray-900">
              No candidates found
            </h3>
            <p className="mt-1 text-xs lg:text-sm text-gray-500 px-4">
              No candidates match your current search criteria.
            </p>
            {(searchTerm ||
              statusFilter ||
              selectedAd ||
              genderFilter ||
              educationFilter ||
              skillFilter ||
              experienceFilter ||
              appliedOnlyFilter ||
              showBookmarkedOnly) && ( // showBookmarkedOnly is now implicitly handled by activeTab
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllFilters}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}

        {/* Candidate Details Modal */}
        {selectedCandidate && (
          <Modal
            isOpen={showCandidateModal}
            onClose={() => {
              setShowCandidateModal(false);
              setSelectedCandidate(null);
            }}
            title="Candidate Details"
            size="lg"
          >
            <div className="space-y-6">
              {/* Candidate Header */}
              <div className="flex items-center space-x-4">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  src={
                    selectedCandidate.user?.profileImage ||
                    `https://ui-avatars.com/api/?name=${selectedCandidate.user?.name}&background=1976d2&color=fff`
                  }
                  alt={selectedCandidate.user?.name || "Candidate"}
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedCandidate.user?.name || "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCandidate.currentJobTitle || "No job title"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedCandidate.user?.email || "N/A"}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </h4>
                  <p className="text-sm text-gray-900">
                    {selectedCandidate.experience || "N/A"} years
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Current Location
                  </h4>
                  <p className="text-sm text-gray-900">
                    {selectedCandidate.currentLocation || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Expected Salary
                  </h4>
                  <p className="text-sm text-gray-900">
                    ₹{selectedCandidate.expectedSalary || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Status
                  </h4>
                  {selectedCandidate.status ? (
                    <AllocationStatusBadge
                      status={selectedCandidate.status}
                      size="sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">No status</span>
                  )}
                </div>
              </div>

              {/* Skills */}
              {selectedCandidate.skills &&
                selectedCandidate.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Bio */}
              {selectedCandidate.bio && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </h4>
                  <p className="text-sm text-gray-900">
                    {selectedCandidate.bio}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Candidates;