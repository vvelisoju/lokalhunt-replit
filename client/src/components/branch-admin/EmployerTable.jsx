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

  const handleAction = (action, employer) => {
    switch (action) {
      case 'view':
        onView(employer.id);
        break;
      case 'approve':
        onApprove(employer.id);
        break;
      case 'reject':
        setActionModal({
          isOpen: true,
          type: action,
          employer
        });
        break;
      default:
        console.warn('Unknown action:', action);
    }
  };

  const handleConfirmAction = () => {
    if (!actionModal.employer) return;

    setProcessing(true);

    onReject(actionModal.employer.id, notes)
      .finally(() => {
        setProcessing(false);
        setActionModal({ isOpen: false, type: '', employer: null });
        setNotes('');
      });
  };

  const getStatusBadge = (employer) => {
    if (!employer.user.isActive) {
      return <Badge variant="danger">Blocked</Badge>;
    }

    return <Badge variant="success">Active</Badge>;
  };

  const getSubscriptionBadge = (subscriptionDetails) => {
    if (!subscriptionDetails.hasActiveSubscription) {
      return <Badge variant="warning">No Subscription</Badge>;
    }

    switch (subscriptionDetails.subscriptionStatus) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'EXPIRED':
        return <Badge variant="danger">Expired</Badge>;
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="warning">Unknown</Badge>;
    }
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
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Employer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Companies</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Subscription</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Active Jobs</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employers.map((employer) => (
                <tr key={employer.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{employer.user.name}</p>
                      <p className="text-sm text-gray-600">{employer.user.email}</p>
                      <p className="text-xs text-gray-500">
                        {employer.user.city?.name}, {employer.user.city?.state}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      {employer.companies.length > 0 ? (
                        <>
                          <p className="font-medium text-gray-900">
                            {employer.companies.length}
                          </p>
                          <p className="text-gray-600">Companies</p>
                        </>
                      ) : (
                        <p className="text-gray-500 italic">No companies</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1">
                      {getSubscriptionBadge(employer.subscriptionDetails)}
                      {employer.subscriptionDetails.hasActiveSubscription && (
                        <p className="text-xs text-gray-600">
                          {employer.subscriptionDetails.currentPlan?.name}
                        </p>
                      )}
                      {employer.hasActiveMOU && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          MOU Active
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-center">
                      <span className="text-lg font-semibold text-gray-900">
                        {employer.subscriptionDetails.activeJobsCount}
                      </span>
                      <p className="text-xs text-gray-500">jobs</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(employer)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(employer.id)}
                      >
                        View
                      </Button>
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
              onClick={handleConfirmAction}
              disabled={processing || !notes.trim()}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmployerTable;