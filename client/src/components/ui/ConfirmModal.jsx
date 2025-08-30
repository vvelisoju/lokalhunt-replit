
import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger" // danger, warning, info
}) => {
  const getIconColor = () => {
    switch (variant) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center`}>
            <ExclamationTriangleIcon className={`w-6 h-6 ${getIconColor()}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4 py-2"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
