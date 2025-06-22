/*
  # Bilty Management System Database Schema

  1. New Tables
    - `users` - System users with roles and permissions
    - `sellers` - Tomato sellers/buyers information
    - `suppliers` - Tomato suppliers/farms information  
    - `vehicles` - Transport vehicles and driver details
    - `bilties` - Main bilty records for tomato shipments
    - `schedules` - Driver schedules and payment information
    - `billing_records` - Billing and payment tracking
    - `products` - Product details for bilties (supports multiple products per bilty)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Proper foreign key relationships

  3. Features
    - UUID primary keys for all tables
    - Timestamps for audit trails
    - Proper indexing for performance
    - Support for multiple products per bilty
    - Financial tracking with advances and payments
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Dispatcher', 'Entry Operator', 'Accountant')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  mobile_number text NOT NULL,
  address text NOT NULL,
  shop_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Suppliers table  
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_number text NOT NULL,
  address text NOT NULL,
  product_category text NOT NULL DEFAULT 'Tomato',
  plant_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  transport_name text NOT NULL,
  driver_name text NOT NULL,
  vehicle_no text NOT NULL UNIQUE,
  date_time timestamptz NOT NULL DEFAULT now(),
  product_info text NOT NULL DEFAULT 'Tomato Transport',
  quantity numeric DEFAULT 0,
  plant text DEFAULT '',
  advance numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Idle', 'Maintenance')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Bilties table
CREATE TABLE IF NOT EXISTS bilties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bilty_number text NOT NULL UNIQUE,
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  vehicle_no text NOT NULL,
  delivery_address text NOT NULL,
  rent numeric NOT NULL DEFAULT 0,
  advance numeric NOT NULL DEFAULT 0,
  driver_tips numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Transit', 'Delivered')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table for bilty items (supports multiple products per bilty)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bilty_id uuid NOT NULL REFERENCES bilties(id) ON DELETE CASCADE,
  product_type text NOT NULL DEFAULT 'Tomato',
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg',
  kg_weight numeric DEFAULT 0, -- For bags/carrate conversion
  created_at timestamptz DEFAULT now()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift text NOT NULL CHECK (shift IN ('Morning', 'Evening')),
  in_time time NOT NULL,
  out_time time NOT NULL,
  driver_id text NOT NULL,
  operating_days integer NOT NULL DEFAULT 26,
  tax_deduction numeric NOT NULL DEFAULT 0,
  final_payment numeric NOT NULL DEFAULT 0,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing records table
CREATE TABLE IF NOT EXISTS billing_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_no text NOT NULL,
  date timestamptz NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  advance numeric NOT NULL DEFAULT 0,
  net_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bilties ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read all data" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);

CREATE POLICY "Authenticated users can manage sellers" ON sellers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage suppliers" ON suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage vehicles" ON vehicles FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage bilties" ON bilties FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage schedules" ON schedules FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage billing records" ON billing_records FOR ALL TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bilties_seller_id ON bilties(seller_id);
CREATE INDEX IF NOT EXISTS idx_bilties_vehicle_no ON bilties(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_bilties_status ON bilties(status);
CREATE INDEX IF NOT EXISTS idx_bilties_created_at ON bilties(created_at);
CREATE INDEX IF NOT EXISTS idx_products_bilty_id ON products(bilty_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_no ON vehicles(vehicle_no);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_billing_records_seller_id ON billing_records(seller_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_status ON billing_records(status);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bilties_updated_at BEFORE UPDATE ON bilties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_records_updated_at BEFORE UPDATE ON billing_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();