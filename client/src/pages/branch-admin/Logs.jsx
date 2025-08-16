import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';
import ActivityLogTable from '../../components/branch-admin/ActivityLogTable';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Card from '../../components/ui/Card';
import { getActivityLog, exportActivityLog } from '../../services/branch-admin/activityLog';

const Logs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    actionType: searchParams.get('actionType') || '',
    entityType: searchParams.get('entityType') || '',
    performedBy: searchParams.get('performedBy') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const actionTypeOptions = [
    { value: '', label: 'All Actions' },
    { value: 'EMPLOYER_APPROVED', label: 'Employer Approved' },
    { value: 'EMPLOYER_REJECTED', label: 'Employer Rejected' },
    { value: 'EMPLOYER_BLOCKED', label: 'Employer Blocked' },
    { value: 'AD_APPROVED', label: 'Ad Approved' },
    { value: 'AD_REJECTED', label: 'Ad Rejected' },
    { value: 'COMPANY_CREATED', label: 'Company Created' },
    { value: 'COMPANY_UPDATED', label: 'Company Updated' },
    { value: 'MOU_CREATED', label: 'MOU Created' },
    { value: 'MOU_UPDATED', label: 'MOU Updated' },
    { value: 'MOU_ACTIVATED', label: 'MOU Activated' },
    { value: 'MOU_DEACTIVATED', label: 'MOU Deactivated' },
    { value: 'CANDIDATE_SCREENED', label: 'Candidate Screened' },
    { value: 'CANDIDATE_RATED', label: 'Candidate Rated' }
  ];

  const entityTypeOptions = [
    { value: '', label: 'All Entities' },
    { value: 'EMPLOYER', label: 'Employer' },
    { value: 'AD', label: 'Job Ad' },
    { value: 'COMPANY', label: 'Company' },
    { value: 'MOU', label: 'MOU' },
    { value: 'CANDIDATE', label: 'Candidate' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date & Time' },
    { value: 'actionType', label: 'Action Type' },
    { value: 'entityType', label: 'Entity Type' },
    { value: 'performedBy', label: 'Performed By' }
  ];

  const sortOrderOptions = [
    { value: 'desc', label: 'Newest First' },
    { value: 'asc', label: 'Oldest First' }
  ];

  useEffect(() => {
    const page = parseInt(searchParams.get('page')) || 1;
    setPagination(prev => ({ ...prev, page }));
    loadLogs();
  }, [searchParams]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await getActivityLog(params);
      
      if (response.success) {
        setLogs(response.data.logs || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          pages: response.data.pages || 0
        }));
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to load activity logs');
      console.error('Load logs error:', error);
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportActivityLog(filters);
      
      if (response.success) {
        // Create download link for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Activity logs exported successfully');
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to export activity logs');
      console.error('Export logs error:', error);
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      actionType: '',
      entityType: '',
      performedBy: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchParams({});
  };

  const setQuickDateFilter = (days) => {
    const dateTo = new Date().toISOString().split('T')[0];
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    updateFilters({ dateFrom, dateTo });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-600 mt-1">
            Track all administrative actions and system events
          </p>
        </div>
        
        <Button
          variant="outline"
          icon={ArrowDownTrayIcon}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Quick Date Filters */}
      <Card>
        <div className="flex items-center space-x-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateFilter(1)}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateFilter(7)}
            >
              Last 7 days
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateFilter(30)}
            >
              Last 30 days
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateFilter(90)}
            >
              Last 90 days
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <FormInput
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>
          
          <Select
            value={filters.actionType}
            onChange={(value) => updateFilters({ actionType: value })}
            options={actionTypeOptions}
            placeholder="Filter by action"
          />
          
          <Select
            value={filters.entityType}
            onChange={(value) => updateFilters({ entityType: value })}
            options={entityTypeOptions}
            placeholder="Filter by entity"
          />
          
          <Select
            value={filters.sortBy}
            onChange={(value) => updateFilters({ sortBy: value })}
            options={sortOptions}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <FormInput
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
            />
          </div>
          
          <div>
            <FormInput
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => updateFilters({ dateTo: e.target.value })}
            />
          </div>
          
          <div>
            <FormInput
              placeholder="Performed by user..."
              value={filters.performedBy}
              onChange={(e) => updateFilters({ performedBy: e.target.value })}
            />
          </div>
          
          <Select
            value={filters.sortOrder}
            onChange={(value) => updateFilters({ sortOrder: value })}
            options={sortOrderOptions}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            {pagination.total} logs found
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

      {/* Activity Summary */}
      {!loading && logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600">
                {logs.filter(log => log.actionType.includes('APPROVED')).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Approvals</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <p className="text-2xl font-semibold text-red-600">
                {logs.filter(log => log.actionType.includes('REJECTED') || log.actionType.includes('BLOCKED')).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Rejections/Blocks</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">
                {logs.filter(log => log.actionType.includes('CREATED') || log.actionType.includes('UPDATED')).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Modifications</p>
            </div>
          </Card>
          
          <Card>
            <div className="text-center">
              <p className="text-2xl font-semibold text-purple-600">
                {logs.filter(log => log.actionType.includes('SCREENED') || log.actionType.includes('RATED')).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Screening Actions</p>
            </div>
          </Card>
        </div>
      )}

      {/* Activity Logs Table */}
      <ActivityLogTable logs={logs} loading={loading} />

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

export default Logs;