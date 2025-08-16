import { useState } from 'react';
import { 
  EyeIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const AdApprovalTable = ({ 
  ads, 
  loading, 
  onApprove, 
  onReject, 
  onBulkApprove, 
  onBulkReject, 
  onView 
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', ad: null, isBulk: false });
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === ads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ads.map(ad => ad.id));
    }
  };

  const handleSelectAd = (adId) => {
    setSelectedIds(prev => 
      prev.includes(adId) 
        ? prev.filter(id => id !== adId)
        : [...prev, adId]
    );
  };

  const handleAction = async (type, ad = null) => {
    if (type === 'view') {
      onView(ad.id);
      return;
    }
    
    if (type === 'approve' && ad) {
      setProcessing(true);
      try {
        await onApprove(ad.id);
      } finally {
        setProcessing(false);
      }
      return;
    }

    if (type === 'bulk-approve' && selectedIds.length > 0) {
      setProcessing(true);
      try {
        await onBulkApprove(selectedIds);
        setSelectedIds([]);
      } finally {
        setProcessing(false);
      }
      return;
    }

    setActionModal({ 
      isOpen: true, 
      type, 
      ad, 
      isBulk: type.startsWith('bulk-')
    });
  };

  const confirmAction = async () => {
    setProcessing(true);
    try {
      const { type, ad, isBulk } = actionModal;
      
      if (isBulk) {
        if (type === 'bulk-reject') {
          await onBulkReject(selectedIds, notes);
          setSelectedIds([]);
        }
      } else {
        if (type === 'reject') await onReject(ad.id, notes);
      }
    } finally {
      setProcessing(false);
      setActionModal({ isOpen: false, type: '', ad: null, isBulk: false });
      setNotes('');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      DRAFT: { color: 'gray', text: 'Draft' },
      PENDING_APPROVAL: { color: 'yellow', text: 'Pending' },
      APPROVED: { color: 'green', text: 'Approved' },
      REJECTED: { color: 'red', text: 'Rejected' },
      ARCHIVED: { color: 'gray', text: 'Archived' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING_APPROVAL;
    return <Badge color={config.color} text={config.text} />;
  };

  const getActionButtons = (ad) => {
    const buttons = [
      <Button
        key="view"
        size="sm"
        variant="outline"
        icon={EyeIcon}
        onClick={() => handleAction('view', ad)}
      >
        View
      </Button>
    ];

    if (ad.status === 'PENDING_APPROVAL') {
      buttons.push(
        <Button
          key="approve"
          size="sm"
          variant="success"
          icon={CheckIcon}
          onClick={() => handleAction('approve', ad)}
          disabled={processing}
        >
          Approve
        </Button>,
        <Button
          key="reject"
          size="sm"
          variant="danger"
          icon={XMarkIcon}
          onClick={() => handleAction('reject', ad)}
          disabled={processing}
        >
          Reject
        </Button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Job Ads</h3>
            
            {selectedIds.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">
                  {selectedIds.length} selected
                </span>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleAction('bulk-approve')}
                  disabled={processing}
                >
                  Bulk Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleAction('bulk-reject')}
                  disabled={processing}
                >
                  Bulk Reject
                </Button>
              </div>
            )}
          </div>
        </div>

        {ads.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No ads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === ads.length && ads.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MOU Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(ad.id)}
                        onChange={() => handleSelectAd(ad.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                      <div className="text-sm text-gray-500">{ad.categoryName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ad.company?.name}</div>
                      <div className="text-sm text-gray-500">{ad.location?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ad.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ad.employer?.activeMou ? (
                          <Badge color="green" text="Active" />
                        ) : (
                          <div className="flex items-center space-x-1">
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                            <Badge color="red" text="No MOU" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ad.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {getActionButtons(ad)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', ad: null, isBulk: false })}
        title={actionModal.isBulk ? 'Bulk Reject Ads' : 'Reject Ad'}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {actionModal.isBulk 
              ? `Are you sure you want to reject ${selectedIds.length} selected ads?`
              : `Are you sure you want to reject the ad "${actionModal.ad?.title}"?`
            }
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for rejecting this ad..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setActionModal({ isOpen: false, type: '', ad: null, isBulk: false })}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmAction}
              disabled={processing || !notes.trim()}
            >
              {processing ? 'Processing...' : 'Reject'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AdApprovalTable;