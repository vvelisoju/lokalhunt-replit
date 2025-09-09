import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import JobCard from "../../components/ui/JobCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { getPendingAds } from "../../services/branch-admin/ads";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

const AdsApprovals = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "PENDING_APPROVAL",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Placeholder for pagination state, as it was present in the modified snippet but not in the original.
  // Assuming these are intended to be managed if pagination is implemented elsewhere.
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAds, setTotalAds] = useState(0);

  useEffect(() => {
    loadAds();
  }, [filters]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const response = await getPendingAds(filters);

      if (response.success) {
        console.log("API Response:", response.data); // Debug log
        console.log("First ad sample:", response.data.ads?.[0]); // Debug log
        setAds(response.data.ads || []);
        setTotalPages(
          response.data.pagination?.totalPages ||
            response.data.pagination?.pages ||
            1,
        );
        setCurrentPage(
          response.data.pagination?.currentPage ||
            response.data.pagination?.page ||
            1,
        );
        setTotalAds(response.data.pagination?.total || 0);
      } else {
        toast.error(response.error || "Failed to load ads");
        setAds([]);
      }
    } catch (error) {
      console.error("Error loading ads:", error);
      toast.error("Failed to load ads");
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAds();
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
    }));
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status,
    }));
  };

  const transformAdToJobCard = (ad) => {
    return {
      id: ad.id,
      title: ad.title || "No Title",
      description: ad.description,
      company: ad.company || { name: ad.companyName },
      companyName: ad.company?.name || ad.companyName || "Unknown Company",
      location: ad.location || ad.locationName || "Location not specified",
      jobType: ad.jobType || ad.employmentType || "Full Time",
      salary: ad.salary || ad.salaryRange,
      skills: ad.skills || [],
      status: ad.status,
      postedAt: ad.createdAt,
      createdAt: ad.createdAt,
      candidatesCount: ad.applicationCount || 0,
      applicationCount: ad.applicationCount || 0,
      employerId: ad.employerId || ad.employer?.id,
      gender: ad.gender,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="w-full">
            <h1 className="text-3xl font-bold text-gray-900 break-words">
              Ad Approvals
            </h1>
            <p className="text-gray-600 mt-1">
              Review and approve job advertisement submissions
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search ads by title, company..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="PENDING_APPROVAL">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="">All Statuses</option>
                </select>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Ads List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="flex space-x-4 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                    <div className="w-20 h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ads.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No ads found
              </h3>
              <p className="text-gray-500">
                {filters.status === "PENDING_APPROVAL"
                  ? "No ads are currently pending approval."
                  : "Try adjusting your search criteria or filters."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => {
              const jobData = transformAdToJobCard(ad);

              return (
                <JobCard
                  key={ad.id}
                  job={jobData}
                  variant="employer"
                  applicationStatus={ad.status}
                  userRole="BRANCH_ADMIN"
                  onRefresh={loadAds} // Use loadAds for immediate refresh
                  loading={{}}
                  className="hover:shadow-lg transition-shadow"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsApprovals;
