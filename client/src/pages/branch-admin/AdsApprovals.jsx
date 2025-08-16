import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AdApprovalTable from '../../components/branch-admin/AdApprovalTable';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { 
  getAds, 
  approveAd, 
  rejectAd, 
  bulkApproveAds, 
  bulkRejectAds 
} from '../../services/branch-admin/ads';

const AdsApprovals = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'PENDING_APPROVAL',
    categoryName: searchParams.get('categoryName') || '',
    employerId: searchParams.get('employerId') || '',
    mouStatus: searchParams.get('mouStatus') || '',
    sortBy: searchParams.get('sortBy') || 'updatedAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Education', label: 'Education' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Customer Service', label: 'Customer Service' },
    { value: 'Operations', label: 'Operations' }
  ];

  const mouStatusOptions = [
    { value: '', label: 'All MOU Status' },
    { value: 'active', label: 'Active MOU' },
    { value: 'inactive', label: 'No Active MOU' }
  ];

  const sortOptions = [
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'title', label: 'Job Title' },
    { value: 'company', label: 'Company' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' }
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination(prev => ({ ...prev, page }));
    loadAds();
  }, [searchParams]);

  const loadAds = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await getAds(params);
      
      if (response.success) {
        setAds(response.data.ads || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          pages: response.data.pages || 0
        }));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to load ads');
      console.error('Load ads error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    params.set('page', '1'); // Reset to first page when filtering

    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleApprove = async (adId) => {
    try {
      const response = await approveAd(adId);
      if (response.success) {
        toast.success('Ad approved successfully');
        loadAds();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to approve ad');
    }
  };

  const handleReject = async (adId, notes) => {
    try {
      const response = await rejectAd(adId, notes);
      if (response.success) {
        toast.success('Ad rejected successfully');
        loadAds();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to reject ad');
    }
  };

  const handleBulkApprove = async (adIds) => {
    try {
      const response = await bulkApproveAds(adIds);
      if (response.success) {
        toast.success(`${adIds.length} ads approved successfully`);
        loadAds();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to bulk approve ads');
    }
  };

  const handleBulkReject = async (adIds, notes) => {
    try {
      const response = await bulkRejectAds(adIds, notes);
      if (response.success) {
        toast.success(`${adIds.length} ads rejected successfully`);
        loadAds();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to bulk reject ads');
    }
  };

  const handleView = (adId) => {
    navigate(`/branch-admin/ads/${adId}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'PENDING_APPROVAL',
      categoryName: '',
      employerId: '',
      mouStatus: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    });
    setSearchParams({ status: 'PENDING_APPROVAL' });
  };

  // Count ads without active MOU
  const adsWithoutMou = ads.filter(ad => !ad.employer?.activeMou).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ad Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and approve job advertisement submissions
        </p>
      </div>

      {/* MOU Warning */}
      {adsWithoutMou > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                MOU Required for Approval
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {adsWithoutMou} ads cannot be approved because their employers don't have active MOUs.
                <span className="ml-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
                    onClick={() => updateFilters({ mouStatus: 'inactive' })}
                  >
                    View These Ads
                  </Button>
                </span>
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <FormInput
              placeholder="Search ads by title, company..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>
          
          <Select
            value={filters.status}
            onChange={(value) => updateFilters({ status: value })}
            options={statusOptions}
            placeholder="Filter by status"
          />
          
          <Select
            value={filters.categoryName}
            onChange={(value) => updateFilters({ categoryName: value })}
            options={categoryOptions}
            placeholder="Filter by category"
          />
          
          <Select
            value={filters.mouStatus}
            onChange={(value) => updateFilters({ mouStatus: value })}
            options={mouStatusOptions}
            placeholder="Filter by MOU"
          />
          
          <Select
            value={filters.sortBy}
            onChange={(value) => updateFilters({ sortBy: value })}
            options={sortOptions}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              {pagination.total} ads found
            </p>
            
            {filters.status === 'PENDING_APPROVAL' && (
              <div className="flex items-center space-x-2">
                <Badge color="green" text={`${ads.filter(ad => ad.employer?.activeMou).length} ready for approval`} />
                <Badge color="red" text={`${adsWithoutMou} need MOU`} />
              </div>
            )}
          </div>
          
          {Object.values(filters).some(value => value && value !== 'PENDING_APPROVAL' && value !== 'updatedAt' && value !== 'desc') && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Ads Table */}
      <AdApprovalTable
        ads={ads}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onView={handleView}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdsApprovals;