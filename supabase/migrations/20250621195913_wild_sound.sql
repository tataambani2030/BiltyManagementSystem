/*
  # Create Billing Tables

  1. New Tables
    - `billing_records` - Main billing records for bilties
      - `id` (uuid, primary key)
      - `bilty_id` (uuid, foreign key to bilties)
      - `commission` (numeric)
      - `driver_paid` (numeric)
      - `net_total` (numeric)
      - `billing_date` (date)
      - `remark` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `billing_product_lines` - Product-wise billing details
      - `id` (uuid, primary key)
      - `billing_id` (uuid, foreign key to billing_records)
      - `product_detail_id` (uuid, foreign key to product_details)
      - `sold_price` (numeric)
      - `total_amount` (numeric)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users

  3. Relationships
    - Foreign key relationships with proper cascade deletes
*/

-- Create billing_records table
CREATE TABLE IF NOT EXISTS billing_records_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bilty_id uuid NOT NULL REFERENCES bilties(id) ON DELETE CASCADE,
  commission numeric NOT NULL DEFAULT 0,
  driver_paid numeric NOT NULL DEFAULT 0,
  net_total numeric NOT NULL DEFAULT 0,
  billing_date date NOT NULL DEFAULT CURRENT_DATE,
  remark text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create billing_product_lines table
CREATE TABLE IF NOT EXISTS billing_product_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_id uuid NOT NULL REFERENCES billing_records_new(id) ON DELETE CASCADE,
  product_detail_id uuid NOT NULL REFERENCES product_details(id) ON DELETE CASCADE,
  sold_price numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE billing_records_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_product_lines ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can manage billing records" 
  ON billing_records_new 
  FOR ALL 
  TO authenticated 
  USING (true);

CREATE POLICY "Authenticated users can manage billing product lines" 
  ON billing_product_lines 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_billing_records_bilty_id ON billing_records_new(bilty_id);
CREATE INDEX IF NOT EXISTS idx_billing_records_billing_date ON billing_records_new(billing_date);
CREATE INDEX IF NOT EXISTS idx_billing_product_lines_billing_id ON billing_product_lines(billing_id);
CREATE INDEX IF NOT EXISTS idx_billing_product_lines_product_detail_id ON billing_product_lines(product_detail_id);

-- Add updated_at trigger for billing_records_new
CREATE TRIGGER update_billing_records_new_updated_at 
  BEFORE UPDATE ON billing_records_new 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();