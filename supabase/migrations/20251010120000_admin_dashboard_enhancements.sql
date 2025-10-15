-- Migration: Admin Dashboard Enhancements
-- Date: 2025-10-10
-- Purpose: Add status column for user management and optimize queries

-- Add status column to profiles table for user account management
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'suspended', 'banned'));

-- Create index for better query performance on status filtering
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Add comment for documentation
COMMENT ON COLUMN profiles.status IS 'User account status: active (default), suspended (temporary restriction), or banned (permanent block)';

-- Update existing records to have 'active' status if null
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- Grant necessary permissions (if needed)
-- Note: RLS policies already handle access control

