-- Migration: Create Auth Triggers for Auto Profile and Role Assignment
-- Date: 2025-10-11
-- Issue: Users sign up but no profile or role is created automatically
-- Solution: Add trigger on auth.users to create profile and assign role

-- ============================================================================
-- PART 1: Create trigger function to handle new user signup
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  is_admin_email BOOLEAN;
  admin_exists BOOLEAN;
  user_role app_role;
BEGIN
  -- Check if this is an admin email (kazinikazi.co.ke domain)
  is_admin_email := NEW.email LIKE '%@kazinikazi.co.ke';
  
  -- Check if any admin already exists
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO admin_exists;

  -- Determine role to assign
  IF is_admin_email AND NOT admin_exists THEN
    -- This is the first admin
    user_role := 'admin';
    RAISE NOTICE 'Creating first admin user: %', NEW.email;
  ELSIF is_admin_email AND admin_exists THEN
    -- Admin email but admin already exists
    -- Don't assign role here - must be done by existing admin
    user_role := NULL;
    RAISE NOTICE 'Admin email detected but admin exists. Role must be assigned manually: %', NEW.email;
  ELSE
    -- Regular merchant user
    user_role := 'merchant';
    RAISE NOTICE 'Creating merchant user: %', NEW.email;
  END IF;

  -- Create profile record
  BEGIN
    INSERT INTO public.profiles (
      user_id,
      business_name,
      owner_name,
      email,
      phone,
      country,
      industry,
      selected_plan,
      subscribe_newsletter
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
      COALESCE(
        NEW.raw_user_meta_data->>'owner_name',
        NEW.raw_user_meta_data->>'full_name',
        ''
      ),
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data->>'phone',
        NEW.phone,
        ''
      ),
      COALESCE(NEW.raw_user_meta_data->>'country', 'Kenya'),
      COALESCE(NEW.raw_user_meta_data->>'industry', ''),
      COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'starter'),
      COALESCE((NEW.raw_user_meta_data->>'subscribe_newsletter')::boolean, false)
    );
    
    RAISE NOTICE 'Profile created for user: %', NEW.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Failed to create profile for user %: %', NEW.email, SQLERRM;
    -- Don't fail the entire signup if profile creation fails
  END;

  -- Assign role (if determined)
  IF user_role IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, user_role);
      
      RAISE NOTICE 'Role "%" assigned to user: %', user_role, NEW.email;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to assign role to user %: %', NEW.email, SQLERRM;
      -- Don't fail the entire signup if role assignment fails
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.handle_new_user() IS 
  'Trigger function to automatically create profile and assign role when user signs up via Supabase Auth';

-- ============================================================================
-- PART 2: Create trigger on auth.users table
-- ============================================================================

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
  'Automatically creates profile and assigns role when new user signs up';

-- ============================================================================
-- PART 3: Grant necessary permissions
-- ============================================================================

-- Grant usage on schema to authenticated and anon roles
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant execute on the trigger function to postgres and service role
-- (Trigger runs as SECURITY DEFINER so it has necessary permissions)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, service_role;

-- ============================================================================
-- PART 4: Backfill existing users (if any users exist without profiles/roles)
-- ============================================================================

DO $$
DECLARE
  user_record RECORD;
  backfill_count INTEGER := 0;
BEGIN
  -- Find users without profiles
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data, u.phone
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.user_id
    WHERE p.id IS NULL
  LOOP
    -- Create missing profile
    BEGIN
      INSERT INTO public.profiles (
        user_id,
        business_name,
        owner_name,
        email,
        phone,
        country,
        selected_plan
      )
      VALUES (
        user_record.id,
        COALESCE(user_record.raw_user_meta_data->>'business_name', ''),
        COALESCE(user_record.raw_user_meta_data->>'owner_name', ''),
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'phone', user_record.phone, ''),
        COALESCE(user_record.raw_user_meta_data->>'country', 'Kenya'),
        COALESCE(user_record.raw_user_meta_data->>'selected_plan', 'starter')
      );
      
      backfill_count := backfill_count + 1;
      RAISE NOTICE 'Backfilled profile for user: %', user_record.email;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to backfill profile for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;

  -- Find users without roles
  FOR user_record IN 
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.user_roles r ON u.id = r.user_id
    WHERE r.id IS NULL
  LOOP
    -- Assign merchant role by default for backfill
    BEGIN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (user_record.id, 'merchant');
      
      RAISE NOTICE 'Backfilled role for user: %', user_record.email;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to backfill role for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;

  IF backfill_count > 0 THEN
    RAISE NOTICE 'Backfilled % existing users', backfill_count;
  END IF;
END $$;

-- ============================================================================
-- Success message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '1. Created handle_new_user() trigger function';
  RAISE NOTICE '2. Added trigger on auth.users table';
  RAISE NOTICE '3. Backfilled existing users (if any)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 New users will automatically get:';
  RAISE NOTICE '   - Profile record in profiles table';
  RAISE NOTICE '   - Role assignment (merchant or admin)';
  RAISE NOTICE '';
  RAISE NOTICE '📧 Admin email pattern: *@kazinikazi.co.ke';
  RAISE NOTICE '👥 First admin will be auto-assigned admin role';
  RAISE NOTICE '👥 Subsequent admins must be created by existing admins';
END $$;

