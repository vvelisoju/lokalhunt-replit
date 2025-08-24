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
  getAllCandidates,
  updateCandidateStatus,
} from "../../services/employer/candidates";
import { getAds } from "../../services/employer/ads";
import { useRole } from "../../context/RoleContext";
import { toast } from "react-hot-toast";

const Candidates = () => {
  const [searchParams] = useSearchParams();

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const {
    isAdminView = () => false,
    isBranchAdmin = () => false,
    can = () => false,
    targetEmployer = null,
    getCurrentEmployerId = () => null,
  } = roleContext || {};

  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);

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

  useEffect(() => {
    loadCandidates();
    loadApprovedAds();
    loadEducationQualifications();
  }, []);

  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const result = await getAllCandidates();

      if (result.success) {
        // Based on the API response structure, candidates are in result.data.data.candidates
        let allCandidates = [];

        if (
          result.data &&
          result.data.data &&
          Array.isArray(result.data.data.candidates)
        ) {
          allCandidates = result.data.data.candidates;
        } else if (result.data && Array.isArray(result.data.candidates)) {
          allCandidates = result.data.candidates;
        } else if (result.data && Array.isArray(result.data.data)) {
          allCandidates = result.data.data;
        } else if (result.data && Array.isArray(result.data)) {
          allCandidates = result.data;
        }

        console.log("Loaded candidates:", allCandidates);

        // If we have an ad filter, only show candidates for that specific ad
        if (selectedAd) {
          allCandidates = allCandidates.filter((candidate) => {
            return (
              candidate.allocations &&
              candidate.allocations.some(
                (allocation) => allocation.adId === selectedAd,
              )
            );
          });
        }

        setCandidates(allCandidates);
      } else {
        toast.error(result.error || "Failed to load candidates");
        setCandidates([]);
      }
    } catch (error) {
      console.error("Error loading candidates:", error);
      toast.error(
        "Failed to load candidates - " + (error.message || "Unknown error"),
      );
      setCandidates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadApprovedAds = async () => {
    try {
      const result = await getAds({ status: "APPROVED", limit: 100 });
      if (result.success) {
        // Handle the API response structure properly
        let ads = [];
        if (
          result.data &&
          result.data.data &&
          Array.isArray(result.data.data)
        ) {
          ads = result.data.data;
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
        // Fallback to static data if API fails
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
      // Fallback to static data
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
      // Validate status before API call
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
        toast.error(`Invalid status: ${status}. Please select a valid status.`);
        return;
      }

      console.log("Updating allocation status:", {
        allocationId,
        status,
        notes,
      });

      const result = await updateCandidateStatus(allocationId, status, notes);
      if (result.success) {
        toast.success("Candidate status updated successfully");
        // Reload candidates to get updated data
        await loadCandidates();
      } else {
        toast.error(result.error || "Failed to update candidate status");
      }
    } catch (error) {
      console.error("Error updating candidate status:", error);
      toast.error(
        "Failed to update candidate status: " +
          (error.message || "Unknown error"),
      );
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    // Search filter - check name, email, job title
    const candidateName = candidate.user?.name || candidate.name || "";
    const candidateEmail = candidate.user?.email || candidate.email || "";
    const candidateJobTitle =
      candidate.currentJobTitle || candidate.jobTitle || "";

    const matchesSearch =
      !searchTerm ||
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidateJobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter - check allocations for status
    const matchesStatus =
      !statusFilter ||
      (candidate.allocations &&
        candidate.allocations.some(
          (allocation) => allocation.status === statusFilter,
        ));

    // Skills filter - handle both array and string formats
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

    // Job Ad filter
    const matchesAd =
      !selectedAd ||
      (candidate.allocations &&
        candidate.allocations.some(
          (allocation) => allocation.adId === selectedAd,
        ));

    // Gender filter - check profile data or user data
    const candidateGender =
      candidate.profile_data?.gender ||
      candidate.gender ||
      candidate.user?.gender ||
      "";
    const matchesGender =
      !genderFilter ||
      candidateGender.toLowerCase() === genderFilter.toLowerCase();

    // Education filter - check profile data for education level
    const candidateEducation =
      candidate.profile_data?.education?.level ||
      candidate.education?.level ||
      candidate.educationLevel ||
      "";
    const matchesEducation =
      !educationFilter || candidateEducation === educationFilter;

    // Experience filter - Parse experience ranges and match
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

    // Applied candidates only filter - show only candidates who have applied to employer's ads
    const matchesAppliedOnly =
      !appliedOnlyFilter ||
      (candidate.allocations && candidate.allocations.length > 0);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSkill &&
      matchesAd &&
      matchesGender &&
      matchesEducation &&
      matchesExperience &&
      matchesAppliedOnly
    );
  });

  // Update candidates when ad filter changes
  useEffect(() => {
    loadCandidates();
  }, [selectedAd]);

  const resetAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSkillFilter("");
    setExperienceFilter("");
    setGenderFilter("");
    setEducationFilter("");
    setSelectedAd("");
    setAppliedOnlyFilter(false);
    setShowMoreFilters(false);
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCandidateModal(true);
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
            <span className="font-medium">{filteredCandidates.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-3 lg:px-6 py-3 lg:py-5 mb-3 lg:mb-8">
          {/* Primary Filters - Mobile Optimized */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4 mb-3 lg:mb-4">
            {/* Mobile: Only Job Ad and Status visible */}
            <div className="lg:hidden">
              <Select
                label="Job Ad"
                value={selectedAd}
                onChange={(value) => setSelectedAd(value)}
                options={[...approvedAds]}
                placeholder="All Job Ads"
              />
            </div>
            <div className="lg:hidden">
              <AllocationStatusSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                includeAll={true}
                placeholder="All Statuses"
              />
            </div>

            {/* Desktop: All primary filters visible */}
            <div className="hidden lg:block lg:col-span-1">
              <FormInput
                label="Global Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or job title..."
                icon={MagnifyingGlassIcon}
              />
            </div>
            <div className="hidden lg:block">
              <Select
                label="Job Ad"
                value={selectedAd}
                onChange={(value) => setSelectedAd(value)}
                options={[...approvedAds]}
                placeholder="All Job Ads"
              />
            </div>
            <div className="hidden lg:block">
              <AllocationStatusSelect
                label="Status"
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                includeAll={true}
                placeholder="All Statuses"
              />
            </div>
            <div className="hidden lg:flex lg:items-end">
              <Button
                variant="outline"
                onClick={resetAllFilters}
                className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                title="Reset all filters"
              >
                <XMarkIcon className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* More Filters Toggle */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FunnelIcon className="h-4 w-4" />
                More Filters
                {showMoreFilters ? (
                  <ChevronUpIcon className="h-4 w-4" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4" />
                )}
                {(searchTerm ||
                  genderFilter ||
                  educationFilter ||
                  skillFilter ||
                  experienceFilter ||
                  appliedOnlyFilter) && (
                  <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {
                      [
                        searchTerm,
                        genderFilter,
                        educationFilter,
                        skillFilter,
                        experienceFilter,
                        appliedOnlyFilter,
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </button>

              {/* Reset Filters - Mobile Visible */}
              <div className="lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAllFilters}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 px-3 py-1.5"
                  title="Reset all filters"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                  <span className="text-xs">Reset</span>
                </Button>
              </div>
            </div>

            {/* Additional Filters - Collapsible */}
            {showMoreFilters && (
              <div className="mt-4 p-3 lg:p-4 bg-gray-50 rounded-lg space-y-3 lg:space-y-0">
                {/* Global Search - Mobile Only */}
                <div className="lg:hidden">
                  <FormInput
                    label="Global Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or job title..."
                    icon={MagnifyingGlassIcon}
                  />
                </div>

                {/* Filter Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-4">
                  <Select
                    label="Gender"
                    value={genderFilter}
                    onChange={(value) => setGenderFilter(value)}
                    options={genderOptions}
                  />
                  <Select
                    label="Education"
                    value={educationFilter}
                    onChange={(value) => setEducationFilter(value)}
                    options={educationQualifications}
                  />
                  <FormInput
                    label="Skills"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="Filter by skills..."
                  />
                  <Select
                    label="Experience"
                    value={experienceFilter}
                    onChange={(value) => setExperienceFilter(value)}
                    options={experienceOptions}
                  />
                </div>

                {/* Applied Candidates Only Toggle */}
                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={appliedOnlyFilter}
                      onChange={(e) => setAppliedOnlyFilter(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Show only candidates who have applied to my job ads
                    </span>
                  </label>
                </div>

                {/* Clear More Filters */}
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setGenderFilter("");
                      setEducationFilter("");
                      setSkillFilter("");
                      setExperienceFilter("");
                      setAppliedOnlyFilter(false);
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Clear More Filters
                  </Button>

                  {/* Desktop Reset All Filters */}
                  <div className="hidden lg:block">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetAllFilters}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                      title="Reset all filters"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      Reset All Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length > 0 ? (
          <div className="space-y-2 lg:space-y-4">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                onStatusUpdate={handleStatusUpdate}
                onViewProfile={handleViewCandidate}
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
              appliedOnlyFilter) && (
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
