import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ArrowDownTrayIcon, 
  ChartBarIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import FormInput from '../../components/ui/FormInput';
import Select from '../../components/ui/Select';
import { 
  getReports, 
  getBranchStatistics, 
  exportReportCSV, 
  exportReportPDF 
} from '../../services/branch-admin/reports';

const Reports = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState({});
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    {
      id: 'employers',
      title: 'Employer Report',
      description: 'Detailed report of all employers and their status',
      icon: UsersIcon,
      color: 'blue'
    },
    {
      id: 'companies',
      title: 'Company Report',
      description: 'Report of all registered companies',
      icon: BuildingOfficeIcon,
      color: 'green'
    },
    {
      id: 'ads',
      title: 'Job Ads Report',
      description: 'Comprehensive report of job advertisements',
      icon: DocumentTextIcon,
      color: 'purple'
    },
    {
      id: 'candidates',
      title: 'Candidates Report',
      description: 'Report of candidate screening and ratings',
      icon: UsersIcon,
      color: 'orange'
    },
    {
      id: 'mous',
      title: 'MOU Report',
      description: 'Report of all MOUs and fee structures',
      icon: DocumentChartBarIcon,
      color: 'indigo'
    },
    {
      id: 'activity',
      title: 'Activity Report',
      description: 'Detailed activity and audit trail report',
      icon: ChartBarIcon,
      color: 'red'
    }
  ];

  const quickDateRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'This Year', days: 365 }
  ];

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await getBranchStatistics(dateRange);
      
      if (response.success) {
        setStatistics(response.data);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Load statistics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const setQuickDateRange = (days) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setDateRange({ startDate, endDate });
  };

  const handleExport = async (reportType, format) => {
    const exportKey = `${reportType}-${format}`;
    setExporting(prev => ({ ...prev, [exportKey]: true }));
    
    try {
      let response;
      const params = { ...dateRange };
      
      if (format === 'csv') {
        response = await exportReportCSV(reportType, params);
      } else {
        response = await exportReportPDF(reportType, params);
      }
      
      if (response.success) {
        // Create download link for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${reportType}-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success(`${reportType} report exported successfully`);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(`Failed to export ${reportType} report`);
      console.error('Export error:', error);
    } finally {
      setExporting(prev => ({ ...prev, [exportKey]: false }));
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value?.toLocaleString() || 0}</p>
          {change !== undefined && (
            <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  const ReportCard = ({ report }) => (
    <Card className="h-full">
      <div className="flex items-start space-x-3">
        <div className={`p-3 rounded-lg bg-${report.color}-50 flex-shrink-0`}>
          <report.icon className={`w-6 h-6 text-${report.color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{report.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{report.description}</p>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport(report.id, 'csv')}
              disabled={exporting[`${report.id}-csv`]}
            >
              {exporting[`${report.id}-csv`] ? 'Exporting...' : 'CSV'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport(report.id, 'pdf')}
              disabled={exporting[`${report.id}-pdf`]}
            >
              {exporting[`${report.id}-pdf`] ? 'Exporting...' : 'PDF'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">
          Generate detailed reports and view branch statistics
        </p>
      </div>

      {/* Date Range Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            
            <div className="flex items-center space-x-2">
              <FormInput
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="w-auto"
              />
              <span className="text-gray-500">to</span>
              <FormInput
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {quickDateRanges.map((range) => (
              <Button
                key={range.days}
                size="sm"
                variant="outline"
                onClick={() => setQuickDateRange(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Statistics Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Statistics</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Employers"
              value={statistics?.totalEmployers}
              icon={UsersIcon}
              color="blue"
              change={statistics?.employerGrowth}
            />
            <StatCard
              title="Active Employers"
              value={statistics?.activeEmployers}
              icon={UsersIcon}
              color="green"
            />
            <StatCard
              title="Total Companies"
              value={statistics?.totalCompanies}
              icon={BuildingOfficeIcon}
              color="purple"
              change={statistics?.companyGrowth}
            />
            <StatCard
              title="Active Companies"
              value={statistics?.activeCompanies}
              icon={BuildingOfficeIcon}
              color="indigo"
            />
            <StatCard
              title="Total Job Ads"
              value={statistics?.totalAds}
              icon={DocumentTextIcon}
              color="orange"
              change={statistics?.adGrowth}
            />
            <StatCard
              title="Approved Ads"
              value={statistics?.approvedAds}
              icon={DocumentTextIcon}
              color="green"
            />
            <StatCard
              title="Pending Approvals"
              value={statistics?.pendingAds}
              icon={DocumentTextIcon}
              color="yellow"
            />
            <StatCard
              title="Candidates Screened"
              value={statistics?.candidatesScreened}
              icon={UsersIcon}
              color="red"
              change={statistics?.screeningGrowth}
            />
          </div>
        )}
      </div>

      {/* Additional Metrics */}
      {!loading && statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Rates</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employer Approvals</span>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.employerApprovalRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ad Approvals</span>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.adApprovalRate}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Processing Time</span>
                <span className="text-sm font-medium text-gray-900">
                  {statistics.avgProcessingHours}h
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">MOU Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active MOUs</span>
                <span className="text-sm font-medium text-green-600">
                  {statistics.activeMous}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expiring Soon</span>
                <span className="text-sm font-medium text-yellow-600">
                  {statistics.expiringSoonMous}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employers without MOU</span>
                <span className="text-sm font-medium text-red-600">
                  {statistics.employersWithoutMou}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Categories</h3>
            <div className="space-y-3">
              {statistics.topCategories?.slice(0, 5).map((category, index) => (
                <div key={category.name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">{category.name}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {category.count} ads
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Report Generation */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </div>

      {/* Export All Reports */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Export All Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate a comprehensive report package for the selected date range
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              icon={ArrowDownTrayIcon}
              onClick={() => handleExport('comprehensive', 'csv')}
              disabled={exporting['comprehensive-csv']}
            >
              {exporting['comprehensive-csv'] ? 'Generating...' : 'Export All (CSV)'}
            </Button>
            <Button
              variant="primary"
              icon={ArrowDownTrayIcon}
              onClick={() => handleExport('comprehensive', 'pdf')}
              disabled={exporting['comprehensive-pdf']}
            >
              {exporting['comprehensive-pdf'] ? 'Generating...' : 'Export All (PDF)'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;