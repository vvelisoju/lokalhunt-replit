import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AdApprovalTable from '../../components/branch-admin/AdApprovalTable';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  getAds, 
  approveAd, 
  rejectAd, 
  bulkApproveAds, 
  bulkRejectAds 
} from '../../services/branch-admin/ads';

const EmployerAds = () => {
  const { employerId } = useParams();
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employer, setEmployer] = useState(null);
  const [filters, setFilters] = useState({
    employerId: employerId,
    search: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    if (employerId) {
      setFilters(prev => ({ ...prev, employerId }));
      loadAds();
    }
  }, [employerId]);

  const loadAds = async () => {
    setLoading(true);
    try {
      console.log('Loading ads with filters:', filters);
      const response = await getAds(filters);
      
      if (response.success) {
        console.log('Employer ads response:', response.data);
        const adsData = response.data.data || response.data.ads || [];
        setAds(adsData);
        
        // Set employer info from first ad if available
        if (adsData.length > 0 && adsData[0].employer) {
          setEmployer(adsData[0].employer);
        }
      } else {
        toast.error(response.error || 'Failed to load employer ads');
        setAds([]);
      }
    } catch (error) {
      console.error('Error loading employer ads:', error);
      toast.error('Failed to load employer ads');
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adId) => {
    try {
      const response = await approveAd(adId);
      if (response.success) {
        toast.success('Ad approved successfully');
        // Re-render the ads list to show updated status
        await loadAds();
      } else {
        toast.error(response.error || 'Failed to approve ad');
      }
    } catch (error) {
      console.error('Error approving ad:', error);
      toast.error('Failed to approve ad');
    }
  };

  const handleReject = async (adId, notes) => {
    try {
      const response = await rejectAd(adId, notes);
      if (response.success) {
        toast.success('Ad rejected successfully');
        // Re-render the ads list to show updated status
        await loadAds();
      } else {
        toast.error(response.error || 'Failed to reject ad');
      }
    } catch (error) {
      console.error('Error rejecting ad:', error);
      toast.error('Failed to reject ad');
    }
  };

  const handleBulkApprove = async (adIds) => {
    try {
      const response = await bulkApproveAds(adIds);
      if (response.success) {
        toast.success(`${adIds.length} ads approved successfully`);
        // Re-render the ads list to show updated status
        await loadAds();
      } else {
        toast.error(response.error || 'Failed to approve ads');
      }
    } catch (error) {
      console.error('Error bulk approving ads:', error);
      toast.error('Failed to approve ads');
    }
  };

  const handleBulkReject = async (adIds, notes) => {
    try {
      const response = await bulkRejectAds(adIds, notes);
      if (response.success) {
        toast.success(`${adIds.length} ads rejected successfully`);
        // Re-render the ads list to show updated status
        await loadAds();
      } else {
        toast.error(response.error || 'Failed to reject ads');
      }
    } catch (error) {
      console.error('Error bulk rejecting ads:', error);
      toast.error('Failed to reject ads');
    }
  };

  const handleView = (adId) => {
    navigate(`/branch-admin/ads/${adId}`);
  };

  const handleBack = () => {
    navigate('/branch-admin/employers');
  };

  const handleRefresh = () => {
    loadAds();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                icon={ArrowLeftIcon}
                onClick={handleBack}
              >
                Back to Employers
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {employer ? `${employer.user?.name || employer.companyName || 'Employer'} - Job Ads` : 'Employer Job Ads'}
                </h1>
                <p className="text-gray-600 mt-1">
                  Review and manage job advertisements for this employer
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Employer Info Card */}
        {employer && (
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {employer.user?.name || 'Employer Name'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {employer.user?.email || 'No email available'}
                  </p>
                  <p className="text-gray-600">
                    {employer.user?.phone || 'No phone available'}
                  </p>
                  {employer.contactDetails && (
                    <p className="text-gray-600 mt-2">
                      Contact: {employer.contactDetails}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Ads</p>
                  <p className="text-2xl font-bold text-gray-900">{ads.length}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Ads Table */}
        <Card>
          <div className="p-6">
            <AdApprovalTable
              ads={ads}
              loading={loading}
              onApprove={handleApprove}
              onReject={handleReject}
              onBulkApprove={handleBulkApprove}
              onBulkReject={handleBulkReject}
              onView={handleView}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployerAds;