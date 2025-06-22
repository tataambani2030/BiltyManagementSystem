import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Vehicle } from '../../types';
import {
  validateVehicleNumber,
  formatVehicleNumber,
  normalizeVehicleNumber,
} from '../../utils/validation';
import { vehiclesService } from '../../services/database'; // ✅ Add this

interface VehicleFormProps {
  vehicle?: Vehicle;
  onClose: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onClose }) => {
  const { dispatch } = useData();
  const [formData, setFormData] = useState({
    transportName: vehicle?.transportName || '',
    driverName: vehicle?.driverName || '',
    vehicleNo: vehicle?.vehicleNo || '',
    dateTime: vehicle?.dateTime
      ? new Date(vehicle.dateTime).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    advance: vehicle?.advance || 0,
    status: vehicle?.status || 'Active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'vehicleNo') {
      const normalizedValue = normalizeVehicleNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: normalizedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'advance' ? Number(value) : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.transportName.trim())
      newErrors.transportName = 'Transport name is required';
    if (!formData.driverName.trim())
      newErrors.driverName = 'Driver name is required';

    // Validate vehicle number
    const vehicleValidation = validateVehicleNumber(formData.vehicleNo);
    if (!vehicleValidation.isValid) {
      newErrors.vehicleNo = vehicleValidation.error || 'Invalid vehicle number';
    }

    if (formData.advance < 0) newErrors.advance = 'Advance cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const vehicleData = {
      ...formData,
      vehicleNo: normalizeVehicleNumber(formData.vehicleNo),
      dateTime: new Date(formData.dateTime).toISOString(),
      productInfo: 'Tomato Transport', // Default product info
      quantity: 0, // Default quantity
      plant: '', // Default plant
      status: formData.status as 'Active' | 'Idle' | 'Maintenance',
    };
    try {
      if (vehicle) {
        dispatch({
          type: 'UPDATE_VEHICLE',
          payload: { ...vehicle, ...vehicleData },
        });
      } else {
        const created = await vehiclesService.create({
          transport_name: vehicleData.transportName,
          driver_name: vehicleData.driverName,
          vehicle_no: vehicleData.vehicleNo,
          date_time: vehicleData.dateTime,
          product_info: vehicleData.productInfo,
          quantity: vehicleData.quantity,
          plant: vehicleData.plant,
          advance: vehicleData.advance,
          status: vehicleData.status,
        });
        dispatch({ type: 'ADD_VEHICLE', payload: created }); // ✅ created includes `id`
      }

      onClose();
    } catch (error) {}
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
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
              <label
                htmlFor="transportName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Transport Name *
              </label>
              <input
                type="text"
                id="transportName"
                name="transportName"
                value={formData.transportName}
                onChange={handleChange}
                placeholder="e.g., Speedy Transport"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.transportName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.transportName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.transportName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="driverName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Driver Name *
              </label>
              <input
                type="text"
                id="driverName"
                name="driverName"
                value={formData.driverName}
                onChange={handleChange}
                placeholder="e.g., Ravi Patil"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.driverName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.driverName && (
                <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vehicleNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Vehicle Number *
                <span className="text-xs text-gray-500 block">
                  Format: MH12AB1234
                </span>
              </label>
              <input
                type="text"
                id="vehicleNo"
                name="vehicleNo"
                value={formatVehicleNumber(formData.vehicleNo)}
                onChange={handleChange}
                placeholder="e.g., MH 12 AB 1234"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                  errors.vehicleNo ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.vehicleNo && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicleNo}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="dateTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Date & Time *
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="advance"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Advance Amount (₹)
              </label>
              <input
                type="number"
                id="advance"
                name="advance"
                value={formData.advance}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.advance ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.advance && (
                <p className="mt-1 text-sm text-red-600">{errors.advance}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Idle">Idle</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Vehicle Number Format Guide:
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                • <strong>State Code:</strong> 2 letters (e.g., MH for
                Maharashtra)
              </p>
              <p>
                • <strong>District Code:</strong> 2 digits (e.g., 12 for Pune)
              </p>
              <p>
                • <strong>Series:</strong> 2 letters (e.g., AB)
              </p>
              <p>
                • <strong>Number:</strong> 4 digits (e.g., 1234)
              </p>
              <p className="text-blue-600 font-medium">
                Example: MH 12 AB 1234
              </p>
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
              {vehicle ? 'Update' : 'Add'} Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;
