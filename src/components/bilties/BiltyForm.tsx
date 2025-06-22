import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Bilty, ProductDetail } from '../../types';
import {
  validateVehicleNumber,
  formatVehicleNumber,
  normalizeVehicleNumber,
  normalizeMobileNumber,
  validateMobileNumber,
} from '../../utils/validation';
import { calculateTotalCratesBags } from '../../services/database';

interface BiltyFormProps {
  bilty?: Bilty;
  onClose: () => void;
}

const BiltyForm: React.FC<BiltyFormProps> = ({ bilty, onClose }) => {
  const { state, createBilty, updateBilty, updateVehicle, createVehicle } = useData();
  const [sellerSearchOpen, setSellerSearchOpen] = useState(false);
  const [sellerSearchTerm, setSellerSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    sellerId: bilty?.sellerId || '',
    deliveryAddress: bilty?.deliveryAddress || '',
    rent: bilty?.rent || '',
    advance: bilty?.advance || '',
    driverTips: bilty?.driverTips || '',
    status: bilty?.status || 'Pending',
    totalCratesBags: bilty?.totalCratesBags || 0,
  });

  const [transportData, setTransportData] = useState({
    transportName: '',
    driverName: '',
    vehicleNo: bilty?.vehicleNo || '',
    driverMobile: '',
    transportMobile: '',
  });

  const [productDetails, setProductDetails] = useState<ProductDetail[]>(
    bilty?.productDetails?.length
      ? bilty.productDetails
      : [
          {
            productName: 'Tomato',
            unitType: 'kg',
            quantity: 0,
            totalCratesBags: 0,
            remarks: '',
          },
        ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Effect to populate form when a bilty is provided for editing
  useEffect(() => {
    if (bilty) {
      // Populate formData from bilty object
      setFormData({
        sellerId: bilty.sellerId,
        deliveryAddress: bilty.deliveryAddress,
        rent: bilty.rent,
        advance: bilty.advance,
        driverTips: bilty.driverTips,
        status: bilty.status,
        totalCratesBags: bilty.totalCratesBags || 0,
      });

      // Find the corresponding vehicle and populate transportData
      const vehicle = state.vehicles.find(
        (v) =>
          normalizeVehicleNumber(v.vehicleNo) ===
          normalizeVehicleNumber(bilty.vehicleNo)
      );
      if (vehicle) {
        setTransportData({
          transportName: vehicle.transportName,
          driverName: vehicle.driverName,
          vehicleNo: vehicle.vehicleNo,
          driverMobile: vehicle.driverMobile,
          transportMobile: vehicle.transportMobile || '',
        });
      } else {
        // If vehicle not found, initialize with empty data but keep vehicleNo
        setTransportData({
          transportName: '',
          driverName: '',
          vehicleNo: bilty.vehicleNo,
          driverMobile: '',
          transportMobile: '',
        });
      }

      // Populate productDetails from bilty object
      setProductDetails(
        bilty.productDetails?.length ? bilty.productDetails : []
      );
    } else {
      // Reset form for adding new bilty
      setFormData({
        sellerId: '',
        deliveryAddress: '',
        rent: '',
        advance: '',
        driverTips: '',
        status: 'Pending',
        totalCratesBags: 0,
      });
      setTransportData({
        transportName: '',
        driverName: '',
        vehicleNo: '',
        driverMobile: '',
        transportMobile: '',
      });
      setProductDetails([
        {
          productName: 'Tomato',
          unitType: 'kg',
          quantity: 0,
          totalCratesBags: 0,
          remarks: '',
        },
      ]);
    }
  }, [bilty, state.vehicles]);

  // Auto-bind seller address to delivery address
  useEffect(() => {
    if (formData.sellerId && !bilty) {
      const selectedSeller = state.sellers.find(
        (s) => s.id === formData.sellerId
      );
      if (selectedSeller) {
        setFormData((prev) => ({
          ...prev,
          deliveryAddress: selectedSeller.address,
        }));
      }
    }
  }, [formData.sellerId, state.sellers, bilty]);

  // Real-time validation for transport fields
  useEffect(() => {
    const newErrors: Record<string, string> = {};

    if (transportData.vehicleNo) {
      const vehicleValidation = validateVehicleNumber(transportData.vehicleNo);
      if (!vehicleValidation.isValid) {
        newErrors.vehicleNo =
          vehicleValidation.error || 'Invalid vehicle number';
      }
    }

    if (transportData.driverMobile) {
      const driverMobileValidation = validateMobileNumber(
        transportData.driverMobile
      );
      if (!driverMobileValidation.isValid) {
        newErrors.driverMobile =
          driverMobileValidation.error || 'Invalid mobile number';
      }
    }

    if (transportData.transportMobile) {
      const transportMobileValidation = validateMobileNumber(
        transportData.transportMobile
      );
      if (!transportMobileValidation.isValid) {
        newErrors.transportMobile =
          transportMobileValidation.error || 'Invalid mobile number';
      }
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  }, [
    transportData.vehicleNo,
    transportData.driverMobile,
    transportData.transportMobile,
  ]);

  // Calculate total crates/bags when product details change
  useEffect(() => {
    const totalCrates = productDetails.reduce((sum, product) => {
      const quantity = Number(product.quantity);
      return sum + calculateTotalCratesBags(quantity, product.unitType);
    }, 0);

    setFormData((prev) => ({
      ...prev,
      totalCratesBags: totalCrates,
    }));
  }, [productDetails]);

  // Filter sellers based on search term
  const filteredSellers = state.sellers.filter(
    (seller) =>
      seller.name.toLowerCase().includes(sellerSearchTerm.toLowerCase()) ||
      seller.shopName.toLowerCase().includes(sellerSearchTerm.toLowerCase())
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === 'rent' || name === 'advance' || name === 'driverTips') {
      const numericValue = value === '' ? '' : Number(value);

      if (!isNaN(Number(numericValue))) {
        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleTransportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'vehicleNo') {
      const normalizedValue = normalizeVehicleNumber(value);
      setTransportData((prev) => ({
        ...prev,
        [name]: normalizedValue,
      }));
    } else if (name === 'driverMobile' || name === 'transportMobile') {
      const numericValue = value.replace(/\D/g, '');
      const limitedValue = numericValue.slice(0, 10);
      setTransportData((prev) => ({
        ...prev,
        [name]: limitedValue,
      }));
    } else {
      setTransportData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleProductChange = (
    index: number,
    field: keyof ProductDetail,
    value: string | number
  ) => {
    setProductDetails((prev) =>
      prev.map((product, i) => {
        if (i === index) {
          const updatedProduct = { ...product, [field]: value };

          if (field === 'quantity' || field === 'unitType') {
            const quantity =
              field === 'quantity'
                ? Number(value)
                : Number(updatedProduct.quantity);
            const unitType =
              field === 'unitType' ? String(value) : updatedProduct.unitType;
            if (!isNaN(quantity)) {
              updatedProduct.totalCratesBags = calculateTotalCratesBags(
                quantity,
                unitType
              );
            }
          }

          return updatedProduct;
        }
        return product;
      })
    );
  };

  const addProductLine = () => {
    setProductDetails((prev) => [
      ...prev,
      {
        productName: 'Tomato',
        unitType: 'kg',
        quantity: 0,
        totalCratesBags: 0,
        remarks: '',
      },
    ]);
  };

  const removeProductLine = (index: number) => {
    if (productDetails.length > 1) {
      setProductDetails((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSellerSelect = (seller: any) => {
    setFormData((prev) => ({ ...prev, sellerId: seller.id }));
    setSellerSearchOpen(false);
    setSellerSearchTerm('');
  };

  const calculateRemaining = () => {
    const rent = typeof formData.rent === 'number' ? formData.rent : 0;
    const advance = typeof formData.advance === 'number' ? formData.advance : 0;
    return Math.max(0, rent - advance);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Seller validation
    if (!formData.sellerId) newErrors.sellerId = 'Please select a seller';

    // Transport validation
    if (!transportData.transportName.trim())
      newErrors.transportName = 'Transport name is required';
    if (!transportData.driverName.trim())
      newErrors.driverName = 'Driver name is required';
    if (!transportData.driverMobile.trim())
      newErrors.driverMobile = 'Driver mobile is required';

    // Vehicle number validation
    const vehicleValidation = validateVehicleNumber(transportData.vehicleNo);
    if (!vehicleValidation.isValid) {
      newErrors.vehicleNo = vehicleValidation.error || 'Invalid vehicle number';
    }

    // Mobile validation
    if (transportData.driverMobile) {
      const driverMobileValidation = validateMobileNumber(
        transportData.driverMobile
      );
      if (!driverMobileValidation.isValid) {
        newErrors.driverMobile =
          driverMobileValidation.error || 'Invalid mobile number';
      }
    }

    if (transportData.transportMobile) {
      const transportMobileValidation = validateMobileNumber(
        transportData.transportMobile
      );
      if (!transportMobileValidation.isValid) {
        newErrors.transportMobile =
          transportMobileValidation.error || 'Invalid mobile number';
      }
    }

    if (!formData.deliveryAddress.trim())
      newErrors.deliveryAddress = 'Delivery address is required';

    // Financial validation
    const rent = typeof formData.rent === 'number' ? formData.rent : 0;
    const advance = typeof formData.advance === 'number' ? formData.advance : 0;
    const driverTips =
      typeof formData.driverTips === 'number' ? formData.driverTips : 0;

    if (rent <= 0) newErrors.rent = 'Rent must be greater than 0';
    if (advance < 0) newErrors.advance = 'Advance cannot be negative';
    if (advance > rent)
      newErrors.advance = 'Advance cannot be greater than rent';
    if (driverTips < 0) newErrors.driverTips = 'Driver tips cannot be negative';

    // Product validation
    productDetails.forEach((product, index) => {
      if (!product.productName.trim())
        newErrors[`product_${index}_name`] = 'Product name is required';
      if (!product.unitType.trim())
        newErrors[`product_${index}_unitType`] = 'Unit type is required';
      if (product.quantity <= 0)
        newErrors[`product_${index}_quantity`] =
          'Quantity must be greater than 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const rent = typeof formData.rent === 'number' ? formData.rent : 0;
      const advance =
        typeof formData.advance === 'number' ? formData.advance : 0;
      const driverTips =
        typeof formData.driverTips === 'number' ? formData.driverTips : 0;

      const biltyData = {
        sellerId: formData.sellerId,
        vehicleNo: normalizeVehicleNumber(transportData.vehicleNo),
        deliveryAddress: formData.deliveryAddress,
        rent: rent,
        advance: advance,
        driverTips: driverTips,
        status: formData.status as 'Pending' | 'In Transit' | 'Delivered',
        totalCratesBags: formData.totalCratesBags,
      };

      // Handle vehicle creation/update
      const normalizedVehicleNo = normalizeVehicleNumber(transportData.vehicleNo);
      const existingVehicle = state.vehicles.find(
        (v) => normalizeVehicleNumber(v.vehicleNo) === normalizedVehicleNo
      );

      const vehicleData = {
        transportName: transportData.transportName,
        driverName: transportData.driverName,
        vehicleNo: normalizedVehicleNo,
        driverMobile: normalizeMobileNumber(transportData.driverMobile),
        transportMobile: transportData.transportMobile
          ? normalizeMobileNumber(transportData.transportMobile)
          : '',
        dateTime: new Date().toISOString(),
        productInfo: 'Tomato Transport',
        quantity: productDetails.reduce((sum, pd) => sum + pd.quantity, 0),
        plant: '',
        advance: advance,
        status: 'Active' as const,
      };

      if (existingVehicle) {
        // Update existing vehicle
        await updateVehicle(existingVehicle.id, vehicleData);
      } else {
        // Create new vehicle
        await createVehicle(vehicleData);
      }

      if (bilty) {
        // Update existing bilty
        await updateBilty(bilty.id, biltyData, productDetails);
      } else {
        // Create new bilty
        await createBilty(biltyData, productDetails);
      }

      onClose();
    } catch (error) {
      console.error('Error saving bilty:', error);
      alert('Failed to save bilty. Please try again.');
    }
  };

  const unitTypes = ['kg', 'bag', 'crate', 'carrate', 'tons', 'quintal'];
  const selectedSeller = state.sellers.find((s) => s.id === formData.sellerId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {bilty ? 'Edit Bilty' : 'Create New Bilty'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Seller Selection */}
          <div className="relative">
            <label
              htmlFor="sellerId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Seller *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSellerSearchOpen(!sellerSearchOpen)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between ${
                  errors.sellerId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <span
                  className={selectedSeller ? 'text-gray-900' : 'text-gray-500'}
                >
                  {selectedSeller
                    ? `${selectedSeller.name} - ${selectedSeller.shopName}`
                    : 'Select Seller'}
                </span>
              </button>

              {sellerSearchOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="p-2 border-b">
                    <input
                      type="text"
                      placeholder="Search sellers..."
                      value={sellerSearchTerm}
                      onChange={(e) => setSellerSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSellers.map((seller) => (
                      <button
                        key={seller.id}
                        type="button"
                        onClick={() => handleSellerSelect(seller)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">
                          {seller.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seller.shopName}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.sellerId && (
              <p className="mt-1 text-sm text-red-600">{errors.sellerId}</p>
            )}
          </div>

          {/* Transport Information */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-4 border border-blue-200">
            <h3 className="text-lg font-medium text-gray-900">
              🚛 Transport Information
            </h3>

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
                  value={transportData.transportName}
                  onChange={handleTransportChange}
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
                  value={transportData.driverName}
                  onChange={handleTransportChange}
                  placeholder="e.g., Ravi Patil"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.driverName ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.driverName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.driverName}
                  </p>
                )}
              </div>

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
                  value={formatVehicleNumber(transportData.vehicleNo)}
                  onChange={handleTransportChange}
                  placeholder="e.g., MH 12 AB 1234"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono ${
                    errors.vehicleNo ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.vehicleNo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vehicleNo}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="driverMobile"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Driver Mobile No *
                </label>
                <input
                  type="tel"
                  id="driverMobile"
                  name="driverMobile"
                  value={transportData.driverMobile}
                  onChange={handleTransportChange}
                  placeholder="e.g., 9876543210"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.driverMobile ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.driverMobile && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.driverMobile}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="transportMobile"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Transport Mobile No (Optional)
                </label>
                <input
                  type="tel"
                  id="transportMobile"
                  name="transportMobile"
                  value={transportData.transportMobile}
                  onChange={handleTransportChange}
                  placeholder="e.g., 9876543210"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.transportMobile
                      ? 'border-red-300'
                      : 'border-gray-300'
                  }`}
                />
                {errors.transportMobile && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.transportMobile}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label
              htmlFor="deliveryAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Delivery Address *
              <span className="text-xs text-gray-500 ml-2">
                (Auto-filled from seller address)
              </span>
            </label>
            <textarea
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              rows={3}
              placeholder="Enter complete delivery address"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.deliveryAddress ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.deliveryAddress && (
              <p className="mt-1 text-sm text-red-600">
                {errors.deliveryAddress}
              </p>
            )}
          </div>

          {/* Product Details Section */}
          <div className="bg-orange-50 rounded-lg p-4 space-y-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                📦 Product Details
              </h3>
              <button
                type="button"
                onClick={addProductLine}
                className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 flex items-center space-x-1 text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-3">
              {productDetails.map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-3 border border-orange-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={product.productName}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            'productName',
                            e.target.value
                          )
                        }
                        placeholder="e.g., Tomato"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors[`product_${index}_name`]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      />
                      {errors[`product_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`product_${index}_name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Type *
                      </label>
                      <select
                        value={product.unitType}
                        onChange={(e) =>
                          handleProductChange(index, 'unitType', e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors[`product_${index}_unitType`]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Unit</option>
                        {unitTypes.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                      {errors[`product_${index}_unitType`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`product_${index}_unitType`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(
                            index,
                            'quantity',
                            Number(e.target.value)
                          )
                        }
                        min="0"
                        step="0.1"
                        placeholder="0"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                          errors[`product_${index}_quantity`]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      />
                      {errors[`product_${index}_quantity`] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors[`product_${index}_quantity`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Crates/Bags
                      </label>
                      <input
                        type="number"
                        value={product.totalCratesBags}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-calculated
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Remarks
                      </label>
                      <input
                        type="text"
                        value={product.remarks}
                        onChange={(e) =>
                          handleProductChange(index, 'remarks', e.target.value)
                        }
                        placeholder="Optional remarks"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-end">
                      {productDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProductLine(index)}
                          className="w-full bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="bg-green-50 rounded-lg p-4 space-y-4 border border-green-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              💰 Financial Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label
                  htmlFor="rent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rent (₹) *
                </label>
                <input
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="Enter rent amount"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.rent ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.rent && (
                  <p className="mt-1 text-sm text-red-600">{errors.rent}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="advance"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Advance (₹)
                </label>
                <input
                  type="number"
                  id="advance"
                  name="advance"
                  value={formData.advance}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="Enter advance amount"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.advance ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.advance && (
                  <p className="mt-1 text-sm text-red-600">{errors.advance}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remaining (₹)
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium">
                  ₹{calculateRemaining().toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
              </div>

              <div>
                <label
                  htmlFor="driverTips"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Driver Tips (₹)
                </label>
                <input
                  type="number"
                  id="driverTips"
                  name="driverTips"
                  value={formData.driverTips}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="Enter tips amount"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.driverTips ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.driverTips && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.driverTips}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Crates/Bags
                </label>
                <div className="w-full px-3 py-2 bg-orange-50 border border-orange-300 rounded-lg text-orange-700 font-medium">
                  {formData.totalCratesBags}
                </div>
                <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
              </div>
            </div>
          </div>

          {bilty && (
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
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          )}

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
              {bilty ? 'Update' : 'Create'} Bilty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BiltyForm;