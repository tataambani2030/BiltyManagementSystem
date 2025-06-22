import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  Clock,
  Eye,
  DollarSign,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Bilty } from '../../types';
import {
  formatDate,
  formatCurrency,
  getStatusColor,
} from '../../utils/helpers';
import { formatVehicleNumber } from '../../utils/validation';
import BillingModal from './BillingModal';

interface BiltyListProps {
  onAddBilty: () => void;
  onEditBilty: (bilty: Bilty) => void;
}

const BiltyList: React.FC<BiltyListProps> = ({ onAddBilty, onEditBilty }) => {
  const { state, dispatch } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedBilty, setSelectedBilty] = useState<Bilty | null>(null);
  const [billingBilty, setBillingBilty] = useState<Bilty | null>(null);

  const filteredBilties = state.bilties.filter((bilty) => {
    const seller = state.sellers.find((s) => s.id === bilty.sellerId);
    const matchesSearch =
      bilty.biltyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bilty.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === '' || bilty.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bilty?')) {
      dispatch({ type: 'DELETE_BILTY', payload: id });
    }
  };

  const handleStatusChange = (bilty: Bilty, newStatus: string) => {
    dispatch({
      type: 'UPDATE_BILTY',
      payload: {
        ...bilty,
        status: newStatus as 'Pending' | 'In Transit' | 'Delivered',
      },
    });
  };

  const BiltyDetailsModal = ({
    bilty,
    onClose,
  }: {
    bilty: Bilty;
    onClose: () => void;
  }) => {
    const seller = state.sellers.find((s) => s.id === bilty.sellerId);
    const remaining = bilty.rent - bilty.advance;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Bilty Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bilty Number
                </label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {bilty.biltyNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-block px-3 py-1 text-sm rounded-full mt-1 ${getStatusColor(
                    bilty.status
                  )}`}
                >
                  {bilty.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Seller
                </label>
                <p className="mt-1 text-gray-900">{seller?.name}</p>
                <p className="text-sm text-gray-500">{seller?.shopName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Number
                </label>
                <p className="mt-1 text-gray-900 font-mono">
                  {formatVehicleNumber(bilty.vehicleNo)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Address
              </label>
              <p className="mt-1 text-gray-900">{bilty.deliveryAddress}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                💰 Financial Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rent
                  </label>
                  <p className="mt-1 text-lg font-semibold text-blue-600">
                    {formatCurrency(bilty.rent)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Advance
                  </label>
                  <p className="mt-1 text-lg font-semibold text-purple-600">
                    {formatCurrency(bilty.advance)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remaining
                  </label>
                  <p className="mt-1 text-lg font-semibold text-green-600">
                    {formatCurrency(remaining)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Driver Tips
                  </label>
                  <p className="mt-1 text-lg font-semibold text-orange-600">
                    {formatCurrency(bilty.driverTips)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                🍅 Product Details
              </h3>
              <div className="space-y-3">
                {bilty.productDetails.map((product, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 border border-orange-200"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Product
                        </label>
                        <p className="mt-1 text-gray-900">
                          🍅 {product.productName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <p className="mt-1 text-gray-900">
                          {product.quantity} {product.unitType}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Total Crates/Bags
                        </label>
                        <p className="mt-1 text-gray-900">
                          {product.totalCratesBags}
                        </p>
                      </div>
                      {product.remarks && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Remarks
                          </label>
                          <p className="mt-1 text-gray-900">
                            {product.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created Date
                </label>
                <p className="mt-1 text-gray-900">
                  {formatDate(bilty.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onClose();
                  onEditBilty(bilty);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Bilty
              </button>
              <button
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          🍅 Tomato Bilty Management
        </h1>
        <button
          onClick={onAddBilty}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Bilty</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bilties..."
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
              <option value="Pending">Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bilty Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tomato Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Financial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBilties.map((bilty) => {
                const seller = state.sellers.find(
                  (s) => s.id === bilty.sellerId
                );
                const remaining = bilty.rent - bilty.advance;
                return (
                  <tr
                    key={bilty.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bilty.biltyNumber}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(bilty.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {seller?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seller?.shopName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {formatVehicleNumber(bilty.vehicleNo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          🍅 {bilty.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {bilty.product.quantity} {bilty.product.color}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">
                          Rent: {formatCurrency(bilty.rent)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Advance: {formatCurrency(bilty.advance)}
                        </div>
                        <div className="text-xs font-medium text-green-600">
                          Remaining: {formatCurrency(remaining)}
                        </div>
                        {bilty.driverTips > 0 && (
                          <div className="text-xs text-orange-600">
                            Tips: {formatCurrency(bilty.driverTips)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={bilty.status}
                        onChange={(e) =>
                          handleStatusChange(bilty, e.target.value)
                        }
                        className={`text-xs rounded-full px-2 py-1 border-0 ${getStatusColor(
                          bilty.status
                        )} focus:ring-2 focus:ring-blue-500`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedBilty(bilty)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditBilty(bilty)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setBillingBilty(bilty)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Billing"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(bilty.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredBilties.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No bilties found</p>
          </div>
        )}
      </div>

      {selectedBilty && (
        <BiltyDetailsModal
          bilty={selectedBilty}
          onClose={() => setSelectedBilty(null)}
        />
      )}

      {billingBilty && (
        <BillingModal
          bilty={billingBilty}
          onClose={() => setBillingBilty(null)}
        />
      )}
    </div>
  );
};

export default BiltyList;
