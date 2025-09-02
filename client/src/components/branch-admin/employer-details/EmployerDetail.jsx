import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getEmployer,
  getEmployerJobAds,
  createJobAd,
  updateJobAd,
  deleteJobAd,
  approveJobAd,
  rejectJobAd,
  closeJobAd,
} from '../api/employers';
import JobAdsTab from '../components/JobAdsTab';
import EmployerInfoTab from '../components/EmployerInfoTab';
import { Tabs, Tab } from '../components/Tabs';
import Button from '../components/Button';
import Modal from '../components/Modal';
import JobAdForm from '../components/JobAdForm';
import JobAdDetail from '../components/JobAdDetail';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusBadge from '../components/StatusBadge';

const EmployerDetail = ({ employerId, onBack, onRefresh }) => {
  const [employer, setEmployer] = useState(null);
  const [jobAds, setJobAds] = useState([]);
  const [activeTab, setActiveTab] = useState('info');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);

  const navigate = useNavigate();

  const loadEmployer = useCallback(async () => {
    try {
      const employerData = await getEmployer(employerId);
      setEmployer(employerData);
      const jobAdsData = await getEmployerJobAds(employerId);
      setJobAds(jobAdsData);
    } catch (error) {
      console.error('Error loading employer data:', error);
    }
  }, [employerId]);

  useEffect(() => {
    loadEmployer();
  }, [loadEmployer]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateAd = () => {
    setModalTitle('Create New Job Ad');
    setSelectedAd(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEditAd = (ad) => {
    setModalTitle('Edit Job Ad');
    setSelectedAd(ad);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleViewAd = (ad) => {
    setModalTitle('Job Ad Details');
    setSelectedAd(ad);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAd(null);
    setIsEditing(false);
  };

  const handleSaveAd = async (adData) => {
    try {
      if (isEditing && selectedAd) {
        await updateJobAd(selectedAd.id, adData);
      } else {
        await createJobAd(employerId, adData);
      }
      loadEmployer();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving job ad:', error);
    }
  };

  const confirmDeleteAd = (ad) => {
    setAdToDelete(ad);
    setConfirmModalOpen(true);
  };

  const handleDeleteAd = async () => {
    if (adToDelete) {
      try {
        await deleteJobAd(adToDelete.id);
        loadEmployer();
        setConfirmModalOpen(false);
        setAdToDelete(null);
      } catch (error) {
        console.error('Error deleting job ad:', error);
      }
    }
  };

  const handleApproveAd = async (adId) => {
    try {
      await approveJobAd(adId);
      await loadEmployer();
    } catch (error) {
      console.error('Error approving job ad:', error);
    }
  };

  const handleRejectAd = async (adId) => {
    try {
      await rejectJobAd(adId);
      await loadEmployer();
    } catch (error) {
      console.error('Error rejecting job ad:', error);
    }
  };

  const handleCloseAd = async (adId) => {
    try {
      await closeJobAd(adId);
      await loadEmployer();
    } catch (error) {
      console.error('Error closing job ad:', error);
    }
  };

  const getStatusBadge = (status) => {
    return <StatusBadge status={status} />;
  };

  const handleRefresh = async () => {
    await loadEmployer();
    // Also refresh parent component if callback provided
    if (onRefresh) {
      await onRefresh();
    }
  };

  if (!employer) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Button onClick={onBack} variant="secondary" className="mb-4">
        Back to Employers
      </Button>
      <h1 className="text-3xl font-bold mb-4">{employer.name}</h1>

      <Tabs activeTab={activeTab} onTabChange={handleTabChange}>
        <Tab label="Employer Info" id="info">
          <EmployerInfoTab employer={employer} />
        </Tab>
        <Tab label="Job Ads" id="ads">
          <JobAdsTab
            employer={employer}
            onCreateAd={handleCreateAd}
            onEditAd={handleEditAd}
            onViewAd={handleViewAd}
            onRefresh={handleRefresh}
            getStatusBadge={getStatusBadge}
            onApprove={handleApproveAd}
            onReject={handleRejectAd}
            onClose={handleCloseAd}
            onDelete={confirmDeleteAd}
          />
        </Tab>
      </Tabs>

      {modalOpen && (
        <Modal onClose={handleCloseModal}>
          {selectedAd ? (
            isEditing ? (
              <JobAdForm
                initialData={selectedAd}
                onSave={handleSaveAd}
                onCancel={handleCloseModal}
              />
            ) : (
              <JobAdDetail
                ad={selectedAd}
                onEdit={handleEditAd}
                onDelete={confirmDeleteAd}
                onApprove={handleApproveAd}
                onReject={handleRejectAd}
                onClose={handleCloseAd}
                onBack={handleCloseModal}
              />
            )
          ) : (
            <JobAdForm onSave={handleSaveAd} onCancel={handleCloseModal} />
          )}
        </Modal>
      )}

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onConfirm={handleDeleteAd}
        onCancel={() => {
          setConfirmModalOpen(false);
          setAdToDelete(null);
        }}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the job ad "${adToDelete?.title}"?`}
      />
    </div>
  );
};

export default EmployerDetail;