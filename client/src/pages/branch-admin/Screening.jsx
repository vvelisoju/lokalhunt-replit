import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // This import will be removed and replaced by the custom toast hook usage
import CandidateScreeningTable from '../../components/branch-admin/CandidateScreeningTable';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { 
  getCandidatesToScreen, 
  updateScreeningStatus, 
  rateCandidate 
} from '../../services/branch-admin/screening';
import { useToast } from '../../components/ui/Toast'; // Import the custom toast hook

const Screening = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast(); // Use the custom toast hook

  const [candidates, setCandidates] = useState([]);
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
    screeningStatus: searchParams.get('screeningStatus') || '',
    allocationStatus: searchParams.get('allocationStatus') || '',
    categoryName: searchParams.get('categoryName') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const screeningStatusOptions = [
    { value: '', label: 'All Screening Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'SCREENED', label: 'Screened' },
    { value: 'RATED', label: 'Rated' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const allocationStatusOptions = [
    { value: '', label: 'All Application Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'SHORTLISTED', label: 'Shortlisted' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled' },
    { value: 'HIRED', label: 'Hired' },
    { value: 'REJECTED', label: 'Rejected' }
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

  const sortOptions = [
    { value: 'createdAt', label: 'Application Date' },
    { value: 'name', label: 'Candidate Name' },
    { value: 'screeningStatus', label: 'Screening Status' },
    { value: 'overallRating', label: 'Rating' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' }
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination(prev => ({ ...prev, page }));
    loadCandidates();
  }, [searchParams]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await getCandidatesToScreen(params);

      if (response.success) {
        setCandidates(response.data.candidates || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          pages: response.data.pages || 0
        }));
      } else {
        toast.error(response.error); // Use custom toast
      }
    } catch (error) {
      toast.error('Failed to load candidates'); // Use custom toast
      console.error('Load candidates error:', error);
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

  const handleUpdateStatus = async (allocationId, status, notes = '') => {
    try {
      const response = await updateScreeningStatus(allocationId, status, notes);
      if (response.success) {
        toast.success('Screening status updated successfully'); // Use custom toast
        loadCandidates();
      } else {
        toast.error(response.error); // Use custom toast
      }
    } catch (error) {
      toast.error('Failed to update screening status'); // Use custom toast
    }
  };

  const handleRateCandidate = async (candidateId, rating, notes) => {
    try {
      const response = await rateCandidate(candidateId, rating, notes);
      if (response.success) {
        toast.success('Candidate rated successfully'); // Use custom toast
        loadCandidates();
      } else {
        toast.error(response.error); // Use custom toast
      }
    } catch (error) {
      toast.error('Failed to rate candidate'); // Use custom toast
    }
  };

  const handleViewProfile = (candidateId) => {
    navigate(`/branch-admin/screening/${candidateId}`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      screeningStatus: '',
      allocationStatus: '',
      categoryName: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Screening</h1>
        <p className="text-gray-600 mt-1">
          Screen and rate candidates allocated for job positions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <FormInput
              placeholder="Search candidates by name, email..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          <Select
            value={filters.screeningStatus}
            onChange={(value) => updateFilters({ screeningStatus: value })}
            options={screeningStatusOptions}
            placeholder="Screening status"
          />

          <Select
            value={filters.allocationStatus}
            onChange={(value) => updateFilters({ allocationStatus: value })}
            options={allocationStatusOptions}
            placeholder="Application status"
          />

          <Select
            value={filters.categoryName}
            onChange={(value) => updateFilters({ categoryName: value })}
            options={categoryOptions}
            placeholder="Job category"
          />

          <Select
            value={filters.sortBy}
            onChange={(value) => updateFilters({ sortBy: value })}
            options={sortOptions}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            {pagination.total} candidates found
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

      {/* Screening Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-600">
              {candidates.filter(c => c.allocation?.screeningStatus === 'PENDING').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Pending Screening</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-2xl font-semibold text-yellow-600">
              {candidates.filter(c => c.allocation?.screeningStatus === 'IN_PROGRESS').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">
              {candidates.filter(c => c.allocation?.screeningStatus === 'SCREENED').length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Screened</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-center">
            <p className="text-2xl font-semibold text-purple-600">
              {candidates.filter(c => c.overallRating && c.overallRating > 0).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Rated</p>
          </div>
        </div>
      </div>

      {/* Candidates Table */}
      <CandidateScreeningTable
        candidates={candidates}
        loading={loading}
        onUpdateStatus={handleUpdateStatus}
        onRateCandidate={handleRateCandidate}
        onViewProfile={handleViewProfile}
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

export default Screening;