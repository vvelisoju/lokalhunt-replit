import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EmployerTable from '../../components/branch-admin/EmployerTable';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import CreateEmployerModal from '../../components/modals/CreateEmployerModal';
import { 
  getEmployers, 
  approveEmployer, 
  rejectEmployer, 
  blockEmployer, 
  unblockEmployer,
  deleteEmployer
} from '../../services/branch-admin/employers';

const Employers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'BLOCKED', label: 'Blocked' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' }
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination(prev => ({ ...prev, page }));
    loadEmployers();
  }, [searchParams]);

  const loadEmployers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await getEmployers(params);
      
      if (response.success) {
        setEmployers(response.data.employers || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          pages: response.data.pages || 0
        }));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to load employers');
      console.error('Load employers error:', error);
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

  const handleApprove = async (employerId) => {
    try {
      const response = await approveEmployer(employerId);
      if (response.success) {
        toast.success('Employer approved successfully');
        loadEmployers();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to approve employer');
    }
  };

  const handleReject = async (employerId, notes) => {
    try {
      const response = await rejectEmployer(employerId, notes);
      if (response.success) {
        toast.success('Employer rejected successfully');
        loadEmployers();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to reject employer');
    }
  };

  const handleBlock = async (employerId, notes) => {
    try {
      const response = await blockEmployer(employerId, notes);
      if (response.success) {
        toast.success('Employer blocked successfully');
        loadEmployers();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to block employer');
    }
  };

  const handleUnblock = async (employerId) => {
    try {
      const response = await unblockEmployer(employerId);
      if (response.success) {
        toast.success('Employer unblocked successfully');
        loadEmployers();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to unblock employer');
    }
  };

  const handleView = (employerId) => {
    navigate(`/branch-admin/employers/${employerId}`);
  };

  const handleCreateSuccess = (employerId) => {
    // Refresh the employers list
    loadEmployers();
    // If employerId is provided, navigate to details, otherwise stay on list
    if (employerId) {
      navigate(`/branch-admin/employers/${employerId}`);
    }
    // If no employerId, just show success and stay on employers list
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Management</h1>
          <p className="text-gray-600 mt-1">
            Review and manage employer registrations
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Employer
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <FormInput
              placeholder="Search employers..."
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
            value={filters.sortBy}
            onChange={(value) => updateFilters({ sortBy: value })}
            options={sortOptions}
          />
          
          <Select
            value={filters.sortOrder}
            onChange={(value) => updateFilters({ sortOrder: value })}
            options={sortOrderOptions}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            {pagination.total} employers found
          </p>
          
          {Object.values(filters).some(value => value && value !== 'createdAt' && value !== 'desc') && (
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

      {/* Employers Table */}
      <EmployerTable
        employers={employers}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onBlock={handleBlock}
        onUnblock={handleUnblock}
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

      {/* Create Employer Modal */}
      <CreateEmployerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default Employers;