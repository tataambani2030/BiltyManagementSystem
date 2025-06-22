import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Schedule } from '../../types';

interface ScheduleFormProps {
  schedule?: Schedule;
  onClose: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onClose }) => {
  const { dispatch } = useData();
  const [formData, setFormData] = useState({
    shift: schedule?.shift || 'Morning',
    inTime: schedule?.inTime || '06:00',
    outTime: schedule?.outTime || '14:00',
    driverId: schedule?.driverId || '',
    operatingDays: schedule?.operatingDays || 26,
    taxDeduction: schedule?.taxDeduction || 0,
    finalPayment: schedule?.finalPayment || 0,
    date: schedule?.date ? new Date(schedule.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'operatingDays' || name === 'taxDeduction' || name === 'finalPayment' ? Number(value) : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-calculate final payment when other fields change
    if (name === 'operatingDays' || name === 'taxDeduction') {
      const days = name === 'operatingDays' ? Number(value) : formData.operatingDays;
      const tax = name === 'taxDeduction' ? Number(value) : formData.taxDeduction;
      const basePayment = days * 500; // Assuming 500 per day base rate
      const finalPayment = Math.max(0, basePayment - tax);
      
      setFormData(prev => ({
        ...prev,
        finalPayment,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.driverId.trim()) newErrors.driverId = 'Driver ID is required';
    if (formData.operatingDays < 0 || formData.operatingDays > 31) {
      newErrors.operatingDays = 'Operating days must be between 0 and 31';
    }
    if (formData.taxDeduction < 0) newErrors.taxDeduction = 'Tax deduction cannot be negative';
    if (formData.finalPayment < 0) newErrors.finalPayment = 'Final payment cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const scheduleData = {
      ...formData,
      shift: formData.shift as 'Morning' | 'Evening',
      date: new Date(formData.date).toISOString(),
    };

    if (schedule) {
      dispatch({
        type: 'UPDATE_SCHEDULE',
        payload: { ...schedule, ...scheduleData },
      });
    } else {
      dispatch({
        type: 'ADD_SCHEDULE',
        payload: scheduleData,
      });
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {schedule ? 'Edit Schedule' : 'Add New Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                Shift *
              </label>
              <select
                id="shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inTime" className="block text-sm font-medium text-gray-700 mb-1">
                In Time *
              </label>
              <input
                type="time"
                id="inTime"
                name="inTime"
                value={formData.inTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="outTime" className="block text-sm font-medium text-gray-700 mb-1">
                Out Time *
              </label>
              <input
                type="time"
                id="outTime"
                name="outTime"
                value={formData.outTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
              Driver ID *
            </label>
            <input
              type="text"
              id="driverId"
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              placeholder="e.g., DRV001"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                errors.driverId ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.driverId && <p className="mt-1 text-sm text-red-600">{errors.driverId}</p>}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="operatingDays" className="block text-sm font-medium text-gray-700 mb-1">
                  Operating Days *
                </label>
                <input
                  type="number"
                  id="operatingDays"
                  name="operatingDays"
                  value={formData.operatingDays}
                  onChange={handleChange}
                  min="0"
                  max="31"
                  placeholder="26"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.operatingDays ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.operatingDays && <p className="mt-1 text-sm text-red-600">{errors.operatingDays}</p>}
              </div>

              <div>
                <label htmlFor="taxDeduction" className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Deduction (₹) *
                </label>
                <input
                  type="number"
                  id="taxDeduction"
                  name="taxDeduction"
                  value={formData.taxDeduction}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.taxDeduction ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.taxDeduction && <p className="mt-1 text-sm text-red-600">{errors.taxDeduction}</p>}
              </div>

              <div>
                <label htmlFor="finalPayment" className="block text-sm font-medium text-gray-700 mb-1">
                  Final Payment (₹) *
                </label>
                <input
                  type="number"
                  id="finalPayment"
                  name="finalPayment"
                  value={formData.finalPayment}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50 ${
                    errors.finalPayment ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.finalPayment && <p className="mt-1 text-sm text-red-600">{errors.finalPayment}</p>}
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <p><strong>Calculation:</strong> Base Rate (₹500/day) × Operating Days - Tax Deduction = Final Payment</p>
              <p>₹500 × {formData.operatingDays} - ₹{formData.taxDeduction} = ₹{formData.finalPayment}</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {schedule ? 'Update' : 'Add'} Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm;