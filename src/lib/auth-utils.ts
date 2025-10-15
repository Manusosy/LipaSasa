import { supabase } from '@/integrations/supabase/client';

export interface UserRole {
  role: 'admin' | 'merchant' | 'user';
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    return !error && data !== null;
  } catch {
    return false;
  }
}

/**
 * Check if the current user is a merchant
 */
export async function isMerchant(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'merchant')
      .single();

    return !error && data !== null;
  } catch {
    return false;
  }
}

/**
 * Get the user's role
 */
export async function getUserRole(): Promise<'admin' | 'merchant' | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return data.role as 'admin' | 'merchant';
  } catch {
    return null;
  }
}

/**
 * Redirect user to their appropriate dashboard based on role
 */
export async function redirectToDashboard(navigate: (path: string) => void) {
  const role = await getUserRole();
  
  if (role === 'admin') {
    navigate('/admin');
  } else if (role === 'merchant') {
    navigate('/dashboard');
  } else {
    // Default to merchant dashboard
    navigate('/dashboard');
  }
}

/**
 * Check if user has access to admin routes
 */
export async function requireAdmin(navigate: (path: string) => void): Promise<boolean> {
  const isAdminUser = await isAdmin();
  
  if (!isAdminUser) {
    navigate('/dashboard');
    return false;
  }
  
  return true;
}

/**
 * Check if user has access to merchant routes
 */
export async function requireMerchant(navigate: (path: string) => void): Promise<boolean> {
  const isMerchantUser = await isMerchant();
  
  if (!isMerchantUser) {
    navigate('/admin');
    return false;
  }

  // Check if user is banned or suspended
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (profile?.status === 'banned' || profile?.status === 'suspended') {
      // Sign out the user
      await supabase.auth.signOut();
      navigate('/auth');
      return false;
    }
  } catch (error) {
    console.error('Error checking user status:', error);
  }
  
  return true;
}

