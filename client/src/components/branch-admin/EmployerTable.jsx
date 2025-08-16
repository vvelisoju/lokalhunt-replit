import { useState } from 'react';
import { 
  EyeIcon, 
  CheckIcon, 
  XMarkIcon, 
  NoSymbolIcon,
  PlayIcon 
} from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const EmployerTable = ({ 
  employers, 
  loading, 
  onApprove, 
  onReject, 
  onBlock, 
  onUnblock, 
  onView 
}) => {
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', employer: null });
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAction = async (type, employer) => {
    if (type === 'view') {
      onView(employer.id);
      return;
    }
    
    if (type === 'approve' || type === 'unblock') {
      setProcessing(true);
      try {
        if (type === 'approve') await onApprove(employer.id);
        if (type === 'unblock') await onUnblock(employer.id);
      } finally {
        setProcessing(false);
      }
      return;
    }

    setActionModal({ isOpen: true, type, employer });
  };

  const confirmAction = async () => {
    if (!actionModal.employer) return;

    setProcessing(true);
    try {
      const { type, employer } = actionModal;
      if (type === 'reject') await onReject(employer.id, notes);
      if (type === 'block') await onBlock(employer.id, notes);
    } finally {
      setProcessing(false);
      setActionModal({ isOpen: false, type: '', employer: null });
      setNotes('');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { color: 'green', text: 'Active' },
      PENDING_APPROVAL: { color: 'yellow', text: 'Pending' },
      BLOCKED: { color: 'red', text: 'Blocked' },
      REJECTED: { color: 'gray', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING_APPROVAL;
    return <Badge color={config.color} text={config.text} />;
  };

  const getActionButtons = (employer) => {
    const buttons = [
      <Button
        key="view"
        size="sm"
        variant="outline"
        icon={EyeIcon}
        onClick={() => handleAction('view', employer)}
      >
        View
      </Button>
    ];

    if (employer.status === 'PENDING_APPROVAL') {
      buttons.push(
        <Button
          key="approve"
          size="sm"
          variant="success"
          icon={CheckIcon}
          onClick={() => handleAction('approve', employer)}
          disabled={processing}
        >
          Approve
        </Button>,
        <Button
          key="reject"
          size="sm"
          variant="danger"
          icon={XMarkIcon}
          onClick={() => handleAction('reject', employer)}
          disabled={processing}
        >
          Reject
        </Button>
      );
    }

    if (employer.status === 'ACTIVE') {
      buttons.push(
        <Button
          key="block"
          size="sm"
          variant="danger"
          icon={NoSymbolIcon}
          onClick={() => handleAction('block', employer)}
          disabled={processing}
        >
          Block
        </Button>
      );
    }

    if (employer.status === 'BLOCKED') {
      buttons.push(
        <Button
          key="unblock"
          size="sm"
          variant="success"
          icon={PlayIcon}
          onClick={() => handleAction('unblock', employer)}
          disabled={processing}
        >
          Unblock
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
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
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
          <h3 className="text-lg font-medium text-gray-900">Employers</h3>
        </div>
        
        {employers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No employers found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {employers.map((employer) => (
              <div key={employer.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {employer.user?.name || 'N/A'}
                      </h4>
                      {getStatusBadge(employer.status)}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{employer.user?.email}</span>
                      <span>•</span>
                      <span>{employer.companies?.length || 0} companies</span>
                      <span>•</span>
                      <span>
                        Joined {new Date(employer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getActionButtons(employer)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', employer: null })}
        title={`${actionModal.type === 'reject' ? 'Reject' : 'Block'} Employer`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to {actionModal.type} employer "{actionModal.employer?.user?.name}"?
          </p>
          
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
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setActionModal({ isOpen: false, type: '', employer: null })}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmAction}
              disabled={processing || !notes.trim()}
            >
              {processing ? 'Processing...' : `${actionModal.type === 'reject' ? 'Reject' : 'Block'} Employer`}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployerTable;