import { useState } from 'react';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';

const MouForm = ({ employer, initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    feeType: initialData?.feeType || 'PERCENTAGE',
    feeValue: initialData?.feeValue || '',
    validFrom: initialData?.validFrom || new Date().toISOString().split('T')[0],
    validUntil: initialData?.validUntil || '',
    terms: initialData?.terms || '',
    notes: initialData?.notes || '',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  const feeTypeOptions = [
    { value: 'PERCENTAGE', label: 'Percentage (%)' },
    { value: 'FIXED', label: 'Fixed Amount (₹)' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.feeValue || formData.feeValue <= 0) {
      newErrors.feeValue = 'Fee value is required and must be greater than 0';
    }

    if (formData.feeType === 'PERCENTAGE' && formData.feeValue > 100) {
      newErrors.feeValue = 'Percentage cannot exceed 100%';
    }

    if (!formData.validFrom) {
      newErrors.validFrom = 'Valid from date is required';
    }

    if (!formData.validUntil) {
      newErrors.validUntil = 'Valid until date is required';
    }

    if (formData.validFrom && formData.validUntil && 
        new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = 'Valid until date must be after valid from date';
    }

    if (!formData.terms.trim()) {
      newErrors.terms = 'MOU terms are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employer Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Employer Information</h4>
        <div className="text-sm text-gray-600">
          <p><span className="font-medium">Name:</span> {employer?.user?.name}</p>
          <p><span className="font-medium">Email:</span> {employer?.user?.email}</p>
          <p><span className="font-medium">Companies:</span> {employer?.companies?.length || 0}</p>
        </div>
      </div>

      {/* Fee Structure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Select
            label="Fee Type"
            value={formData.feeType}
            onChange={(value) => handleChange('feeType', value)}
            options={feeTypeOptions}
            error={errors.feeType}
            required
          />
        </div>
        
        <div>
          <FormInput
            label={`Fee Value (${formData.feeType === 'PERCENTAGE' ? '%' : '₹'})`}
            type="number"
            step={formData.feeType === 'PERCENTAGE' ? '0.01' : '1'}
            min="0"
            max={formData.feeType === 'PERCENTAGE' ? '100' : undefined}
            value={formData.feeValue}
            onChange={(e) => handleChange('feeValue', parseFloat(e.target.value) || '')}
            error={errors.feeValue}
            placeholder={formData.feeType === 'PERCENTAGE' ? 'e.g., 15' : 'e.g., 5000'}
            required
          />
        </div>
      </div>

      {/* Validity Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <FormInput
            label="Valid From"
            type="date"
            value={formData.validFrom}
            onChange={(e) => handleChange('validFrom', e.target.value)}
            error={errors.validFrom}
            required
          />
        </div>
        
        <div>
          <FormInput
            label="Valid Until"
            type="date"
            value={formData.validUntil}
            onChange={(e) => handleChange('validUntil', e.target.value)}
            error={errors.validUntil}
            required
          />
        </div>
      </div>

      {/* Terms */}
      <div>
        <TextArea
          label="MOU Terms & Conditions"
          value={formData.terms}
          onChange={(e) => handleChange('terms', e.target.value)}
          rows={6}
          error={errors.terms}
          placeholder="Enter detailed terms and conditions for this MOU..."
          required
        />
      </div>

      {/* Notes */}
      <div>
        <TextArea
          label="Internal Notes (Optional)"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          error={errors.notes}
          placeholder="Internal notes about this MOU (not visible to employer)..."
        />
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">MOU Summary</h4>
        <div className="text-sm text-blue-800">
          <p>
            <span className="font-medium">Fee Structure:</span>{' '}
            {formData.feeType === 'PERCENTAGE' 
              ? `${formData.feeValue}% of salary` 
              : `₹${formData.feeValue} fixed`
            }
          </p>
          <p>
            <span className="font-medium">Validity:</span>{' '}
            {formData.validFrom} to {formData.validUntil}
          </p>
          {formData.validFrom && formData.validUntil && (
            <p>
              <span className="font-medium">Duration:</span>{' '}
              {Math.ceil((new Date(formData.validUntil) - new Date(formData.validFrom)) / (1000 * 60 * 60 * 24))} days
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData?.id ? 'Update MOU' : 'Create MOU')}
        </Button>
      </div>
    </form>
  );
};

export default MouForm;