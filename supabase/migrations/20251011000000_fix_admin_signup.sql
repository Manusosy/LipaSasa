-- Migration: Fix Admin Signup Circular Dependency
-- Date: 2025-10-11
-- Issue: Admin signup fails because INSERT policy requires admin role to create admin role
-- Solution: Allow first admin creation, then require existing admin for subsequent admins

-- ============================================================================
-- PART 1: Fix user_roles INSERT Policy
-- ============================================================================

-- Drop the broken policy
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;

-- Create a new policy that allows:
-- 1. Existing admins to create any role
-- 2. First admin creation (when no admin exists)
-- 3. Users to create their own merchant role (via trigger)
CREATE POLICY "Allow role creation" ON user_roles
  FOR INSERT WITH CHECK (
    -- Allow if user is already an admin
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
    OR
    -- Allow if this is the first admin (no admin exists yet)
    (
      NEW.role = 'admin' 
      AND NOT EXISTS (SELECT 1 FROM user_roles WHERE role = 'admin')
    )
    OR
    -- Allow users to be assigned merchant role (via trigger)
    (
      NEW.role = 'merchant' 
      AND NEW.user_id = (SELECT auth.uid())
    )
  );

-- Add helpful comment
COMMENT ON POLICY "Allow role creation" ON user_roles IS 
  'Allows: (1) Admins to create any role, (2) First admin signup, (3) Merchant role auto-assignment';

-- ============================================================================
-- PART 2: Optimize existing user_roles policies for performance
-- ============================================================================

-- Fix SELECT policies to use (select auth.uid()) pattern
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Combine into single optimized SELECT policy
CREATE POLICY "View roles policy" ON user_roles
  FOR SELECT USING (
    -- Users can see their own roles
    user_id = (SELECT auth.uid())
    OR
    -- Admins can see all roles
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Fix UPDATE policy
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;

CREATE POLICY "Admins can update roles" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- Fix DELETE policy  
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;

CREATE POLICY "Admins can delete roles" ON user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (SELECT auth.uid()) 
      AND role = 'admin'
    )
  );

-- ============================================================================
-- PART 3: Update has_role function to be more performant
-- ============================================================================

-- The function is already using optimized query, but let's ensure it's set correctly
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Add comment
COMMENT ON FUNCTION has_role(uuid, app_role) IS 
  'Checks if a user has a specific role. Optimized with stable function and secure search path.';

-- ============================================================================
-- PART 4: Create helper function to check if user is admin
-- ============================================================================

-- Drop if exists
DROP FUNCTION IF EXISTS public.is_admin();

-- Create optimized is_admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

COMMENT ON FUNCTION is_admin() IS 
  'Convenience function to check if current user is an admin. Returns boolean.';

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '1. Fixed admin signup circular dependency';
  RAISE NOTICE '2. Optimized user_roles RLS policies';
  RAISE NOTICE '3. Added is_admin() helper function';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 First admin can now sign up via /admin/auth';
  RAISE NOTICE '📝 Subsequent admins must be created by existing admins';
END $$;

