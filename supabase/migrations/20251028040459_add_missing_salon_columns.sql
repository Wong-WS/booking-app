-- Add missing columns to salons table
ALTER TABLE salons ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE salons ADD COLUMN IF NOT EXISTS description TEXT;

-- Drop old incorrect RLS policies
DROP POLICY IF EXISTS "Users can view their own salon" ON salons;
DROP POLICY IF EXISTS "Users can update their own salon" ON salons;

-- Create correct RLS policies for salons
CREATE POLICY "Users can view their own salon" ON salons
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own salon" ON salons
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own salon" ON salons
  FOR UPDATE USING (auth.uid() = owner_id);

-- Fix services RLS policy to use owner_id from salons
DROP POLICY IF EXISTS "Salon owners can manage their services" ON services;

CREATE POLICY "Salon owners can manage their services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM salons WHERE salons.id = services.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- Fix appointments RLS policies
DROP POLICY IF EXISTS "Salon owners can view their appointments" ON appointments;
DROP POLICY IF EXISTS "Salon owners can update their appointments" ON appointments;

CREATE POLICY "Salon owners can view their appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salons WHERE salons.id = appointments.salon_id AND salons.owner_id = auth.uid()
    )
  );

CREATE POLICY "Salon owners can update their appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM salons WHERE salons.id = appointments.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- Fix staff RLS policy
DROP POLICY IF EXISTS "Salon owners can manage their staff" ON staff;

CREATE POLICY "Salon owners can manage their staff" ON staff
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM salons WHERE salons.id = staff.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- Fix availability_blocks RLS policy
DROP POLICY IF EXISTS "Salon owners can manage their availability blocks" ON availability_blocks;

CREATE POLICY "Salon owners can manage their availability blocks" ON availability_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM salons WHERE salons.id = availability_blocks.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- Fix activity_logs RLS policy
DROP POLICY IF EXISTS "Salon owners can view their logs" ON activity_logs;

CREATE POLICY "Salon owners can view their logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM salons WHERE salons.id = activity_logs.salon_id AND salons.owner_id = auth.uid()
    )
  );
