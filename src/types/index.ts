export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Dispatcher' | 'Entry Operator' | 'Accountant';
  email: string;
}

export interface Seller {
  id: string;
  name: string;
  mobileNumber: string;
  address: string;
  shopName: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactNumber: string;
  address: string;
  productCategory: string;
  plantName: string;
  createdAt: string;
}

export interface ProductDetail {
  id?: string;
  biltyId?: string;
  productName: string;
  unitType: string;
  quantity: number;
  totalCratesBags: number;
  remarks: string;
}

export interface Bilty {
  id: string;
  biltyNumber: string;
  sellerId: string;
  vehicleNo: string;
  deliveryAddress: string;
  rent: number;
  advance: number;
  driverTips: number;
  totalCratesBags: number;
  productDetails: ProductDetail[];
  product: {
    name: string;
    quantity: number;
    color: string; // Used for unit (kg/carrate) - kept for compatibility
    plant: string; // Not used anymore but kept for compatibility
  };
  createdAt: string;
  status: 'Pending' | 'In Transit' | 'Delivered';
}

export interface Vehicle {
  id: string;
  transportName: string;
  driverName: string;
  vehicleNo: string;
  dateTime: string;
  productInfo: string;
  quantity: number;
  plant: string; // Not used anymore but kept for compatibility
  advance: number;
  status: 'Active' | 'Idle' | 'Maintenance';
  transportMobile?: string;
  driverMobile: string;
}

export interface Schedule {
  id: string;
  shift: 'Morning' | 'Evening';
  inTime: string;
  outTime: string;
  driverId: string;
  operatingDays: number;
  taxDeduction: number;
  finalPayment: number;
  date: string;
}

export interface BillingRecord {
  id: string;
  vehicleNo: string;
  date: string;
  amount: number;
  sellerId: string;
  advance: number;
  netAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface BillingRecordNew {
  id: string;
  biltyId: string;
  commission: number;
  driverPaid: number;
  netTotal: number;
  billingDate: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface BillingProductLine {
  id: string;
  billingId: string;
  productDetailId: string;
  soldPrice: number;
  totalAmount: number;
  createdAt: string;
}

export interface DashboardStats {
  totalBiltiesToday: number;
  totalVehiclesActive: number;
  totalAdvancePaid: number;
  supplierDispatchPercentage: { [key: string]: number };
  netOutstanding: number;
}