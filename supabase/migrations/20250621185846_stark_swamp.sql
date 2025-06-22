/*
  # Add total_crates_bags field to bilties table

  1. Changes
    - Add `total_crates_bags` field to bilties table

  2. Security
    - No changes to RLS policies needed
*/

-- Add total_crates_bags field to bilties table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bilties' AND column_name = 'total_crates_bags'
  ) THEN
    ALTER TABLE bilties ADD COLUMN total_crates_bags numeric DEFAULT 0;
  END IF;
END $$;