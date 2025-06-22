import { Seller, Supplier, Bilty, Vehicle, Schedule, BillingRecord, User } from '../types';
import { generateId, generateBiltyNumber } from '../utils/helpers';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    role: 'Admin',
    email: 'admin@bilty.com',
  },
  {
    id: '2',
    name: 'Dispatch Manager',
    role: 'Dispatcher',
    email: 'dispatcher@bilty.com',
  },
];

export const mockSellers: Seller[] = [
  {
    id: generateId(),
    name: 'Rajesh Kumar',
    mobileNumber: '+91 9876543210',
    address: '123 Market Street, Mumbai, MH 400001',
    shopName: 'Kumar Trading Co.',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Priya Sharma',
    mobileNumber: '+91 9876543211',
    address: '456 Business Park, Pune, MH 411001',
    shopName: 'Sharma Enterprises',
    createdAt: new Date().toISOString(),
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: generateId(),
    name: 'Green Valley Farms',
    contactNumber: '+91 9876543212',
    address: 'Rural Area, Nashik, MH 422001',
    productCategory: 'Tomato',
    plantName: 'Green Valley Farm - Nashik',
    createdAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Fresh Harvest Co.',
    contactNumber: '+91 9876543213',
    address: 'Agricultural Zone, Pune, MH 411001',
    productCategory: 'Tomato',
    plantName: 'Fresh Harvest Farm - Pune',
    createdAt: new Date().toISOString(),
  },
];

export const mockBilties: Bilty[] = [
  {
    id: generateId(),
    biltyNumber: generateBiltyNumber(),
    sellerId: mockSellers[0].id,
    vehicleNo: 'MH12AB1234',
    deliveryAddress: 'APMC Market, Vashi, Navi Mumbai',
    rent: 12000,
    advance: 5000,
    driverTips: 500,
    product: {
      name: 'Tomato',
      quantity: 500,
      color: 'kg', // Using color field for unit
      plant: 'Green Valley Farm - Nashik',
    },
    createdAt: new Date().toISOString(),
    status: 'In Transit',
  },
];

export const mockVehicles: Vehicle[] = [
  {
    id: generateId(),
    transportName: 'Speedy Transport',
    driverName: 'Ravi Patil',
    vehicleNo: 'MH12AB1234',
    dateTime: new Date().toISOString(),
    productInfo: 'Tomato - 500 kg',
    quantity: 500,
    plant: 'Green Valley Farm - Nashik',
    advance: 5000,
    status: 'Active',
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: generateId(),
    shift: 'Morning',
    inTime: '06:00',
    outTime: '14:00',
    driverId: 'driver1',
    operatingDays: 26,
    taxDeduction: 500,
    finalPayment: 12000,
    date: new Date().toISOString(),
  },
];

export const mockBillingRecords: BillingRecord[] = [
  {
    id: generateId(),
    vehicleNo: 'MH12AB1234',
    date: new Date().toISOString(),
    amount: 12000,
    sellerId: mockSellers[0].id,
    advance: 5000,
    netAmount: 7000,
    status: 'Pending',
  },
];