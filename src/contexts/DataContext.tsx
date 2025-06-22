import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react';
import {
  Seller,
  Supplier,
  Bilty,
  Vehicle,
  Schedule,
  BillingRecord,
  DashboardStats,
  ProductDetail,
} from '../types';
import {
  sellersService,
  suppliersService,
  biltiesService,
  vehiclesService,
  schedulesService,
  billingRecordsService,
  productDetailsService,
  generateBiltyNumber,
} from '../services/database';

interface DataState {
  sellers: Seller[];
  suppliers: Supplier[];
  bilties: Bilty[];
  vehicles: Vehicle[];
  schedules: Schedule[];
  billingRecords: BillingRecord[];
  loading: boolean;
  error: string | null;
}

type DataAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELLERS'; payload: Seller[] }
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'SET_BILTIES'; payload: Bilty[] }
  | { type: 'SET_VEHICLES'; payload: Vehicle[] }
  | { type: 'SET_SCHEDULES'; payload: Schedule[] }
  | { type: 'SET_BILLING_RECORDS'; payload: BillingRecord[] }
  | { type: 'ADD_SELLER'; payload: Seller }
  | { type: 'UPDATE_SELLER'; payload: Seller }
  | { type: 'DELETE_SELLER'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ADD_BILTY'; payload: Bilty }
  | { type: 'UPDATE_BILTY'; payload: Bilty }
  | { type: 'DELETE_BILTY'; payload: string }
  | { type: 'ADD_VEHICLE'; payload: Vehicle }
  | { type: 'UPDATE_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'DELETE_SCHEDULE'; payload: string }
  | { type: 'ADD_BILLING_RECORD'; payload: BillingRecord }
  | { type: 'UPDATE_BILLING_RECORD'; payload: BillingRecord }
  | { type: 'DELETE_BILLING_RECORD'; payload: string };

const initialState: DataState = {
  sellers: [],
  suppliers: [],
  bilties: [],
  vehicles: [],
  schedules: [],
  billingRecords: [],
  loading: false,
  error: null,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SELLERS':
      return { ...state, sellers: action.payload };
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    case 'SET_BILTIES':
      return { ...state, bilties: action.payload };
    case 'SET_VEHICLES':
      const uniqueVehicles = Array.from(
        new Map(action.payload.map((v) => [v.id, v])).values()
      );
      return { ...state, vehicles: uniqueVehicles };
    case 'SET_SCHEDULES':
      return { ...state, schedules: action.payload };
    case 'SET_BILLING_RECORDS':
      return { ...state, billingRecords: action.payload };
    case 'ADD_SELLER':
      return { ...state, sellers: [action.payload, ...state.sellers] };
    case 'UPDATE_SELLER':
      return {
        ...state,
        sellers: state.sellers.map((seller) =>
          seller.id === action.payload.id ? action.payload : seller
        ),
      };
    case 'DELETE_SELLER':
      return {
        ...state,
        sellers: state.sellers.filter((seller) => seller.id !== action.payload),
      };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [action.payload, ...state.suppliers] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map((supplier) =>
          supplier.id === action.payload.id ? action.payload : supplier
        ),
      };
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(
          (supplier) => supplier.id !== action.payload
        ),
      };
    case 'ADD_BILTY':
      return { ...state, bilties: [action.payload, ...state.bilties] };
    case 'UPDATE_BILTY':
      return {
        ...state,
        bilties: state.bilties.map((bilty) =>
          bilty.id === action.payload.id ? action.payload : bilty
        ),
      };
    case 'DELETE_BILTY':
      return {
        ...state,
        bilties: state.bilties.filter((bilty) => bilty.id !== action.payload),
      };
    case 'ADD_VEHICLE':
      return { ...state, vehicles: [action.payload, ...state.vehicles] };
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === action.payload.id ? action.payload : vehicle
        ),
      };
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(
          (vehicle) => vehicle.id !== action.payload
        ),
      };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [action.payload, ...state.schedules] };
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map((schedule) =>
          schedule.id === action.payload.id ? action.payload : schedule
        ),
      };
    case 'DELETE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.filter(
          (schedule) => schedule.id !== action.payload
        ),
      };
    case 'ADD_BILLING_RECORD':
      return {
        ...state,
        billingRecords: [action.payload, ...state.billingRecords],
      };
    case 'UPDATE_BILLING_RECORD':
      return {
        ...state,
        billingRecords: state.billingRecords.map((record) =>
          record.id === action.payload.id ? action.payload : record
        ),
      };
    case 'DELETE_BILLING_RECORD':
      return {
        ...state,
        billingRecords: state.billingRecords.filter(
          (record) => record.id !== action.payload
        ),
      };
    default:
      return state;
  }
}

interface DataContextType {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
  getDashboardStats: () => DashboardStats;
  // CRUD operations
  loadAllData: () => Promise<void>;
  createSeller: (seller: Omit<Seller, 'id' | 'createdAt'>) => Promise<void>;
  updateSeller: (id: string, seller: Partial<Seller>) => Promise<void>;
  deleteSeller: (id: string) => Promise<void>;
  createSupplier: (
    supplier: Omit<Supplier, 'id' | 'createdAt'>
  ) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  createBilty: (
    bilty: Omit<Bilty, 'id' | 'biltyNumber' | 'createdAt' | 'productDetails' | 'product'>,
    productDetails: ProductDetail[]
  ) => Promise<void>;
  updateBilty: (
    id: string,
    bilty: Partial<Bilty>,
    productDetails?: ProductDetail[]
  ) => Promise<void>;
  deleteBilty: (id: string) => Promise<void>;
  createVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  createSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>;
  updateSchedule: (id: string, schedule: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  createBillingRecord: (record: Omit<BillingRecord, 'id'>) => Promise<void>;
  updateBillingRecord: (
    id: string,
    record: Partial<BillingRecord>
  ) => Promise<void>;
  deleteBillingRecord: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load all data from database
  const loadAllData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const [sellers, suppliers, bilties, vehicles, schedules, billingRecords] =
        await Promise.all([
          sellersService.getAll(),
          suppliersService.getAll(),
          biltiesService.getAll(),
          vehiclesService.getAll(),
          schedulesService.getAll(),
          billingRecordsService.getAll(),
        ]);

      // Transform bilties data to include product details
      const transformedBilties = await Promise.all(
        bilties.map(async (bilty) => {
          const productDetails = await productDetailsService.getByBiltyId(bilty.id);
          
          return {
            ...bilty,
            sellerId: bilty.seller_id,
            vehicleNo: bilty.vehicle_no,
            deliveryAddress: bilty.delivery_address,
            driverTips: bilty.driver_tips,
            biltyNumber: bilty.bilty_number,
            totalCratesBags: bilty.total_crates_bags || 0,
            createdAt: bilty.created_at || new Date().toISOString(),
            productDetails: productDetails.map(pd => ({
              id: pd.id,
              biltyId: pd.bilty_id,
              productName: pd.product_name,
              unitType: pd.unit_type,
              quantity: pd.quantity,
              totalCratesBags: pd.total_crates_bags,
              remarks: pd.remarks || '',
            })),
            product: {
              name: productDetails[0]?.product_name || 'Tomato',
              quantity: productDetails.reduce((sum, pd) => sum + pd.quantity, 0),
              color: productDetails[0]?.unit_type || 'kg',
              plant: '',
            },
          };
        })
      );

      // Transform other data
      const transformedSellers = sellers.map((s) => ({
        ...s,
        mobileNumber: s.mobile_number,
        shopName: s.shop_name,
        createdAt: s.created_at || new Date().toISOString(),
      }));

      const transformedSuppliers = suppliers.map((s) => ({
        ...s,
        contactNumber: s.contact_number,
        productCategory: s.product_category,
        plantName: s.plant_name,
        createdAt: s.created_at || new Date().toISOString(),
      }));

      const transformedVehicles = vehicles.map((v) => ({
        ...v,
        transportName: v.transport_name,
        driverName: v.driver_name,
        vehicleNo: v.vehicle_no,
        dateTime: v.date_time,
        productInfo: v.product_info,
        quantity: v.quantity || 0,
        plant: v.plant || '',
        advance: v.advance || 0,
        transportMobile: v.transport_mobile || '',
        driverMobile: v.driver_mobile,
      }));

      const transformedSchedules = schedules.map((s) => ({
        ...s,
        inTime: s.in_time,
        outTime: s.out_time,
        driverId: s.driver_id,
        operatingDays: s.operating_days,
        taxDeduction: s.tax_deduction,
        finalPayment: s.final_payment,
      }));

      const transformedBillingRecords = billingRecords.map((r) => ({
        ...r,
        vehicleNo: r.vehicle_no,
        sellerId: r.seller_id,
        netAmount: r.net_amount,
      }));

      dispatch({ type: 'SET_SELLERS', payload: transformedSellers });
      dispatch({ type: 'SET_SUPPLIERS', payload: transformedSuppliers });
      dispatch({ type: 'SET_BILTIES', payload: transformedBilties });
      dispatch({ type: 'SET_VEHICLES', payload: transformedVehicles });
      dispatch({ type: 'SET_SCHEDULES', payload: transformedSchedules });
      dispatch({
        type: 'SET_BILLING_RECORDS',
        payload: transformedBillingRecords,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // CRUD operations
  const createSeller = async (sellerData: Omit<Seller, 'id' | 'createdAt'>) => {
    try {
      const seller = await sellersService.create({
        name: sellerData.name,
        mobile_number: sellerData.mobileNumber,
        address: sellerData.address,
        shop_name: sellerData.shopName,
      });

      const transformedSeller = {
        ...seller,
        mobileNumber: seller.mobile_number,
        shopName: seller.shop_name,
        createdAt: seller.created_at || new Date().toISOString(),
      };

      dispatch({ type: 'ADD_SELLER', payload: transformedSeller });
    } catch (error) {
      console.error('Error creating seller:', error);
      throw error;
    }
  };

  const updateSeller = async (id: string, sellerData: Partial<Seller>) => {
    try {
      const seller = await sellersService.update(id, {
        name: sellerData.name,
        mobile_number: sellerData.mobileNumber,
        address: sellerData.address,
        shop_name: sellerData.shopName,
      });

      const transformedSeller = {
        ...seller,
        mobileNumber: seller.mobile_number,
        shopName: seller.shop_name,
        createdAt: seller.created_at || new Date().toISOString(),
      };

      dispatch({ type: 'UPDATE_SELLER', payload: transformedSeller });
    } catch (error) {
      console.error('Error updating seller:', error);
      throw error;
    }
  };

  const deleteSeller = async (id: string) => {
    try {
      await sellersService.delete(id);
      dispatch({ type: 'DELETE_SELLER', payload: id });
    } catch (error) {
      console.error('Error deleting seller:', error);
      throw error;
    }
  };

  const createSupplier = async (
    supplierData: Omit<Supplier, 'id' | 'createdAt'>
  ) => {
    try {
      const supplier = await suppliersService.create({
        name: supplierData.name,
        contact_number: supplierData.contactNumber,
        address: supplierData.address,
        product_category: supplierData.productCategory,
        plant_name: supplierData.plantName,
      });

      const transformedSupplier = {
        ...supplier,
        contactNumber: supplier.contact_number,
        productCategory: supplier.product_category,
        plantName: supplier.plant_name,
        createdAt: supplier.created_at || new Date().toISOString(),
      };

      dispatch({ type: 'ADD_SUPPLIER', payload: transformedSupplier });
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  const updateSupplier = async (
    id: string,
    supplierData: Partial<Supplier>
  ) => {
    try {
      const supplier = await suppliersService.update(id, {
        name: supplierData.name,
        contact_number: supplierData.contactNumber,
        address: supplierData.address,
        product_category: supplierData.productCategory,
        plant_name: supplierData.plantName,
      });

      const transformedSupplier = {
        ...supplier,
        contactNumber: supplier.contact_number,
        productCategory: supplier.product_category,
        plantName: supplier.plant_name,
        createdAt: supplier.created_at || new Date().toISOString(),
      };

      dispatch({ type: 'UPDATE_SUPPLIER', payload: transformedSupplier });
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await suppliersService.delete(id);
      dispatch({ type: 'DELETE_SUPPLIER', payload: id });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  };

  const createBilty = async (
    biltyData: Omit<Bilty, 'id' | 'biltyNumber' | 'createdAt' | 'productDetails' | 'product'>,
    productDetails: ProductDetail[]
  ) => {
    try {
      const biltyNumber = generateBiltyNumber();

      const bilty = await biltiesService.create(
        {
          bilty_number: biltyNumber,
          seller_id: biltyData.sellerId,
          vehicle_no: biltyData.vehicleNo,
          delivery_address: biltyData.deliveryAddress,
          rent: biltyData.rent,
          advance: biltyData.advance,
          driver_tips: biltyData.driverTips,
          status: biltyData.status,
          total_crates_bags: biltyData.totalCratesBags,
        },
        productDetails.map((pd) => ({
          bilty_id: biltyNumber,
          product_name: pd.productName,
          unit_type: pd.unitType,
          quantity: pd.quantity,
          total_crates_bags: pd.totalCratesBags,
          remarks: pd.remarks,
        }))
      );

      const transformedBilty = {
        ...bilty,
        sellerId: bilty.seller_id,
        vehicleNo: bilty.vehicle_no,
        deliveryAddress: bilty.delivery_address,
        driverTips: bilty.driver_tips,
        biltyNumber: bilty.bilty_number,
        totalCratesBags: bilty.total_crates_bags || 0,
        createdAt: bilty.created_at || new Date().toISOString(),
        productDetails: productDetails,
        product: {
          name: productDetails[0]?.productName || 'Tomato',
          quantity: productDetails.reduce((sum, pd) => sum + pd.quantity, 0),
          color: productDetails[0]?.unitType || 'kg',
          plant: '',
        },
      };

      dispatch({ type: 'ADD_BILTY', payload: transformedBilty });
    } catch (error) {
      console.error('Error creating bilty:', error);
      throw error;
    }
  };

  const updateBilty = async (
    id: string,
    biltyData: Partial<Bilty>,
    productDetails?: ProductDetail[]
  ) => {
    try {
      console.log('updateBilty called for ID:', id);
      console.log('biltyData:', biltyData);
      console.log('productDetails received:', productDetails);

      // Update the main bilty record
      const bilty = await biltiesService.update(
        id,
        {
          seller_id: biltyData.sellerId,
          vehicle_no: biltyData.vehicleNo,
          delivery_address: biltyData.deliveryAddress,
          rent: biltyData.rent,
          advance: biltyData.advance,
          driver_tips: biltyData.driverTips,
          status: biltyData.status,
          total_crates_bags: biltyData.totalCratesBags,
        }
      );
      console.log('Bilty updated in service:', bilty);

      // If product details are provided, update them separately
      if (productDetails !== undefined) {
        console.log('Product details provided, deleting existing...');
        await productDetailsService.delete(id);
        console.log('Existing product details deleted.');

        // Create the new product details if the array is not empty
        if (productDetails.length > 0) {
          console.log('Creating new product details:', productDetails);
          const productDetailsToCreate = productDetails.map(pd => ({
              bilty_id: id,
              product_name: pd.productName,
              unit_type: pd.unitType,
              quantity: pd.quantity,
              total_crates_bags: pd.totalCratesBags,
              remarks: pd.remarks,
          }));
          await productDetailsService.create(productDetailsToCreate);
          console.log('New product details creation requested.');
        } else {
           console.log('No new product details provided, only deleted existing.');
        }
      } else {
          console.log('No product details provided in update call. Will fetch existing to include in state.');
      }

      // Fetch the latest product details from the database
      console.log('Fetching latest product details for bilty ID:', id);
      const latestProductDetails = (await productDetailsService.getByBiltyId(id)).map(pd => ({
         id: pd.id,
         biltyId: pd.bilty_id,
         productName: pd.product_name,
         unitType: pd.unit_type,
         quantity: pd.quantity,
         totalCratesBags: pd.total_crates_bags,
         remarks: pd.remarks || '',
      }));
      console.log('Fetched latest product details:', latestProductDetails);

      // Construct the transformed bilty object to update the state
      const transformedBilty = {
        ...bilty,
        sellerId: bilty.seller_id,
        vehicleNo: bilty.vehicle_no,
        deliveryAddress: bilty.delivery_address,
        driverTips: bilty.driver_tips,
        biltyNumber: bilty.bilty_number,
        totalCratesBags: bilty.total_crates_bags || 0,
        createdAt: bilty.created_at || new Date().toISOString(),
        productDetails: latestProductDetails,
         product: {
          name: latestProductDetails[0]?.productName || 'Tomato',
          quantity: latestProductDetails.reduce((sum, pd) => sum + pd.quantity, 0) || 0,
          color: latestProductDetails[0]?.unitType || 'kg',
           plant: '',
        },
      };
      console.log('Transformed bilty object for state update:', transformedBilty);

      // Dispatch the action to update the state
      dispatch({ type: 'UPDATE_BILTY', payload: transformedBilty });
      console.log('UPDATE_BILTY dispatched.');
    } catch (error) {
      console.error('Error updating bilty:', error);
      throw error;
    }
  };

  const deleteBilty = async (id: string) => {
    try {
      await biltiesService.delete(id);
      dispatch({ type: 'DELETE_BILTY', payload: id });
    } catch (error) {
      console.error('Error deleting bilty:', error);
      throw error;
    }
  };

  const createVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      const vehicle = await vehiclesService.create({
        transport_name: vehicleData.transportName,
        driver_name: vehicleData.driverName,
        vehicle_no: vehicleData.vehicleNo,
        date_time: vehicleData.dateTime,
        product_info: vehicleData.productInfo,
        quantity: vehicleData.quantity,
        plant: vehicleData.plant,
        advance: vehicleData.advance,
        status: vehicleData.status,
        transport_mobile: vehicleData.transportMobile,
        driver_mobile: vehicleData.driverMobile,
      });

      const transformedVehicle = {
        ...vehicle,
        transportName: vehicle.transport_name,
        driverName: vehicle.driver_name,
        vehicleNo: vehicle.vehicle_no,
        dateTime: vehicle.date_time,
        productInfo: vehicle.product_info,
        quantity: vehicle.quantity || 0,
        plant: vehicle.plant || '',
        advance: vehicle.advance || 0,
        transportMobile: vehicle.transport_mobile || '',
        driverMobile: vehicle.driver_mobile,
      };

      dispatch({ type: 'ADD_VEHICLE', payload: transformedVehicle });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  };

  const updateVehicle = async (id: string, vehicleData: Partial<Vehicle>) => {
    try {
      const vehicle = await vehiclesService.update(id, {
        transport_name: vehicleData.transportName,
        driver_name: vehicleData.driverName,
        vehicle_no: vehicleData.vehicleNo,
        date_time: vehicleData.dateTime,
        product_info: vehicleData.productInfo,
        quantity: vehicleData.quantity,
        plant: vehicleData.plant,
        advance: vehicleData.advance,
        status: vehicleData.status,
        transport_mobile: vehicleData.transportMobile,
        driver_mobile: vehicleData.driverMobile,
      });

      const transformedVehicle = {
        ...vehicle,
        transportName: vehicle.transport_name,
        driverName: vehicle.driver_name,
        vehicleNo: vehicle.vehicle_no,
        dateTime: vehicle.date_time,
        productInfo: vehicle.product_info,
        quantity: vehicle.quantity || 0,
        plant: vehicle.plant || '',
        advance: vehicle.advance || 0,
        transportMobile: vehicle.transport_mobile || '',
        driverMobile: vehicle.driver_mobile,
      };

      dispatch({ type: 'UPDATE_VEHICLE', payload: transformedVehicle });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await vehiclesService.delete(id);
      dispatch({ type: 'DELETE_VEHICLE', payload: id });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  };

  const createSchedule = async (scheduleData: Omit<Schedule, 'id'>) => {
    try {
      const schedule = await schedulesService.create({
        shift: scheduleData.shift,
        in_time: scheduleData.inTime,
        out_time: scheduleData.outTime,
        driver_id: scheduleData.driverId,
        operating_days: scheduleData.operatingDays,
        tax_deduction: scheduleData.taxDeduction,
        final_payment: scheduleData.finalPayment,
        date: scheduleData.date,
      });

      const transformedSchedule = {
        ...schedule,
        inTime: schedule.in_time,
        outTime: schedule.out_time,
        driverId: schedule.driver_id,
        operatingDays: schedule.operating_days,
        taxDeduction: schedule.tax_deduction,
        finalPayment: schedule.final_payment,
      };

      dispatch({ type: 'ADD_SCHEDULE', payload: transformedSchedule });
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  };

  const updateSchedule = async (
    id: string,
    scheduleData: Partial<Schedule>
  ) => {
    try {
      const schedule = await schedulesService.update(id, {
        shift: scheduleData.shift,
        in_time: scheduleData.inTime,
        out_time: scheduleData.outTime,
        driver_id: scheduleData.driverId,
        operating_days: scheduleData.operatingDays,
        tax_deduction: scheduleData.taxDeduction,
        final_payment: scheduleData.finalPayment,
        date: scheduleData.date,
      });

      const transformedSchedule = {
        ...schedule,
        inTime: schedule.in_time,
        outTime: schedule.out_time,
        driverId: schedule.driver_id,
        operatingDays: schedule.operating_days,
        taxDeduction: schedule.tax_deduction,
        finalPayment: schedule.final_payment,
      };

      dispatch({ type: 'UPDATE_SCHEDULE', payload: transformedSchedule });
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await schedulesService.delete(id);
      dispatch({ type: 'DELETE_SCHEDULE', payload: id });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  };

  const createBillingRecord = async (recordData: Omit<BillingRecord, 'id'>) => {
    try {
      const record = await billingRecordsService.create({
        vehicle_no: recordData.vehicleNo,
        date: recordData.date,
        amount: recordData.amount,
        seller_id: recordData.sellerId,
        advance: recordData.advance,
        net_amount: recordData.netAmount,
        status: recordData.status,
      });

      const transformedRecord = {
        ...record,
        vehicleNo: record.vehicle_no,
        sellerId: record.seller_id,
        netAmount: record.net_amount,
      };

      dispatch({ type: 'ADD_BILLING_RECORD', payload: transformedRecord });
    } catch (error) {
      console.error('Error creating billing record:', error);
      throw error;
    }
  };

  const updateBillingRecord = async (
    id: string,
    recordData: Partial<BillingRecord>
  ) => {
    try {
      const record = await billingRecordsService.update(id, {
        vehicle_no: recordData.vehicleNo,
        date: recordData.date,
        amount: recordData.amount,
        seller_id: recordData.sellerId,
        advance: recordData.advance,
        net_amount: recordData.netAmount,
        status: recordData.status,
      });

      const transformedRecord = {
        ...record,
        vehicleNo: record.vehicle_no,
        sellerId: record.seller_id,
        netAmount: record.net_amount,
      };

      dispatch({ type: 'UPDATE_BILLING_RECORD', payload: transformedRecord });
    } catch (error) {
      console.error('Error updating billing record:', error);
      throw error;
    }
  };

  const deleteBillingRecord = async (id: string) => {
    try {
      await billingRecordsService.delete(id);
      dispatch({ type: 'DELETE_BILLING_RECORD', payload: id });
    } catch (error) {
      console.error('Error deleting billing record:', error);
      throw error;
    }
  };

  const getDashboardStats = (): DashboardStats => {
    const today = new Date().toDateString();
    const todayBilties = state.bilties.filter(
      (bilty) => new Date(bilty.createdAt).toDateString() === today
    );

    const activeVehicles = state.vehicles.filter(
      (vehicle) => vehicle.status === 'Active'
    );
    const totalAdvance = state.bilties.reduce(
      (sum, bilty) => sum + bilty.advance,
      0
    );

    const supplierStats = state.suppliers.reduce((acc, supplier) => {
      const supplierBilties = state.bilties.filter(
        (bilty) => bilty.product.plant === supplier.plantName
      );
      acc[supplier.name] =
        state.bilties.length > 0
          ? (supplierBilties.length / state.bilties.length) * 100
          : 0;
      return acc;
    }, {} as { [key: string]: number });

    const netOutstanding = state.billingRecords
      .filter(
        (record) => record.status === 'Pending' || record.status === 'Overdue'
      )
      .reduce((sum, record) => sum + record.netAmount, 0);

    return {
      totalBiltiesToday: todayBilties.length,
      totalVehiclesActive: activeVehicles.length,
      totalAdvancePaid: totalAdvance,
      supplierDispatchPercentage: supplierStats,
      netOutstanding,
    };
  };

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        state,
        dispatch,
        getDashboardStats,
        loadAllData,
        createSeller,
        updateSeller,
        deleteSeller,
        createSupplier,
        updateSupplier,
        deleteSupplier,
        createBilty,
        updateBilty,
        deleteBilty,
        createVehicle,
        updateVehicle,
        deleteVehicle,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        createBillingRecord,
        updateBillingRecord,
        deleteBillingRecord,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};