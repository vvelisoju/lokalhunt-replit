import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  BriefcaseIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { publicApi } from "../services/publicApi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Loader from "../components/ui/Loader";

const Companies = () => {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(12);

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    industry: "",
    size: "",
    location: "",
  });

  const [industries, setIndustries] = useState([]);
  const [locations, setLocations] = useState([]);

  const companySizes = [
    { value: "STARTUP", label: "1-10 employees" },
    { value: "SMALL", label: "11-50 employees" },
    { value: "MEDIUM", label: "51-200 employees" },
    { value: "LARGE", label: "201-1000 employees" },
    { value: "ENTERPRISE", label: "1000+ employees" },
  ];

  // Load initial data
  useEffect(() => {
    loadCompanies();
    loadFilterData();
  }, []);

  // Reload companies when filters change
  useEffect(() => {
    loadCompanies();
  }, [filters, currentPage]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: companiesPerPage,
        search: filters.search,
        industry: filters.industry,
        size: filters.size,
        location: filters.location,
      };

      // Remove empty parameters
      Object.keys(params).forEach((key) => {
        if (!params[key] || params[key] === "") {
          delete params[key];
        }
      });

      const response = await publicApi.getCompanies(params);
      setCompanies(response.data?.companies || []);
      setTotalCompanies(response.data?.total || 0);
    } catch (error) {
      console.error("Error loading companies:", error);
      setCompanies([]);
      setTotalCompanies(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFilterData = async () => {
    try {
      const [citiesRes] = await Promise.all([
        publicApi.getCities().catch(() => ({ data: [] })),
      ]);

      setLocations(citiesRes.data || []);

      // Mock industries for now
      setIndustries([
        "Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Marketing",
        "Manufacturing",
        "Retail",
        "Consulting",
      ]);
    } catch (error) {
      console.error("Error loading filter data:", error);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      industry: "",
      size: "",
      location: "",
    });
    setCurrentPage(1);
  };

  const getCompanyLogo = (company) => {
    if (company.logo) return company.logo;
    // Generate a simple letter-based logo
    const firstLetter = company.name.charAt(0).toUpperCase();
    return (
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
        {firstLetter}
      </div>
    );
  };

  const getSizeLabel = (size) => {
    const sizeObj = companySizes.find((s) => s.value === size);
    return sizeObj ? sizeObj.label : size;
  };

  const totalPages = Math.ceil(totalCompanies / companiesPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Find Companies
              </h1>
              <p className="mt-1 text-gray-600">
                Discover opportunities that match your career goals
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {totalCompanies} companies found
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Search Filter
                </h2>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Clear All
                </button>
              </div>

              {/* Company Name Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              {/* Industry Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={filters.industry}
                  onChange={(e) =>
                    handleFilterChange("industry", e.target.value)
                  }
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white"
                >
                  <option value="">All Industries</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Size Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={filters.size}
                  onChange={(e) => handleFilterChange("size", e.target.value)}
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white"
                >
                  <option value="">Any Size</option>
                  {companySizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}, {location.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-medium text-gray-900">
                  Total companies found:{" "}
                  <span className="text-primary-600 font-semibold">
                    {totalCompanies}
                  </span>
                </h2>
              </div>
            </div>

            {/* Companies Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader />
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No companies found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria or filters.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-200 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          {typeof getCompanyLogo(company) === "string" ? (
                            <img
                              src={getCompanyLogo(company)}
                              alt={company.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {company.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 cursor-pointer line-clamp-1">
                                {company.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-1">
                                {company.industry}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {company.city
                                  ? `${company.city.name}, ${company.city.state}`
                                  : "Multiple locations"}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>{getSizeLabel(company.size)}</span>
                            </div>
                            <div className="flex items-center">
                              <BriefcaseIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span>
                                {company.openJobs || 0} open positions
                              </span>
                            </div>
                          </div>

                          {company.description && (
                            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                              {company.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Link
                          to={`/jobs?search=${encodeURIComponent(company.name)}`}
                          className="bg-primary-50 text-primary-700 text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors whitespace-nowrap"
                        >
                          View Jobs
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-8 space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  const page =
                    currentPage <= 3 ? index + 1 : currentPage - 2 + index;
                  if (page > totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-primary-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Companies;
