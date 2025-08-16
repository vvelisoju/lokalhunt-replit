import { useState } from 'react';
import { 
  EyeIcon, 
  StarIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Select from '../ui/Select';
import Modal from '../ui/Modal';

const CandidateScreeningTable = ({ 
  candidates, 
  loading, 
  onUpdateStatus, 
  onRateCandidate, 
  onViewProfile 
}) => {
  const [ratingModal, setRatingModal] = useState({ isOpen: false, candidate: null });
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleStatusChange = async (allocationId, newStatus) => {
    await onUpdateStatus(allocationId, newStatus);
  };

  const openRatingModal = (candidate) => {
    setRatingModal({ isOpen: true, candidate });
    setRating(candidate.overallRating || 0);
    setNotes('');
  };

  const submitRating = async () => {
    if (!ratingModal.candidate) return;

    setProcessing(true);
    try {
      await onRateCandidate(ratingModal.candidate.id, rating, notes);
      setRatingModal({ isOpen: false, candidate: null });
      setRating(0);
      setNotes('');
    } finally {
      setProcessing(false);
    }
  };

  const getScreeningStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'yellow', text: 'Pending' },
      IN_PROGRESS: { color: 'blue', text: 'In Progress' },
      SCREENED: { color: 'green', text: 'Screened' },
      RATED: { color: 'purple', text: 'Rated' },
      REJECTED: { color: 'red', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge color={config.color} text={config.text} />;
  };

  const getAllocationStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'yellow', text: 'Pending' },
      SHORTLISTED: { color: 'blue', text: 'Shortlisted' },
      INTERVIEW_SCHEDULED: { color: 'purple', text: 'Interview' },
      HIRED: { color: 'green', text: 'Hired' },
      REJECTED: { color: 'red', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge color={config.color} text={config.text} />;
  };

  const renderStars = (currentRating, isInteractive = false, onStarClick = null) => {
    return [...Array(5)].map((_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= currentRating;
      
      return (
        <button
          key={i}
          type="button"
          onClick={isInteractive ? () => onStarClick(starValue) : undefined}
          className={`${isInteractive ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'}`}
        >
          {isFilled ? (
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-300" />
          )}
        </button>
      );
    });
  };

  const screeningStatusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'SCREENED', label: 'Screened' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

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
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
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
          <h3 className="text-lg font-medium text-gray-900">Candidate Screening</h3>
        </div>

        {candidates.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No candidates for screening</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screening Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {candidate.user?.name?.charAt(0) || 'C'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {candidate.user?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {candidate.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {candidate.allocation?.ad?.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {candidate.allocation?.ad?.company?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="min-w-32">
                        <Select
                          value={candidate.allocation?.screeningStatus || 'PENDING'}
                          onChange={(value) => handleStatusChange(candidate.allocation?.id, value)}
                          options={screeningStatusOptions}
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getAllocationStatusBadge(candidate.allocation?.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {renderStars(candidate.overallRating || 0)}
                        </div>
                        {candidate.overallRating && (
                          <span className="text-sm text-gray-500">
                            ({candidate.overallRating}/5)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          icon={EyeIcon}
                          onClick={() => onViewProfile(candidate.id)}
                        >
                          View
                        </Button>
                        {candidate.resumeUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={DocumentTextIcon}
                            onClick={() => window.open(candidate.resumeUrl, '_blank')}
                          >
                            Resume
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="primary"
                          icon={StarIcon}
                          onClick={() => openRatingModal(candidate)}
                        >
                          Rate
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
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, candidate: null })}
        title="Rate Candidate"
      >
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-medium text-gray-900">
              {ratingModal.candidate?.user?.name}
            </h4>
            <p className="text-sm text-gray-600">
              {ratingModal.candidate?.user?.email}
            </p>
          </div>

          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </label>
            <div className="flex justify-center space-x-1">
              {renderStars(rating, true, setRating)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Click stars to rate (1-5)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add notes about this candidate's rating..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setRatingModal({ isOpen: false, candidate: null })}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={submitRating}
              disabled={processing || rating === 0}
            >
              {processing ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CandidateScreeningTable;