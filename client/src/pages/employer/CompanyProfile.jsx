import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  BuildingOfficeIcon,
  PencilIcon,
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
    <div>
      <div className="py-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600 mt-1 text-xs">
              Manage your company information
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Companies List */}
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
                  company.isDefault
                    ? "ring-2 ring-blue-500 border-blue-200"
                    : ""
                }`}
              >
                <div className="p-6">
                  {/* Default Badge */}
                  {company.isDefault && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Default Company
                      </span>
                    </div>
                  )}

                  {/* Company Logo */}
                  <div className="flex items-center mb-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          company.isDefault ? "bg-blue-100" : "bg-gray-200"
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
                    <div className="ml-3 flex-1">
                      <h3
                        className={`text-lg font-semibold line-clamp-1 ${
                          company.isDefault ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {company.city
                          ? `${company.city.name}, ${company.city.state}`
                          : "No location"}
                      </p>
                    </div>
                  </div>

                  {/* Company Description */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {company.description}
                  </p>

                  {/* Company Details */}
                  <div className="space-y-2 mb-4">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(company)}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BuildingOfficeIcon}
            title="No companies yet"
            description="Create your first company profile to start posting job ads."
            actionText="Create Your First Company"
            onAction={() => setShowForm(true)}
          />
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
