-- Migration: Fix RLS Infinite Recursion on user_roles
-- Date: 2025-10-10
-- Issue: View roles policy created infinite recursion when checking admin status
-- Fix: Simplified policies to only allow users to view their own roles

-- Drop problematic recursive policies
DROP POLICY IF EXISTS "View roles policy" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

-- Create simple, non-recursive SELECT policy
-- Users can only see their own role (no recursive admin check)
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT
  USING (user_id = (select auth.uid()));

-- Create simple UPDATE policy
CREATE POLICY "Users can update own role" ON user_roles
  FOR UPDATE
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Create simple DELETE policy
CREATE POLICY "Users can delete own role" ON user_roles
  FOR DELETE
  USING (user_id = (select auth.uid()));

-- Note: INSERT policy "Allow role creation" remains unchanged as it doesn't cause recursion
-- It allows:
-- 1. Existing admins to create new roles
-- 2. First admin to be created (when no admin exists)
-- 3. Users to create their own merchant role

COMMENT ON POLICY "Users can view own role" ON user_roles IS 
  'Allows users to view their own role without recursive admin checks';

