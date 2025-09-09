import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  BuildingOfficeIcon,
  PencilIcon,
  MapPinIcon,
  GlobeAltIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import CompanyForm from "../../components/employer/CompanyForm";
import EmptyState from "../../components/employer/EmptyState";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import Modal from "../../components/ui/Modal";
import {
  getCompanies,
  createCompany,
  updateCompany,
} from "../../services/employer/companies";
import { useRole } from "../../context/RoleContext";
import { toast } from "react-hot-toast";

const CompanyProfile = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role context for Branch Admin functionality
  const roleContext = useRole();
  const {
    isAdminView = () => false,
    isBranchAdmin = () => false,
    can = () => false,
    targetEmployer = null,
    getCurrentEmployerId = () => null,
  } = roleContext || {};

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    console.log("Loading companies...");
    setIsLoading(true);
    try {
      const result = await getCompanies();
      if (result.success) {
        // The API returns companies array in triple nested data
        setCompanies(result.data || []);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to load companies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompany = async (companyData) => {
    setIsSubmitting(true);
    try {
      const result = await createCompany(companyData);
      if (result.success) {
        toast.success("Company created successfully");
        setShowForm(false);
        loadCompanies();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to create company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompany = async (companyData) => {
    if (!editingCompany) return;

    setIsSubmitting(true);
    try {
      const result = await updateCompany(editingCompany.id, companyData);
      if (result.success) {
        toast.success("Company updated successfully");
        setShowForm(false);
        setEditingCompany(null);
        loadCompanies();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to update company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetAsDefault = async (companyId) => {
    try {
      const result = await updateCompany(companyId, { isDefault: true });
      if (result.success) {
        toast.success("Company set as default successfully");
        loadCompanies();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to set company as default");
    }
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  const handleFormSubmit = (companyData) => {
    if (editingCompany) {
      handleUpdateCompany(companyData);
    } else {
      handleCreateCompany(companyData);
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header with sticky positioning */}
      <div className="top-0 z-10  border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              Companies
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {companies.length} companies
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="flex-shrink-0 px-3 py-2 text-sm"
          >
            <PlusIcon className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className=" xs:inline">Create</span>
          </Button>
        </div>
      </div>

      {/* Main content with mobile-optimized padding */}
      <div className="px-3 py-4 sm:px-6">
        {companies.length > 0 ? (
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                  company.isDefault
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50"
                    : "border-gray-200"
                }`}
              >
                {/* Default badge for mobile - positioned at top */}
                {company.isDefault && (
                  <div className="px-4 pt-3 pb-1">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Default Company
                    </div>
                  </div>
                )}

                <div className={`p-4 ${company.isDefault ? "pt-2" : ""}`}>
                  {/* Company header with logo and basic info */}
                  <div className="flex items-start space-x-3 mb-3">
                    {/* Company logo or placeholder */}
                    <div className="flex-shrink-0">
                      {company.logo ? (
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div
                          className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center border ${
                            company.isDefault
                              ? "bg-blue-100 border-blue-200"
                              : "bg-gray-100 border-gray-200"
                          }`}
                        >
                          <BuildingOfficeIcon
                            className={`h-6 w-6 ${
                              company.isDefault
                                ? "text-blue-600"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                      )}
                    </div>

                    {/* Company name and location */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-lg sm:text-xl font-bold leading-tight mb-1 ${
                          company.isDefault ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {company.name}
                      </h3>
                      {company.city && (
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPinIcon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {company.city.name}, {company.city.state}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company description - mobile optimized */}
                  {company.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  {/* Company details in mobile-friendly grid */}
                  <div className="space-y-2 mb-4">
                    {company.website && (
                      <div className="flex items-center">
                        <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium truncate"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    {company.industry && (
                      <div className="flex items-center">
                        <div className="h-4 w-4 mr-2 flex-shrink-0">
                          <div className="h-2 w-2 bg-gray-400 rounded-full mt-1 ml-1"></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {company.industry}
                        </span>
                      </div>
                    )}

                    {company.size && (
                      <div className="flex items-center">
                        <div className="h-4 w-4 mr-2 flex-shrink-0">
                          <div className="h-2 w-2 bg-gray-400 rounded-full mt-1 ml-1"></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {company.size} employees
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons - mobile optimized */}
                  <div className="flex flex-col space-y-2 sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2">
                    {!company.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetAsDefault(company.id)}
                        className="w-full sm:w-auto text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400 bg-white hover:bg-blue-50"
                      >
                        <StarIcon className="h-4 w-4 mr-1.5" />
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(company)}
                      className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-1.5" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={BuildingOfficeIcon}
              title="No companies yet"
              description="Create your first company profile to start posting job ads."
              actionText="Create Your First Company"
              onAction={() => setShowForm(true)}
            />
          </div>
        )}
      </div>

      {/* Company Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormClose}
        title={editingCompany ? "Edit Company" : "Create New Company"}
        maxWidth="2xl"
      >
        <CompanyForm
          company={editingCompany}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default CompanyProfile;
