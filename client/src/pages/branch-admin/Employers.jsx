import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import EmployerTable from '../../components/branch-admin/EmployerTable';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import CreateEmployerModal from '../../components/modals/CreateEmployerModal';
import { useRole } from '../../context/RoleContext';
import { 
  getEmployers, 
  approveEmployer, 
  rejectEmployer,
  deleteEmployer,
  getSubscriptionPlans
} from '../../services/branch-admin/employers';

const Employers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleContext = useRole();
  const { viewAsAdmin, setTargetEmployerContext } = roleContext || {};
  
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [summary, setSummary] = useState({
    totalEmployers: 0,
    activeSubscriptions: 0,
    noSubscription: 0,
    totalActiveJobs: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Simplified filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    planId: searchParams.get('planId') || '',
    subscriptionStatus: searchParams.get('subscriptionStatus') || ''
  });

  // Dynamic plan options based on loaded subscription plans
  const planOptions = [
    { value: '', label: 'All Plans' },
    ...subscriptionPlans.map(plan => ({ value: plan.id, label: plan.name }))
  ];

  // Subscription status filter options
  const subscriptionStatusOptions = [
    { value: '', label: 'All Subscription Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'EXPIRED', label: 'Expired' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'PAST_DUE', label: 'Past Due' },
    { value: 'NO_SUBSCRIPTION', label: 'No Subscription' }
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    const urlFilters = {
      search: searchParams.get('search') || '',
      planId: searchParams.get('planId') || '',
      subscriptionStatus: searchParams.get('subscriptionStatus') || ''
    };
    
    setFilters(urlFilters);
    setPagination(prev => ({ ...prev, page }));
    loadEmployers();
    loadSubscriptionPlans();
  }, [searchParams]);

  const loadSubscriptionPlans = async () => {
    try {
      const response = await getSubscriptionPlans();
      if (response.success) {
        setSubscriptionPlans(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load subscription plans:', error);
    }
  };

  const loadEmployers = async () => {
    setLoading(true);
    try {
      const currentPage = parseInt(searchParams.get('page')) || 1;
      const currentFilters = {
        search: searchParams.get('search') || '',
        planId: searchParams.get('planId') || '',
        subscriptionStatus: searchParams.get('subscriptionStatus') || ''
      };
      
      const params = {
        page: currentPage,
        limit: pagination.limit,
        ...currentFilters
      };

      const response = await getEmployers(params);
      
      if (response.success) {
        const data = response.data.data || response.data;
        setEmployers(data.employers || []);
        setSummary(data.summary || {
          totalEmployers: 0,
          activeSubscriptions: 0,
          noSubscription: 0,
          totalActiveJobs: 0
        });
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.totalCount || 0,
          pages: data.pagination?.totalPages || 0
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

  

  const handleView = (employerId) => {
    // Find the employer data to set context
    const employer = employers.find(emp => emp.id === employerId);
    
    if (employer && setTargetEmployerContext && viewAsAdmin) {
      // Set the target employer context for sidebar navigation
      setTargetEmployerContext(employer);
      
      // Use viewAsAdmin to set the context and navigate
      viewAsAdmin(employer);
    }
    
    // Navigate to the employer dashboard using standard employer components
    navigate(`/branch-admin/employers/${employerId}/dashboard`);
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
      planId: '',
      subscriptionStatus: ''
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
            Manage employers and their subscriptions in your branch
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

      

      {/* Simplified Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <FormInput
              placeholder="Search by name, email, company..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          <Select
            value={filters.planId || ''}
            onChange={(value) => updateFilters({ planId: value })}
            options={planOptions}
            placeholder="Filter by Plan"
          />

          <Select
            value={filters.subscriptionStatus || ''}
            onChange={(value) => updateFilters({ subscriptionStatus: value })}
            options={subscriptionStatusOptions}
            placeholder="Subscription Status"
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            {pagination.total} employers found in your branch
          </p>
          
          {Object.values(filters).some(value => value) && (
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