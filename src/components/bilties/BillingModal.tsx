import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator, FileText, Calendar } from 'lucide-react';
import { Bilty, ProductDetail } from '../../types';
import { useData } from '../../contexts/DataContext';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { formatVehicleNumber } from '../../utils/validation';
import { billingRecordsNewService, billingProductLinesService } from '../../services/database';

interface BillingModalProps {
  bilty: Bilty;
  onClose: () => void;
}

interface ProductBilling {
  productDetailId: string;
  productName: string;
  quantity: number;
  unitType: string;
  totalCratesBags: number;
  soldPrice: number;
  totalAmount: number;
}

const BillingModal: React.FC<BillingModalProps> = ({ bilty, onClose }) => {
  const { state } = useData();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    commission: 0,
    driverPaid: 0,
    billingDate: new Date().toISOString().split('T')[0],
    remark: '',
  });

  const [productBilling, setProductBilling] = useState<ProductBilling[]>([]);

  // Initialize product billing data
  useEffect(() => {
    const initialProductBilling = bilty.productDetails.map(pd => ({
      productDetailId: pd.id || '',
      productName: pd.productName,
      quantity: pd.quantity,
      unitType: pd.unitType,
      totalCratesBags: pd.totalCratesBags,
      soldPrice: 0,
      totalAmount: 0,
    }));
    setProductBilling(initialProductBilling);
  }, [bilty.productDetails]);

  const seller = state.sellers.find(s => s.id === bilty.sellerId);
  const vehicle = state.vehicles.find(v => v.vehicleNo === bilty.vehicleNo);

  const handleProductPriceChange = (index: number, soldPrice: number) => {
    setProductBilling(prev => prev.map((item, i) => {
      if (i === index) {
        const totalAmount = soldPrice * item.totalCratesBags;
        return { ...item, soldPrice, totalAmount };
      }
      return item;
    }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'commission' || name === 'driverPaid' ? Number(value) : value,
    }));
  };

  const calculateTotals = () => {
    const grossTotal = productBilling.reduce((sum, item) => sum + item.totalAmount, 0);
    const netTotal = grossTotal - formData.commission - formData.driverPaid;
    return { grossTotal, netTotal };
  };

  const { grossTotal, netTotal } = calculateTotals();

  const showToastMessage = (type: 'success' | 'error', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (productBilling.some(item => item.soldPrice <= 0)) {
      showToastMessage('error', 'Please enter sold price for all products');
      return;
    }

    if (formData.commission < 0 || formData.driverPaid < 0) {
      showToastMessage('error', 'Commission and driver payment cannot be negative');
      return;
    }

    setLoading(true);

    try {
      // Create billing record
      const billingRecord = await billingRecordsNewService.create({
        bilty_id: bilty.id,
        commission: formData.commission,
        driver_paid: formData.driverPaid,
        net_total: netTotal,
        billing_date: formData.billingDate,
        remark: formData.remark,
      });

      // Create product lines
      const productLines = productBilling.map(item => ({
        billing_id: billingRecord.id,
        product_detail_id: item.productDetailId,
        sold_price: item.soldPrice,
        total_amount: item.totalAmount,
      }));

      await billingProductLinesService.create(productLines);

      showToastMessage('success', 'Billing record created successfully!');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating billing record:', error);
      showToastMessage('error', 'Failed to create billing record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Toast Notification */}
        {showToast && (
          <div className={`fixed top-4 right-4 z-60 px-4 py-2 rounded-lg text-white ${
            showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {showToast.message}
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Create Billing Record
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bilty Information (Read-only) */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Bilty Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bilty Number</label>
                <p className="mt-1 text-sm font-semibold text-gray-900">{bilty.biltyNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(bilty.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-sm text-gray-900">{bilty.status}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Seller</label>
                <p className="mt-1 text-sm text-gray-900">{seller?.name}</p>
                <p className="text-xs text-gray-500">{seller?.shopName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver</label>
                <p className="mt-1 text-sm text-gray-900">{vehicle?.driverName}</p>
                <p className="text-xs text-gray-500">{vehicle?.driverMobile}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{formatVehicleNumber(bilty.vehicleNo)}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rent</label>
                <p className="mt-1 text-sm font-semibold text-blue-600">{formatCurrency(bilty.rent)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Advance</label>
                <p className="mt-1 text-sm font-semibold text-purple-600">{formatCurrency(bilty.advance)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Driver Tips</label>
                <p className="mt-1 text-sm font-semibold text-orange-600">{formatCurrency(bilty.driverTips)}</p>
              </div>
            </div>
          </div>

          {/* Product Billing Section */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              🍅 Product Billing Details
            </h3>
            
            <div className="space-y-4">
              {productBilling.map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <p className="mt-1 text-sm text-gray-900">{item.productName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <p className="mt-1 text-sm text-gray-900">{item.quantity} {item.unitType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Crates/Bags</label>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{item.totalCratesBags}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Sold Price (₹/crate) *
                      </label>
                      <input
                        type="number"
                        value={item.soldPrice}
                        onChange={(e) => handleProductPriceChange(index, Number(e.target.value))}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                      <p className="mt-1 text-sm font-bold text-green-600">
                        {formatCurrency(item.totalAmount)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Calculator className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Calculations */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              💰 Billing Calculations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="commission" className="block text-sm font-medium text-gray-700 mb-1">
                  Commission (₹)
                </label>
                <input
                  type="number"
                  id="commission"
                  name="commission"
                  value={formData.commission}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="driverPaid" className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Remaining Balance Paid (₹)
                </label>
                <input
                  type="number"
                  id="driverPaid"
                  name="driverPaid"
                  value={formData.driverPaid}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg p-4 border border-green-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gross Total</label>
                  <p className="mt-1 text-lg font-bold text-blue-600">{formatCurrency(grossTotal)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deductions</label>
                  <p className="mt-1 text-lg font-bold text-red-600">
                    -{formatCurrency(formData.commission + formData.driverPaid)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Net Total</label>
                  <p className="mt-1 text-xl font-bold text-green-600">{formatCurrency(netTotal)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="billingDate" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Billing Date *
              </label>
              <input
                type="date"
                id="billingDate"
                name="billingDate"
                value={formData.billingDate}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">
                Remarks
              </label>
              <textarea
                id="remark"
                name="remark"
                value={formData.remark}
                onChange={handleFormChange}
                rows={3}
                placeholder="Optional remarks..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Create Billing Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingModal;