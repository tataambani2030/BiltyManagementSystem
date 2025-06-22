import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Truck,
  User,
  Clock,
  MapPin,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Vehicle } from '../../types';
import {
  formatDateTime,
  formatCurrency,
  getStatusColor,
} from '../../utils/helpers';
import { formatVehicleNumber } from '../../utils/validation';

interface VehicleListProps {
  onAddVehicle: () => void;
  onEditVehicle: (vehicle: Vehicle) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({
  onAddVehicle,
  onEditVehicle,
}) => {
  const { state, dispatch } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredVehicles = state.vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.transportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.productInfo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === '' || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (
      window.confirm('Are you sure you want to delete this vehicle record?')
    ) {
      dispatch({ type: 'DELETE_VEHICLE', payload: id });
    }
  };

  const handleStatusChange = (vehicle: Vehicle, newStatus: string) => {
    dispatch({
      type: 'UPDATE_VEHICLE',
      payload: {
        ...vehicle,
        status: newStatus as 'Active' | 'Idle' | 'Maintenance',
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        );
      case 'Idle':
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
      case 'Maintenance':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          🍅 Tomato Vehicle Management
        </h1>
        <button
          onClick={onAddVehicle}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Idle">Idle</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver & Transport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tomato Load
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farm & Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advance
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <tr
                  key={vehicle.id ?? `${vehicle.vehicleNo}-${vehicle.dateTime}`}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {formatVehicleNumber(vehicle.vehicleNo)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDateTime(vehicle.dateTime)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {vehicle.driverName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicle.transportName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      🍅 {vehicle.productInfo}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.quantity}{' '}
                        {vehicle.productInfo?.includes('kg') ? 'kg' : 'carrate'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {vehicle.plant}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(vehicle.status)}
                      <select
                        value={vehicle.status}
                        onChange={(e) =>
                          handleStatusChange(vehicle, e.target.value)
                        }
                        className={`text-xs rounded-full px-2 py-1 border-0 ${getStatusColor(
                          vehicle.status
                        )} focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="Active">Active</option>
                        <option value="Idle">Idle</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {formatCurrency(vehicle.advance)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEditVehicle(vehicle)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Truck className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleList;
