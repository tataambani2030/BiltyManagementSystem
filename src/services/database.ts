import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Tables = Database['public']['Tables'];

// Sellers CRUD
export const sellersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(seller: Tables['sellers']['Insert']) {
    const { data, error } = await supabase
      .from('sellers')
      .insert(seller)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, seller: Tables['sellers']['Update']) {
    const { data, error } = await supabase
      .from('sellers')
      .update(seller)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('sellers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Suppliers CRUD
export const suppliersService = {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(supplier: Tables['suppliers']['Insert']) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, supplier: Tables['suppliers']['Update']) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(supplier)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Vehicles CRUD
export const vehiclesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');
     
    if (error) {
      console.error('Failed to fetch vehicles from Supabase:', error.message);
      throw error;
    }

    return data;
  },

  async create(vehicle: Tables['vehicles']['Insert']) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, vehicle: Tables['vehicles']['Update']) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(vehicle)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Product Details CRUD
export const productDetailsService = {
  async getByBiltyId(biltyId: string) {
    const { data, error } = await supabase
      .from('product_details')
      .select('*')
      .eq('bilty_id', biltyId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(productDetails: Tables['product_details']['Insert'][]) {
    const { data, error } = await supabase
      .from('product_details')
      .insert(productDetails)
      .select();
    
    if (error) throw error;
    return data;
  },

  async update(biltyId: string, productDetails: Tables['product_details']['Insert'][]) {
    // Delete existing product details
    await supabase
      .from('product_details')
      .delete()
      .eq('bilty_id', biltyId);

    // Insert new product details
    const { data, error } = await supabase
      .from('product_details')
      .insert(productDetails)
      .select();
    
    if (error) throw error;
    return data;
  },

  async delete(biltyId: string) {
    const { error } = await supabase
      .from('product_details')
      .delete()
      .eq('bilty_id', biltyId);
    
    if (error) throw error;
  }
};

// Bilties CRUD
export const biltiesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bilties')
      .select(`
        *,
        products (*),
        product_details (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(bilty: Tables['bilties']['Insert'], productDetails: Tables['product_details']['Insert'][]) {
    // Create bilty
    const user = await supabase.auth.getUser();
    console.log('User:', user);
    //Console.log(user);
    const { data: biltyData, error: biltyError } = await supabase
      .from('bilties')
      .insert(bilty)
      .select()
      .single();
    
    if (biltyError) throw biltyError;

    // Create product details
    const productDetailsWithBiltyId = productDetails.map(pd => ({
      ...pd,
      bilty_id: biltyData.id
    }));

    const { error: productDetailsError } = await supabase
      .from('product_details')
      .insert(productDetailsWithBiltyId);
    
    if (productDetailsError) throw productDetailsError;

    return biltyData;
  },

  async update(id: string, bilty: Tables['bilties']['Update'], productDetails?: Tables['product_details']['Insert'][]) {
    const { data, error } = await supabase
      .from('bilties')
      .update(bilty)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Update product details if provided
    if (productDetails) {
      await productDetailsService.update(id, productDetails.map(pd => ({
        ...pd,
        bilty_id: id
      })));
    }

    return data;
  },

  async delete(id: string) {
    const { error, data } = await supabase
      .from('bilties')
      .delete()
      .eq('id', id).select();;
      if (error) {
        console.error('Delete failed:', error.message);
        return { success: false, error };
      }
    
      return { success: true, data };
  }
};

// Schedules CRUD
export const schedulesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(schedule: Tables['schedules']['Insert']) {
    const { data, error } = await supabase
      .from('schedules')
      .insert(schedule)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, schedule: Tables['schedules']['Update']) {
    const { data, error } = await supabase
      .from('schedules')
      .update(schedule)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Billing Records CRUD
export const billingRecordsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('billing_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(record: Tables['billing_records']['Insert']) {
    const { data, error } = await supabase
      .from('billing_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, record: Tables['billing_records']['Update']) {
    const { data, error } = await supabase
      .from('billing_records')
      .update(record)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('billing_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// New Billing Records CRUD
export const billingRecordsNewService = {
  async getAll() {
    const { data, error } = await supabase
      .from('billing_records_new')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(record: Tables['billing_records_new']['Insert']) {
    const { data, error } = await supabase
      .from('billing_records_new')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, record: Tables['billing_records_new']['Update']) {
    const { data, error } = await supabase
      .from('billing_records_new')
      .update(record)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('billing_records_new')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Billing Product Lines CRUD
export const billingProductLinesService = {
  async getByBillingId(billingId: string) {
    const { data, error } = await supabase
      .from('billing_product_lines')
      .select('*')
      .eq('billing_id', billingId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async create(productLines: Tables['billing_product_lines']['Insert'][]) {
    const { data, error } = await supabase
      .from('billing_product_lines')
      .insert(productLines)
      .select();
    
    if (error) throw error;
    return data;
  },

  async update(billingId: string, productLines: Tables['billing_product_lines']['Insert'][]) {
    // Delete existing product lines
    await supabase
      .from('billing_product_lines')
      .delete()
      .eq('billing_id', billingId);

    // Insert new product lines
    const { data, error } = await supabase
      .from('billing_product_lines')
      .insert(productLines)
      .select();
    
    if (error) throw error;
    return data;
  },

  async delete(billingId: string) {
    const { error } = await supabase
      .from('billing_product_lines')
      .delete()
      .eq('billing_id', billingId);
    
    if (error) throw error;
  }
};

// Generate bilty number
export const generateBiltyNumber = (): string => {
  const prefix = 'BLT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${prefix}${timestamp}${random}`;
};

// Unit conversion logic
export const calculateTotalCratesBags = (quantity: number, unitType: string): number => {
  const conversionRates: { [key: string]: number } = {
    'kg': 0.02,        // 1 kg = 0.02 crates (50 kg per crate)
    'bag': 1,          // 1 bag = 1 bag
    'crate': 1,        // 1 crate = 1 crate
    'carrate': 1,      // 1 carrate = 1 carrate
    'tons': 20,        // 1 ton = 20 crates (50 kg per crate)
    'quintal': 2,      // 1 quintal = 2 crates (100 kg per quintal, 50 kg per crate)
  };

  return Math.round((quantity * (conversionRates[unitType.toLowerCase()] || 1)) * 100) / 100;
};