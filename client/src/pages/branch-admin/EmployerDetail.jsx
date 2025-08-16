import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getEmployer, approveEmployer, rejectEmployer, blockEmployer } from '../../services/branch-admin/employers';

const EmployerDetail = () => {
  const { employerId } = useParams();
  const navigate = useNavigate();
  
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', title: '' });
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEmployerDetail();
  }, [employerId]);

  const loadEmployerDetail = async () => {
    setLoading(true);
    try {
      const response = await getEmployer(employerId);
      
      if (response.success) {
        setEmployer(response.data);
      } else {
        toast.error(response.error);
        navigate('/branch-admin/employers');
      }
    } catch (error) {
      toast.error('Failed to load employer details');
      navigate('/branch-admin/employers');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type, title) => {
    setActionModal({ isOpen: true, type, title });
    setNotes('');
  };

  const confirmAction = async () => {
    if (!employer) return;

    setProcessing(true);
    try {
      let response;
      
      switch (actionModal.type) {
        case 'approve':
          response = await approveEmployer(employer.id);
          break;
        case 'reject':
          response = await rejectEmployer(employer.id, notes);
          break;
        case 'block':
          response = await blockEmployer(employer.id, notes);
          break;
        default:
          return;
      }

      if (response.success) {
        toast.success(`Employer ${actionModal.type}d successfully`);
        setActionModal({ isOpen: false, type: '', title: '' });
        loadEmployerDetail();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(`Failed to ${actionModal.type} employer`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'green', text: 'Active' },
      PENDING_APPROVAL: { color: 'yellow', text: 'Pending Approval' },
      BLOCKED: { color: 'red', text: 'Blocked' },
      REJECTED: { color: 'gray', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING_APPROVAL;
    return <Badge color={config.color} text={config.text} />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employer not found</p>
        <Button
          onClick={() => navigate('/branch-admin/employers')}
          className="mt-4"
        >
          Back to Employers
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeftIcon}
              onClick={() => navigate('/branch-admin/employers')}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <span>{employer.user?.name || 'N/A'}</span>
                {getStatusBadge(employer.status)}
              </h1>
              <p className="text-gray-600 mt-1">Employer Details</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {employer.status === 'PENDING_APPROVAL' && (
              <>
                <Button
                  variant="success"
                  onClick={() => handleAction('approve', 'Approve Employer')}
                  disabled={processing}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleAction('reject', 'Reject Employer')}
                  disabled={processing}
                >
                  Reject
                </Button>
              </>
            )}
            
            {employer.status === 'ACTIVE' && (
              <Button
                variant="danger"
                onClick={() => handleAction('block', 'Block Employer')}
                disabled={processing}
              >
                Block
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <p className="text-sm text-gray-900">{employer.user?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <EnvelopeIcon className="w-4 h-4 mr-1" />
                    {employer.user?.email || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <p className="text-sm text-gray-900">{employer.user?.phone || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Date
                  </label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {new Date(employer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Companies */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Companies ({employer.companies?.length || 0})
              </h3>
              
              {!employer.companies?.length ? (
                <p className="text-gray-500 text-center py-8">No companies registered</p>
              ) : (
                <div className="space-y-4">
                  {employer.companies.map((company) => (
                    <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{company.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{company.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span>Industry: {company.industry || 'N/A'}</span>
                            <span>Size: {company.size || 'N/A'}</span>
                            <span>Location: {company.city?.name || 'N/A'}</span>
                          </div>
                        </div>
                        <Badge 
                          color={company.isActive ? 'green' : 'gray'} 
                          text={company.isActive ? 'Active' : 'Inactive'} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Job Ads */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Job Ads ({employer.ads?.length || 0})
              </h3>
              
              {!employer.ads?.length ? (
                <p className="text-gray-500 text-center py-8">No job ads posted</p>
              ) : (
                <div className="space-y-4">
                  {employer.ads.slice(0, 5).map((ad) => (
                    <div key={ad.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{ad.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{ad.company?.name}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span>Category: {ad.categoryName}</span>
                            <span>Location: {ad.location?.name}</span>
                            <span>Posted: {new Date(ad.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge 
                          color={ad.status === 'APPROVED' ? 'green' : 
                               ad.status === 'PENDING_APPROVAL' ? 'yellow' : 'red'} 
                          text={ad.status} 
                        />
                      </div>
                    </div>
                  ))}
                  
                  {employer.ads.length > 5 && (
                    <div className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/branch-admin/ads?employerId=${employer.id}`)}
                      >
                        View All {employer.ads.length} Ads
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status History</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Registered</p>
                    <p className="text-xs text-gray-500">
                      {new Date(employer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {employer.approvedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Approved</p>
                      <p className="text-xs text-gray-500">
                        {new Date(employer.approvedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {employer.rejectedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Rejected</p>
                      <p className="text-xs text-gray-500">
                        {new Date(employer.rejectedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* MOU Status */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">MOU Status</h3>
              
              {employer.activeMou ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge color="green" text="Active MOU" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Fee Type:</span> {employer.activeMou.feeType}</p>
                    <p><span className="font-medium">Fee Value:</span> {employer.activeMou.feeValue}%</p>
                    <p><span className="font-medium">Valid Until:</span> {new Date(employer.activeMou.validUntil).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/branch-admin/mou?employerId=${employer.id}`)}
                  >
                    View MOU Details
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Badge color="red" text="No Active MOU" />
                  <p className="text-sm text-gray-600 mt-2">
                    This employer cannot submit ads for approval without an active MOU.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate(`/branch-admin/mou/create?employerId=${employer.id}`)}
                  >
                    Create MOU
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Companies</span>
                  <span className="text-sm font-medium text-gray-900">
                    {employer.companies?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Ads Posted</span>
                  <span className="text-sm font-medium text-gray-900">
                    {employer.ads?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Ads</span>
                  <span className="text-sm font-medium text-gray-900">
                    {employer.ads?.filter(ad => ad.status === 'APPROVED')?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Candidates</span>
                  <span className="text-sm font-medium text-gray-900">
                    {employer._count?.allocations || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', title: '' })}
        title={actionModal.title}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {actionModal.type} employer "{employer?.user?.name}"?
          </p>
          
          {(actionModal.type === 'reject' || actionModal.type === 'block') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionModal.type === 'reject' ? 'Rejection' : 'Blocking'} Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Reason for ${actionModal.type}ing this employer...`}
                required
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setActionModal({ isOpen: false, type: '', title: '' })}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={actionModal.type === 'approve' ? 'success' : 'danger'}
              onClick={confirmAction}
              disabled={processing || ((actionModal.type === 'reject' || actionModal.type === 'block') && !notes.trim())}
            >
              {processing ? 'Processing...' : `${actionModal.type.charAt(0).toUpperCase() + actionModal.type.slice(1)} Employer`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployerDetail;