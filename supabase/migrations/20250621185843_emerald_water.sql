/*
  # Add mobile fields to vehicles table

  1. Changes
    - Add `transport_mobile` field (optional)
    - Add `driver_mobile` field (required)

  2. Security
    - No changes to RLS policies needed
*/

-- Add mobile fields to vehicles table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'transport_mobile'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN transport_mobile text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'driver_mobile'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN driver_mobile text NOT NULL DEFAULT '';
  END IF;
END $$;