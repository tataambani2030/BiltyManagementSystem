/*
  # Create ProductDetails Table

  1. New Table
    - `product_details` - Detailed product information for bilties
      - `id` (uuid, primary key)
      - `bilty_id` (uuid, foreign key to bilties)
      - `product_name` (text, required)
      - `unit_type` (text, required - kg, bag, crate, etc.)
      - `quantity` (numeric, required)
      - `total_crates_bags` (numeric, auto-calculated)
      - `remarks` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on product_details table
    - Add policies for authenticated users

  3. Relationships
    - Foreign key relationship to bilties table
    - Cascade delete when bilty is deleted
*/

-- Create ProductDetails table
CREATE TABLE IF NOT EXISTS product_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bilty_id uuid NOT NULL REFERENCES bilties(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  unit_type text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  total_crates_bags numeric NOT NULL DEFAULT 0,
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE product_details ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Authenticated users can manage product details" 
  ON product_details 
  FOR ALL 
  TO authenticated 
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_details_bilty_id ON product_details(bilty_id);

-- Add updated_at trigger
CREATE TRIGGER update_product_details_updated_at 
  BEFORE UPDATE ON product_details 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();