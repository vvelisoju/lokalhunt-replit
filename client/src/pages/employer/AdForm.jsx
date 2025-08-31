import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

import FormInput from "../../components/ui/FormInput";
import TextArea from "../../components/ui/TextArea";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import CategorySearchSelect from "../../components/ui/CategorySearchSelect";
import {
  createAd,
  updateAd,
  getAd,
  submitForApproval,
} from "../../services/employer/ads";
import { getCompanies } from "../../services/employer/companies";
import aiService from "../../services/aiService";
import { getCities } from "../../services/common/cities";
import { publicApi } from "../../services/publicApi";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const AdForm = () => {
  const { adId, employerId } = useParams(); // employerId will be present in Branch Admin routes
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Extract 'from' parameter from URL to determine redirect destination
  const searchParams = new URLSearchParams(location.search);
  const fromParam = searchParams.get('from');

  // Check if this is a Branch Admin editing an employer's ad
  const isBranchAdminEdit = user?.role === 'BRANCH_ADMIN' && employerId;

  const isEditing = !!adId;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryName: "Jobs",
    categoryId: "",
    city: "",
    employmentType: "",
    experienceLevel: "",
    salaryMin: "",
    salaryMax: "",
    skills: "",
    validUntil: "",
    companyId: "",
    gender: "",
    educationQualificationId: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(isEditing);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [currentJobStatus, setCurrentJobStatus] = useState(null);

  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [categories, setCategories] = useState([]);
  const [educationQualifications, setEducationQualifications] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingEducation, setLoadingEducation] = useState(false);

  const employmentTypes = [
    { value: "FULL_TIME", label: "Full Time" },
    { value: "PART_TIME", label: "Part Time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "FREELANCE", label: "Freelance" },
    { value: "INTERNSHIP", label: "Internship" },
  ];

  const experienceLevels = [
    { value: "ENTRY_LEVEL", label: "Entry Level (0-2 years)" },
    { value: "MID_LEVEL", label: "Mid Level (2-5 years)" },
    { value: "SENIOR_LEVEL", label: "Senior Level (5+ years)" },
    { value: "EXECUTIVE", label: "Executive Level" },
  ];

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
    { value: "BOTH", label: "Both (Male & Female)" },
  ];

  // Form validation helpers for each step
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.companyId) {
      newErrors.companyId = "Company is required";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.validUntil) {
      newErrors.validUntil = "Application deadline is required";
    } else {
      const validDate = new Date(formData.validUntil);
      const today = new Date();
      if (validDate <= today) {
        newErrors.validUntil = "Valid until date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.employmentType) {
      newErrors.employmentType = "Employment type is required";
    }
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = "Experience level is required";
    }
    if (formData.salaryMin && formData.salaryMax) {
      if (parseInt(formData.salaryMin) >= parseInt(formData.salaryMax)) {
        newErrors.salaryMax =
          "Maximum salary must be greater than minimum salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStepCompleteness = (step) => {
    switch (step) {
      case 1:
        const step1Fields = ["title", "companyId", "city", "validUntil"];
        const step1Completed = step1Fields.filter(
          (field) => formData[field]?.trim?.() || formData[field],
        ).length;
        return Math.round((step1Completed / step1Fields.length) * 100);

      case 2:
        const step2Fields = ["employmentType", "experienceLevel"];
        const step2Completed = step2Fields.filter(
          (field) => formData[field]?.trim?.() || formData[field],
        ).length;
        return Math.round((step2Completed / step2Fields.length) * 100);

      case 3:
        return formData.description?.trim() ? 100 : 0;

      default:
        return 0;
    }
  };

  const handleNextStep = () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      default:
        isValid = true;
    }

    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [adId, employerId]);

  const loadInitialData = async () => {
    setIsPageLoading(true);
    try {
      // Load companies first
      const companiesResult = await getCompanies();
      let defaultCompanyId = "";
      let companiesOptions = [];

      if (companiesResult.success) {
        console.log("Companies loaded for dropdown:", companiesResult.data);
        const companiesList = companiesResult.data.data || [];
        companiesOptions = companiesList.map((company) => ({
          value: company.id,
          label: company.name,
        }));
        setCompanies(companiesOptions);

        // Set first company as default for new ads
        if (!isEditing && companiesOptions.length > 0) {
          defaultCompanyId = companiesOptions[0].value;
        }
      } else {
        console.error("Failed to load companies:", companiesResult.error);
        toast.error("Failed to load companies");
      }

      // Load cities, categories, and education qualifications in parallel
      setLoadingCities(true);
      setLoadingCategories(true);
      setLoadingEducation(true);

      const [citiesResult, categoriesResult, educationResult] = await Promise.all([
        getCities().catch(err => ({ success: false, error: err.message })),
        publicApi.getCategories().catch(err => ({ success: false, error: err.message })),
        publicApi.getEducationQualifications().catch(err => ({ success: false, error: err.message }))
      ]);

      // Process cities
      let defaultCityId = "";
      let citiesOptions = [];

      if (citiesResult.success) {
        console.log("Cities loaded successfully:", citiesResult.data);
        citiesOptions = citiesResult.data.map((city) => ({
          value: city.id,
          label: `${city.name}, ${city.state}`,
        }));
        setCities(citiesOptions);

        // Set first city as default for new ads
        if (!isEditing && citiesOptions.length > 0) {
          defaultCityId = citiesOptions[0].value;
        }
      } else {
        console.error("Failed to load cities:", citiesResult.error);
        toast.error("Failed to load cities");
      }
      setLoadingCities(false);

      // Process categories
      if (categoriesResult.status === "success") {
        console.log("Categories loaded successfully:", categoriesResult.data);
        setCategories(
          categoriesResult.data.map((category) => ({
            value: category.id,
            label: category.name,
          })),
        );
      } else {
        console.error("Failed to load categories:", categoriesResult.error || "Unknown error");
        toast.error("Failed to load categories");
      }
      setLoadingCategories(false);

      // Process education qualifications
      if (educationResult.status === "success") {
        console.log("Education qualifications loaded successfully:", educationResult.data);
        setEducationQualifications(
          educationResult.data.map((qualification) => ({
            value: qualification.id,
            label: qualification.name,
          })),
        );
      } else {
        console.error("Failed to load education qualifications:", educationResult.error || "Unknown error");
        toast.error("Failed to load education qualifications");
      }
      setLoadingEducation(false);

      // Now handle ad data loading or setting defaults
      if (isEditing) {
        await loadAdData();
      } else {
        // Set default values for new ads
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 15);

        setFormData((prev) => ({
          ...prev,
          companyId: defaultCompanyId,
          city: defaultCityId,
          validUntil: defaultDate.toISOString().split("T")[0],
          employmentType: "FULL_TIME",
          experienceLevel: "ENTRY_LEVEL",
          gender: "BOTH",
        }));
      }
    } catch (error) {
      console.error("Error in loadInitialData:", error);
      toast.error("Failed to load form data");
    } finally {
      setIsPageLoading(false);
    }
  };

  const loadAdData = async () => {
    try {
      console.log("Loading ad data for adId:", adId);

      // Use different endpoint for Branch Admin
      let response;
      if (isBranchAdminEdit) {
        // Use Branch Admin API to get ad details
        const apiResponse = await fetch(`/api/branch-admins/ads/${adId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await apiResponse.json();
        if (!result.status || result.status !== 'success') {
          throw new Error(result.message || 'Failed to load ad');
        }
        response = { success: true, data: result.data };
      } else {
        response = await getAd(adId);
      }

      if (response.success) {
        console.log("Ad data loaded successfully:", response.data);
        const ad = response.data.data || response.data;

        // Set current job status for conditional rendering
        setCurrentJobStatus(ad.status);

        // Parse category specific fields for job details
        const categorySpecificFields = ad.categorySpecificFields || {};

        // Handle employment type mapping
        let employmentType =
          ad.employmentType || categorySpecificFields.employmentType || "";

        // Handle experience level mapping
        let experienceLevel =
          ad.experienceLevel || categorySpecificFields.experienceLevel || "";

        // Handle salary mapping - check multiple possible locations
        let salaryMin = "";
        let salaryMax = "";

        if (ad.salaryMin) {
          salaryMin = ad.salaryMin.toString();
        } else if (categorySpecificFields.salaryMin) {
          salaryMin = categorySpecificFields.salaryMin.toString();
        } else if (categorySpecificFields.salaryRange?.min) {
          salaryMin = categorySpecificFields.salaryRange.min.toString();
        }

        if (ad.salaryMax) {
          salaryMax = ad.salaryMax.toString();
        } else if (categorySpecificFields.salaryMax) {
          salaryMax = categorySpecificFields.salaryMax.toString();
        } else if (categorySpecificFields.salaryRange?.max) {
          salaryMax = categorySpecificFields.salaryRange.max.toString();
        }

        // Handle skills mapping - check multiple possible locations
        let skills = "";
        if (ad.skills) {
          skills = Array.isArray(ad.skills)
            ? ad.skills.join(", ")
            : ad.skills;
        } else if (categorySpecificFields.skills) {
          skills = Array.isArray(categorySpecificFields.skills)
            ? categorySpecificFields.skills.join(", ")
            : categorySpecificFields.skills;
        } else if (categorySpecificFields.requiredSkills) {
          skills = Array.isArray(categorySpecificFields.requiredSkills)
            ? categorySpecificFields.requiredSkills.join(", ")
            : categorySpecificFields.requiredSkills;
        }

        setFormData({
          title: ad.title || "",
          description: ad.description || "",
          categoryName: ad.categoryName || "Jobs",
          categoryId: ad.categoryId || "",
          city: ad.locationId || ad.location?.id || "",
          employmentType: employmentType,
          experienceLevel: experienceLevel,
          salaryMin: salaryMin,
          salaryMax: salaryMax,
          skills: skills,
          validUntil: ad.validUntil ? ad.validUntil.split("T")[0] : "",
          companyId: ad.companyId || "",
          gender: ad.gender || "",
          educationQualificationId: ad.educationQualificationId || "",
        });
      } else {
        console.error("Failed to load ad data:", response.error);
        toast.error("Failed to load ad data");
        navigate("/employer/ads");
      }
    } catch (error) {
      console.error("Error loading ad data:", error);
      toast.error("Failed to load ad data");
      navigate("/employer/ads");
    }
  };


  const handleChange = (e, fieldName = null) => {
    let name, value;

    // Handle direct value calls (from Select components)
    if (fieldName) {
      name = fieldName;
      value = e;
    } 
    // Handle event object calls (from regular inputs)
    else if (e && e.target) {
      name = e.target.name;
      value = e.target.value;
    } else {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value || "" }));
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: "" }));
    }
  };

  const handleGenerateDescription = async () => {
    // Check if we have minimum required data
    if (!formData.title) {
      toast.error("Please enter a job title first");
      return;
    }

    setIsGeneratingDescription(true);

    try {
      // Get company name for context
      const selectedCompany = companies.find(
        (c) => c.value === formData.companyId,
      );
      const selectedCity = cities.find((c) => c.value === formData.city);

      const jobData = {
        title: formData.title,
        companyName: selectedCompany?.label || "Local Business",
        location: selectedCity?.label || "Local Area",
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        skills: formData.skills,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
      };

      const response = await aiService.generateJobDescription(jobData);

      if (response.success) {
        setFormData((prev) => ({
          ...prev,
          description: response.data.description,
        }));
        toast.success("Job description generated successfully!");
      } else {
        console.error("AI Generation Failed:", response.error);
        toast.error(response.error || "Failed to generate job description");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      if (error.response?.status === 404) {
        toast.error("AI service not available. Please contact support.");
      } else if (error.response?.status === 500) {
        toast.error(
          "AI service configuration error. Please contact administrator.",
        );
      } else {
        toast.error("Failed to generate job description. Please try again.");
      }
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleApprove = async () => {
    if (!user || user.role !== "BRANCH_ADMIN") {
      toast.error("Only Branch Admins can approve ads");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/branch-admin/ads/${adId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Ad approved successfully");
        navigate("/branch-admin/ads-approvals");
      } else {
        toast.error(result.error || "Failed to approve ad");
      }
    } catch (error) {
      toast.error("Failed to approve ad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (action = "save") => {
    // Validate all steps before submitting
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsLoading(true);

    // Map frontend form data to backend expected format
    const adData = {
      companyId: formData.companyId,
      categoryName: formData.categoryName,
      categoryId: formData.categoryId,
      title: formData.title,
      description: formData.description,
      locationId: formData.city, // Now using actual city ID from cities API
      gender: formData.gender,
      educationQualificationId: formData.educationQualificationId,
      validUntil: formData.validUntil,
      status:
        action === "submit"
          ? "PENDING_APPROVAL"
          : currentJobStatus === "PENDING_APPROVAL"
            ? "PENDING_APPROVAL"
            : "DRAFT",
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
        .join(", "),
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
      experienceLevel: formData.experienceLevel,
      employmentType: formData.employmentType,
      contactInfo: null, // Can be added later if needed
    };

    console.log("Submitting ad data:", adData);

    try {
      let response;
      if (isEditing) {
        if (isBranchAdminEdit) {
          // Use Branch Admin API for updates
          response = await fetch(`/api/employers/ads/${adId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ ...adData, employerId })
          });
          const result = await response.json();
          response = { success: result.status === 'success', data: result.data, error: result.message };
        } else {
          response = await updateAd(adId, adData);
        }
      } else {
        if (isBranchAdminEdit) {
          // Branch Admin creating ad for employer
          response = await fetch('/api/employers/ads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ ...adData, employerId })
          });
          const result = await response.json();
          response = { success: result.status === 'success', data: result.data, error: result.message };
        } else {
          response = await createAd(adData);
        }
      }

      if (response.success) {
        toast.success(isEditing ? 'Ad updated successfully' : 'Ad created successfully');

        // Enhanced redirection logic based on 'from' parameter
        if (isBranchAdminEdit) {
          if (fromParam === 'approval') {
            navigate('/branch-admin/ads'); // ads approval page
          } else if (fromParam === 'employer') {
            navigate(`/branch-admin/employers/${employerId}/ads`); // employer ads page
          } else {
            // Fallback: check sessionStorage for backward compatibility
            const redirectUrl = sessionStorage.getItem('redirectAfterEdit');
            if (redirectUrl) {
              sessionStorage.removeItem('redirectAfterEdit');
              navigate(redirectUrl);
            } else {
              navigate('/branch-admin/ads'); // default fallback
            }
          }
        } else {
          navigate('/employer/ads');
        }
      } else {
        toast.error(response.error || (isEditing ? 'Failed to update ad' : 'Failed to create ad'));
      }
    } catch (error) {
      toast.error(isEditing ? "Failed to update ad" : "Failed to create ad");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Use same redirection logic as submit handler for cancel button
    if (isBranchAdminEdit) {
      if (fromParam === 'approval') {
        navigate('/branch-admin/ads');
      } else if (fromParam === 'employer') {
        navigate(`/branch-admin/employers/${employerId}/ads`);
      } else {
        // Fallback: check sessionStorage for backward compatibility
        const redirectUrl = sessionStorage.getItem('redirectAfterEdit');
        if (redirectUrl) {
          sessionStorage.removeItem('redirectAfterEdit');
          navigate(redirectUrl);
        } else {
          navigate('/branch-admin/ads');
        }
      }
    } else {
      navigate('/employer/ads');
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Basic Information
                </h2>
                <p className="hidden md:block text-sm text-gray-500 mt-1">
                  Start with the essential details about your job posting
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <FormInput
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer, Marketing Manager"
                required
                error={errors.title}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company <span className="text-red-500">*</span>
                </label>
                <Select
                  name="companyId"
                  value={formData.companyId}
                  onChange={(value) => handleChange(value, 'companyId')}
                  options={companies}
                  placeholder="Select your company"
                  required
                  error={errors.companyId}
                />
                {errors.companyId && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.companyId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <Select
                  name="city"
                  value={formData.city}
                  onChange={(value) => handleChange(value, 'city')}
                  options={cities}
                  placeholder="Select job location"
                  required
                  disabled={loadingCities}
                  error={errors.city}
                />
                {errors.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                )}
              </div>

              <FormInput
                label="Application Deadline"
                name="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={handleChange}
                required
                error={errors.validUntil}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Job Requirements
                </h2>
                <p className="hidden md:block text-sm text-gray-500 mt-1">
                  Define the role specifics and requirements
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <Select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={(value) => handleChange(value, 'employmentType')}
                  options={employmentTypes}
                  placeholder="Select employment type"
                  required
                  error={errors.employmentType}
                />
                {errors.employmentType && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.employmentType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <Select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(value) => handleChange(value, 'experienceLevel')}
                  options={experienceLevels}
                  placeholder="Select required experience"
                  required
                  error={errors.experienceLevel}
                />
                {errors.experienceLevel && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.experienceLevel}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender Preference
                </label>
                <div className="space-y-2">
                  {genderOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value={option.value}
                        checked={formData.gender === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
                )}
              </div>

              <CategorySearchSelect
                label="Job Category"
                value={formData.categoryId}
                onChange={(value) => {
                  setFormData((prev) => ({ ...prev, categoryId: value }));
                  if (errors.categoryId) {
                    setErrors((prev) => ({ ...prev, categoryId: "" }));
                  }
                }}
                options={categories}
                loading={loadingCategories}
                placeholder="Search and select job category..."
                error={errors.categoryId}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Education Qualification
                </label>
                <Select
                  name="educationQualificationId"
                  value={formData.educationQualificationId}
                  onChange={(value) => handleChange(value, 'educationQualificationId')}
                  options={educationQualifications}
                  placeholder="Select education requirement"
                  disabled={loadingEducation}
                  error={errors.educationQualificationId}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Minimum Salary (₹)"
                  name="salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g., 50000"
                  error={errors.salaryMin}
                />

                <FormInput
                  label="Maximum Salary (₹)"
                  name="salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g., 80000"
                  error={errors.salaryMax}
                />
              </div>

              <div>
                <FormInput
                  label="Required Skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, React, Node.js (comma separated)"
                  error={errors.skills}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple skills with commas
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <InformationCircleIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  Job Description
                </h2>
                <p className="hidden md:block text-sm text-gray-500 mt-1">
                  Provide a detailed description of the job role
                </p>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription || !formData.title}
                  className="flex items-center bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
                >
                  {isGeneratingDescription ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate with AI</>
                  )}
                </Button>
              </div>

              <div className="border border-gray-300 rounded-md overflow-hidden">
                <MDEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                  preview="edit"
                  hideToolbar={false}
                  visibleDragBar={false}
                  commands={[
                    // Keep only essential formatting options
                    commands.bold,
                    commands.italic,
                    commands.divider,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.divider,
                    commands.title2,
                    commands.title3,
                  ]}
                  extraCommands={[]}
                  textareaProps={{
                    placeholder:
                      "Describe the role, responsibilities, requirements, and benefits. Use basic formatting like **bold**, *italic*, lists, and headings...",
                    style: {
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontFamily: "inherit",
                      minHeight: "200px",
                    },
                  }}
                  height={250}
                  data-color-mode="light"
                />
              </div>

              {errors.description && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.description}
                </p>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">💡 Formatting Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Use **bold** for key points and *italic* for emphasis
                      </li>
                      <li>
                        Create bullet lists for responsibilities and
                        requirements
                      </li>
                      <li>
                        Use headings for sections (## Responsibilities, ###
                        Benefits)
                      </li>
                      <li>
                        Keep it simple and readable for better candidate
                        experience
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", completeness: getStepCompleteness(1) },
    { number: 2, title: "Job Info", completeness: getStepCompleteness(2) },
    { number: 3, title: "Description", completeness: getStepCompleteness(3) },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white rounded-lg shadow-sm">
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {isEditing ? "Edit Job Posting" : "Create Job Posting"}
              </h1>
              <p className="hidden md:block text-gray-600 mt-1">
                {isEditing
                  ? "Update your job posting details"
                  : "Create a compelling job posting to attract the best candidates"}
              </p>
            </div>
            {/* Mobile step indicator */}
            <div className="sm:hidden flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-500">Step</span>
              <span className="text-lg font-bold text-blue-600">
                {currentStep}
              </span>
              <span className="text-sm font-medium text-gray-500">
                of {steps.length}
              </span>
            </div>
          </div>

          {/* Progress Steps - Hidden on mobile */}
          <div className="hidden md:flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs lg:text-sm font-medium mb-2 ${
                      currentStep === step.number
                        ? "bg-blue-600 text-white"
                        : currentStep > step.number
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-4 h-4 lg:w-6 lg:h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="text-xs lg:text-sm font-medium text-gray-700 text-center">
                    {step.title}
                  </span>
                  <div className="w-full bg-gray-200 rounded-full h-1 lg:h-1.5 mt-1 lg:mt-2">
                    <div
                      className="bg-blue-600 h-1 lg:h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${step.completeness}%` }}
                    ></div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 lg:mx-4 ${
                      currentStep > step.number ? "bg-green-600" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-2 md:p-6">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="pt-6 border-t">
            {/* Mobile Layout - 2 buttons per row */}
            <div className="sm:hidden px-2 pb-4">
              {currentStep < 3 ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* First row - Cancel and Save as Draft */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSubmit("save")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Save as Draft
                    </Button>
                  </div>

                  {/* Second row - Submit for Approval (full width if available) */}
                  {(!isEditing || (isEditing && currentJobStatus === "DRAFT")) && (
                    <Button
                      type="button"
                      onClick={() => handleSubmit("submit")}
                      disabled={isLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit for Approval
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Layout - Original layout */}
            <div className="hidden sm:flex justify-between px-6 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="sm:w-auto"
              >
                Cancel
              </Button>
              <div className="flex space-x-3">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={isLoading}
                    className="sm:w-auto flex items-center"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isLoading}
                    className="sm:w-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    {/* Save as Draft button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSubmit("save")}
                      disabled={isLoading}
                      className="sm:w-auto"
                    >
                      Save as Draft
                    </Button>
                    {/* Submit for Approval button for new jobs or draft jobs */}
                    {(!isEditing ||
                      (isEditing && currentJobStatus === "DRAFT")) && (
                      <Button
                        type="button"
                        onClick={() => handleSubmit("submit")}
                        disabled={isLoading}
                        className="sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Submit for Approval
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Show info for non-draft jobs when editing */}
        {isEditing && currentJobStatus && currentJobStatus !== "DRAFT" && (
          <p className="text-sm text-gray-600 mt-2 text-center sm:text-right px-6">
            {currentJobStatus === "PENDING_APPROVAL" &&
              "This job is pending approval and cannot be submitted again."}
            {currentJobStatus === "APPROVED" &&
              "This job has been approved and cannot be modified."}
            {currentJobStatus === "ARCHIVED" &&
              "This job is archived and cannot be modified."}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdForm;