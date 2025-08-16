import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import MouForm from '../../components/branch-admin/MouForm';
import { 
  getMous, 
  createMou, 
  updateMou, 
  activateMou, 
  deactivateMou 
} from '../../services/branch-admin/mou';
import { getEmployers } from '../../services/branch-admin/employers';

const Mou = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [mous, setMous] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState({ isOpen: false, employer: null, mou: null });
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', mou: null });
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    employerId: searchParams.get('employerId') || '',
    status: searchParams.get('status') || '',
    feeType: searchParams.get('feeType') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'EXPIRED', label: 'Expired' }
  ];

  const feeTypeOptions = [
    { value: '', label: 'All Fee Types' },
    { value: 'PERCENTAGE', label: 'Percentage' },
    { value: 'FIXED', label: 'Fixed Amount' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'validUntil', label: 'Expiry Date' },
    { value: 'feeValue', label: 'Fee Value' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' }
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination(prev => ({ ...prev, page }));
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const [mousResponse, employersResponse] = await Promise.all([
        getMous(),
        getEmployers({ status: 'ACTIVE', limit: 100 })
      ]);
      
      if (mousResponse.success) {
        setMous(mousResponse.data.mous || []);
        setPagination(prev => ({
          ...prev,
          total: mousResponse.data.total || 0,
          pages: mousResponse.data.pages || 0
        }));
      } else {
        toast.error(mousResponse.error);
      }

      if (employersResponse.success) {
        setEmployers(employersResponse.data.employers || []);
      }
    } catch (error) {
      toast.error('Failed to load MOU data');
      console.error('Load MOU data error:', error);
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

  const handleCreateMou = (employer) => {
    setFormModal({ isOpen: true, employer, mou: null });
  };

  const handleEditMou = (mou) => {
    setFormModal({ isOpen: true, employer: mou.employer, mou });
  };

  const handleSubmitMou = async (formData) => {
    try {
      let response;
      
      if (formModal.mou) {
        response = await updateMou(formModal.mou.id, formData);
      } else {
        response = await createMou(formModal.employer.id, formData);
      }

      if (response.success) {
        toast.success(`MOU ${formModal.mou ? 'updated' : 'created'} successfully`);
        setFormModal({ isOpen: false, employer: null, mou: null });
        loadData();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(`Failed to ${formModal.mou ? 'update' : 'create'} MOU`);
    }
  };

  const handleAction = (type, mou) => {
    setActionModal({ isOpen: true, type, mou });
    setNotes('');
  };

  const confirmAction = async () => {
    if (!actionModal.mou) return;

    setProcessing(true);
    try {
      let response;
      
      switch (actionModal.type) {
        case 'activate':
          response = await activateMou(actionModal.mou.id);
          break;
        case 'deactivate':
          response = await deactivateMou(actionModal.mou.id, notes);
          break;
        default:
          return;
      }

      if (response.success) {
        toast.success(`MOU ${actionModal.type}d successfully`);
        setActionModal({ isOpen: false, type: '', mou: null });
        loadData();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(`Failed to ${actionModal.type} MOU`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (mou) => {
    const today = new Date();
    const validUntil = new Date(mou.validUntil);
    
    if (mou.status === 'ACTIVE' && validUntil > today) {
      return <Badge color="green" text="Active" />;
    } else if (mou.status === 'ACTIVE' && validUntil <= today) {
      return <Badge color="red" text="Expired" />;
    } else {
      return <Badge color="gray" text="Inactive" />;
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      employerId: '',
      status: '',
      feeType: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  const employerOptions = [
    { value: '', label: 'All Employers' },
    ...employers.map(emp => ({
      value: emp.id,
      label: emp.user?.name || 'N/A'
    }))
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="h-20 bg-white rounded-lg border animate-pulse"></div>
        <div className="h-96 bg-white rounded-lg border animate-pulse"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MOU Management</h1>
            <p className="text-gray-600 mt-1">
              Manage Memorandums of Understanding with employers
            </p>
          </div>
          
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => {
              // If there's a specific employer in URL, open form for them
              const employerId = searchParams.get('employerId');
              if (employerId) {
                const employer = employers.find(e => e.id === employerId);
                if (employer) {
                  handleCreateMou(employer);
                  return;
                }
              }
              
              // Otherwise, navigate to employer selection
              navigate('/branch-admin/employers?forMou=true');
            }}
          >
            Create MOU
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <FormInput
                placeholder="Search MOUs..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
            
            <Select
              value={filters.employerId}
              onChange={(value) => updateFilters({ employerId: value })}
              options={employerOptions}
              placeholder="Filter by employer"
            />
            
            <Select
              value={filters.status}
              onChange={(value) => updateFilters({ status: value })}
              options={statusOptions}
              placeholder="Filter by status"
            />
            
            <Select
              value={filters.feeType}
              onChange={(value) => updateFilters({ feeType: value })}
              options={feeTypeOptions}
              placeholder="Filter by fee type"
            />
            
            <Select
              value={filters.sortBy}
              onChange={(value) => updateFilters({ sortBy: value })}
              options={sortOptions}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              {pagination.total} MOUs found
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

        {/* MOUs Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">MOUs</h3>
          </div>

          {mous.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-500">No MOUs found</p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => navigate('/branch-admin/employers')}
              >
                Create First MOU
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Structure
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mous.map((mou) => (
                    <tr key={mou.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {mou.employer?.user?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {mou.employer?.user?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {mou.feeType === 'PERCENTAGE' 
                            ? `${mou.feeValue}%` 
                            : `₹${mou.feeValue.toLocaleString()}`
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          {mou.feeType === 'PERCENTAGE' ? 'of salary' : 'fixed amount'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(mou.validFrom).toLocaleDateString()} - {new Date(mou.validUntil).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.ceil((new Date(mou.validUntil) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(mou)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            icon={EyeIcon}
                            onClick={() => navigate(`/branch-admin/mou/${mou.id}`)}
                          >
                            View
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            icon={PencilIcon}
                            onClick={() => handleEditMou(mou)}
                          >
                            Edit
                          </Button>
                          
                          {mou.status === 'ACTIVE' ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleAction('deactivate', mou)}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleAction('activate', mou)}
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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

      {/* MOU Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, employer: null, mou: null })}
        title={formModal.mou ? 'Edit MOU' : 'Create MOU'}
        size="lg"
      >
        <MouForm
          employer={formModal.employer}
          initialData={formModal.mou}
          onSubmit={handleSubmitMou}
          onCancel={() => setFormModal({ isOpen: false, employer: null, mou: null })}
          loading={processing}
        />
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', mou: null })}
        title={`${actionModal.type === 'activate' ? 'Activate' : 'Deactivate'} MOU`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {actionModal.type} the MOU for "{actionModal.mou?.employer?.user?.name}"?
          </p>
          
          {actionModal.type === 'deactivate' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deactivation Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Reason for deactivating this MOU..."
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setActionModal({ isOpen: false, type: '', mou: null })}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={actionModal.type === 'activate' ? 'success' : 'danger'}
              onClick={confirmAction}
              disabled={processing || (actionModal.type === 'deactivate' && !notes.trim())}
            >
              {processing ? 'Processing...' : `${actionModal.type === 'activate' ? 'Activate' : 'Deactivate'} MOU`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Mou;